<script lang="ts">
import {
	autoPlacement,
	autoUpdate,
	computePosition,
	offset,
} from "@floating-ui/dom";
import { untrack } from "svelte";
import ColorPickerState from "$state/colorPicker.svelte";

const SWATCHES = [
	"#d43c3c",
	"#de7c3b",
	"#d9b53f",
	"#75b342",
	"#23845a",
	"#32a5a9",
	"#06778f",
	"#4095ce",
	"#a500cf",
	"#000000",
	"#808080",
	"#ffffff",
];

// --- color math -----------------------------------------------------------
function hexToRgb(hex: string): [number, number, number] | undefined {
	const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
	if (!match) return;
	let h = match[1];
	if (h.length === 3) h = [...h].map((c) => c + c).join("");
	const n = Number.parseInt(h, 16);
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number) {
	return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
	r /= 255;
	g /= 255;
	b /= 255;
	const max = Math.max(r, g, b);
	const d = max - Math.min(r, g, b);
	let h = 0;
	if (d) {
		if (max === r) h = ((g - b) / d) % 6;
		else if (max === g) h = (b - r) / d + 2;
		else h = (r - g) / d + 4;
		h = (h * 60 + 360) % 360;
	}
	return [h, max ? d / max : 0, max];
}

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
	const f = (n: number) => {
		const k = (n + h / 60) % 6;
		return (v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255;
	};
	return [f(5), f(3), f(1)];
}

// --- state ----------------------------------------------------------------
const initial = rgbToHsv(
	...(hexToRgb(ColorPickerState.color) ?? [6, 119, 143]),
);
let hue = $state(initial[0]);
let sat = $state(initial[1]);
let val = $state(initial[2]);

const hex = $derived(rgbToHex(...hsvToRgb(hue, sat, val)));
let hexInput = $state(ColorPickerState.color);

function commit() {
	hexInput = hex;
	ColorPickerState.update(hex);
}

function applyHex(value: string) {
	const rgb = hexToRgb(value);
	if (!rgb) return false;
	const [h, s, v] = rgbToHsv(...rgb);
	// keep hue when picking a grey so the slider doesn't jump
	if (s > 0) hue = h;
	sat = s;
	val = v;
	return true;
}

function setHex(value: string) {
	if (applyHex(value)) commit();
}

// follow changes made from outside, e.g. the edited blocks changing
$effect(() => {
	const external = ColorPickerState.color.toLowerCase();
	if (external === untrack(() => hex)) return;
	if (applyHex(external)) hexInput = external;
});

// --- dragging -------------------------------------------------------------
function drag(node: HTMLElement, onmove: (x: number, y: number) => void) {
	function move(e: PointerEvent) {
		const rect = node.getBoundingClientRect();
		const clamp = (n: number) => Math.min(1, Math.max(0, n));
		onmove(
			clamp((e.clientX - rect.left) / rect.width),
			clamp((e.clientY - rect.top) / rect.height),
		);
		commit();
	}
	function down(e: PointerEvent) {
		node.setPointerCapture(e.pointerId);
		node.addEventListener("pointermove", move);
		move(e);
	}
	function up(e: PointerEvent) {
		node.releasePointerCapture(e.pointerId);
		node.removeEventListener("pointermove", move);
	}
	node.addEventListener("pointerdown", down);
	node.addEventListener("pointerup", up);
	return {
		destroy() {
			node.removeEventListener("pointerdown", down);
			node.removeEventListener("pointerup", up);
			node.removeEventListener("pointermove", move);
		},
	};
}

function onkey(e: KeyboardEvent, axis: "sv" | "hue") {
	const step = e.shiftKey ? 0.1 : 0.01;
	const dirs: Record<string, [number, number]> = {
		ArrowLeft: [-1, 0],
		ArrowRight: [1, 0],
		ArrowUp: [0, 1],
		ArrowDown: [0, -1],
	};
	const dir = dirs[e.key];
	if (!dir) return;
	e.preventDefault();
	if (axis === "hue") {
		hue = Math.min(360, Math.max(0, hue + (dir[0] || dir[1]) * step * 360));
	} else {
		sat = Math.min(1, Math.max(0, sat + dir[0] * step));
		val = Math.min(1, Math.max(0, val + dir[1] * step));
	}
	commit();
}

