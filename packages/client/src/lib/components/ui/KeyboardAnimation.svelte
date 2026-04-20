<script lang="ts">
interface Props {
	pressedKeys: Set<string>;
}

const { pressedKeys }: Props = $props();

// Map of key codes to display labels
const keyLabels: Record<string, string> = {
	Space: "Space",
	ArrowUp: "↑",
	ArrowDown: "↓",
	ArrowLeft: "←",
	ArrowRight: "→",
};

// Relevant keys for Bluetooth control: letters (a-z), numbers (0-9), space, and arrows
const relevantKeys = new Set([
	...Array.from({ length: 26 }, (_, i) => `Key${String.fromCharCode(65 + i)}`), // KeyA-KeyZ
	...Array.from({ length: 10 }, (_, i) => `Digit${i}`), // Digit0-Digit9
	"Space",
	"ArrowUp",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight",
]);

// Main keyboard layout with only relevant keys shown, null for blank placeholders
const displayKeys = [
	[
		null,
		"Digit1",
		"Digit2",
		"Digit3",
		"Digit4",
		"Digit5",
		"Digit6",
		"Digit7",
		"Digit8",
		"Digit9",
		"Digit0",
		null,
		null,
		null,
	],
	[
		null,
		"KeyQ",
		"KeyW",
		"KeyE",
		"KeyR",
		"KeyT",
		"KeyY",
		"KeyU",
		"KeyI",
		"KeyO",
		"KeyP",
		null,
		null,
		null,
	],
	[
		null,
		"KeyA",
		"KeyS",
		"KeyD",
		"KeyF",
		"KeyG",
		"KeyH",
		"KeyJ",
		"KeyK",
		"KeyL",
		null,
		null,
		null,
	],
	[
		null,
		"KeyZ",
		"KeyX",
		"KeyC",
		"KeyV",
		"KeyB",
		"KeyN",
		"KeyM",
		null,
		null,
		null,
		null,
	],
	[
		null,
		null,
		null,
		"Space",
		"ArrowLeft",
		["ArrowUp", "ArrowDown"],
		"ArrowRight",
	],
];

function isPressed(code: string | null): boolean {
	return code !== null && pressedKeys.has(code);
}

function getKeyLabel(code: string | null): string {
	if (code === null) return "";
	if (keyLabels[code]) {
		return keyLabels[code];
	}
	// Extract letter from KeyX format
	if (code.startsWith("Key")) {
		return code.slice(3);
	}
	// Extract digit from DigitX format
	if (code.startsWith("Digit")) {
		return code.slice(5);
	}
	return code;
}

function getKeyWidth(code: string | null): string {
	if (code === null) return "40px";
	if (code === "Space") {
		return "300px";
	}
	return "40px";
}
</script>

{#snippet key(keyCode: string)}
	<div
		class="key relative flex items-center justify-center h-10 px-3 border-2 border-text-muted border-b-4 border-b-black/30 rounded-md text-xs font-semibold transition-all duration-100 select-none cursor-default shadow-[0_2px_0_rgba(0,0,0,0.2),0_4px_4px_rgba(0,0,0,0.1)] before:content-[''] before:absolute before:inset-0 before:rounded before:bg-gradient-to-b before:from-white/10 before:to-transparent before:pointer-events-none
 		{isPressed(keyCode) ? 'bg-accent text-on-accent !border-accent border-b-2 translate-y-0.5 shadow-[0_1px_0_rgba(0,0,0,0.2),0_2px_2px_rgba(0,0,0,0.1)]' : 'bg-bg text-on-bg'}
			{keyCode === 'Space' ? 'min-w-[300px]' : ''}"
		style="width: {getKeyWidth(keyCode)}"
	>
		{getKeyLabel(keyCode)}
	</div>
{/snippet}

<div class="flex flex-row gap-5 items-start p-5 bg-bg-tint rounded-xl border border-text-muted max-w-fit mx-auto">
	<div class="flex flex-col gap-2">
		{#each displayKeys as row}
			<div class="flex gap-1.5 justify-center items-center">
				{#each row as keyCode}
					{#if keyCode === null}
						<div class="h-10 w-10 bg-bg border-2 border-text-muted rounded-md"></div>
					{:else if Array.isArray(keyCode)}
                        <div class="flex flex-col items-center h-10">
                            {#each keyCode as code}
                                <div
                                    class="key relative flex flex-1 items-center justify-center w-10 px-3 border-2 border-text-muted border-b-4 border-b-black/30 rounded-md text-xs font-semibold transition-all duration-100 select-none cursor-default shadow-[0_2px_0_rgba(0,0,0,0.2),0_4px_4px_rgba(0,0,0,0.1)] before:content-[''] before:absolute before:inset-0 before:rounded before:bg-gradient-to-b before:from-white/10 before:to-transparent before:pointer-events-none
                                        {isPressed(code) ? 'bg-accent text-on-accent !border-accent border-b-2 translate-y-0.5' : 'bg-bg text-on-bg'}"
                                >{getKeyLabel(code)}</div>
                            {/each}
                        </div>
					{:else}
						{@render key(keyCode)}
					{/if}
				{/each}
			</div>
		{/each}
	</div>
</div>