// --- positioning / dismissal ---------------------------------------------
let element: HTMLDivElement;
let position = $state<{ x: number; y: number }>();

async function calculatePosition() {
	const { anchor } = ColorPickerState;
	if (!anchor) return;

	position = await computePosition(anchor, element, {
		strategy: "fixed",
		placement: "bottom",
		middleware: [
			offset(8),
			autoPlacement({ allowedPlacements: ["bottom", "top"] }),
		],
	});
}

function onpointerdown(event: PointerEvent) {
	if (element.contains(event.target as Node)) return;
	if (ColorPickerState.trigger?.contains(event.target as Node)) return;
	ColorPickerState.close();
}

function onkeydown(event: KeyboardEvent) {
	if (event.key === "Escape") ColorPickerState.close(false);
	if (event.key === "Enter") ColorPickerState.close();
}

// Keep following the anchor: blocks resize as values change, and the workspace scrolls/zooms via transforms.
$effect(() => {
	const anchor = ColorPickerState.anchor;
	if (!anchor) return;
	return autoUpdate(anchor, element, () => untrack(calculatePosition), {
		animationFrame: true,
	});
});
</script>

<svelte:window onpointerdowncapture={onpointerdown} {onkeydown} />

<div
	bind:this={element}
	class="fixed w-[232px] p-3 rounded-2xl bg-bg text-on-bg shadow-[var(--shadow-el2)] flex flex-col gap-3 select-none"
	style:top={`${position?.y ?? 0}px`}
	style:left={`${position?.x ?? 0}px`}
	style:visibility={position ? "visible" : "hidden"}
	role="dialog"
	aria-label="Color picker"
>
	<!-- saturation / value -->
	<div
		class="relative h-36 rounded-xl cursor-crosshair touch-none outline-none focus-visible:ring-2 ring-primary"
		style:background-color={`hsl(${hue} 100% 50%)`}
		style:background-image="linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)"
		use:drag={(x, y) => {
			sat = x;
			val = 1 - y;
		}}
		onkeydown={(e) => onkey(e, "sv")}
		tabindex="0"
		role="slider"
		aria-label="Saturation and brightness"
		aria-valuenow={Math.round(sat * 100)}
	>
		<div
			class="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_#0004,0_1px_4px_#0006] pointer-events-none"
			style:left={`${sat * 100}%`}
			style:top={`${(1 - val) * 100}%`}
			style:background-color={hex}
		></div>
	</div>

	<!-- hue -->
	<div
		class="relative h-3 rounded-full cursor-pointer touch-none outline-none focus-visible:ring-2 ring-primary"
		style:background="linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)"
		use:drag={(x) => (hue = x * 360)}
		onkeydown={(e) => onkey(e, "hue")}
		tabindex="0"
		role="slider"
		aria-label="Hue"
		aria-valuemin={0}
		aria-valuemax={360}
		aria-valuenow={Math.round(hue)}
	>
		<div
			class="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_#0004,0_1px_4px_#0006] pointer-events-none"
			style:left={`${(hue / 360) * 100}%`}
			style:background-color={`hsl(${hue} 100% 50%)`}
		></div>
	</div>

	<!-- swatches -->
	<div class="grid grid-cols-6 gap-1.5">
		{#each SWATCHES as swatch}
			<button
				class="aspect-square rounded-md cursor-pointer border border-black/10 transition-transform hover:scale-110
					{hex === swatch ? 'ring-2 ring-offset-2 ring-offset-bg ring-primary' : ''}"
				style:background-color={swatch}
				onclick={() => setHex(swatch)}
				aria-label={swatch}
			></button>
		{/each}
	</div>

	<!-- hex input -->
	<div class="flex items-center gap-2">
		<div
			class="size-8 shrink-0 rounded-lg border border-black/10"
			style:background-color={hex}
		></div>
		<input
			class="min-w-0 flex-1 h-8 px-2.5 rounded-lg bg-bg-tint text-on-bg font-mono text-sm uppercase outline-none focus:ring-2 ring-primary"
			bind:value={hexInput}
			oninput={() => setHex(hexInput)}
			onblur={() => (hexInput = hex)}
			spellcheck="false"
			maxlength="7"
			aria-label="Hex color"
		/>
	</div>
</div>
