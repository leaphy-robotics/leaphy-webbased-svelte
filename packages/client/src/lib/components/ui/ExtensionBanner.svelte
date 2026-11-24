<script lang="ts">
import StarlingRobot from "./StarlingRobot.svelte";

interface Props {
	/** Extension id (e.g. "l_lists") or "connect" for the connect-robot illustration */
	id: string;
	/** Category colour of the extension, as a hex colour */
	color: string;
	/** Render without colour, used for incompatible extensions */
	muted?: boolean;
}

const { id, color, muted = false }: Props = $props();

/** Mix a hex colour with black */
function shade(hex: string, amount: number) {
	const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
	if (!match) return "rgba(0, 0, 0, 0.3)";
	const value = Number.parseInt(match[1], 16);
	const channel = (shift: number) =>
		Math.round(((value >> shift) & 255) * (1 - amount));
	return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`;
}

/** Mix a hex colour with white */
function tint(hex: string, amount: number) {
	const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
	if (!match) return "#fff";
	const value = Number.parseInt(match[1], 16);
	const channel = (shift: number) => {
		const c = (value >> shift) & 255;
		return Math.round(c + (255 - c) * amount);
	};
	return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`;
}

const dark = $derived(shade(color, 0.35));
// The robot is drawn slightly tinted so the white prop stays the focus
const robotLight = $derived(tint(color, 0.78));

// Neutral tones of the real Starling, used on the light connect banner
const NAVY = "#454459";
const GREY = "#a3a5b0";
// Leaphy eye green
const GREEN = "#0fb801";

// The Starling is 312 x 208 units unscaled
const robot = { x: 40, y: 59, scale: 0.32 };
const mlLayers = [
	[66, 90, 114],
	[54, 78, 102, 126],
	[78, 102],
];
</script>

{#if id === "connect"}
	<!-- Connect: Starling plugged into a laptop, on a soft tint so the banner stays calm -->
	<svg viewBox="0 0 360 120" class="block w-full h-auto" role="img" aria-hidden="true">
		<rect width="360" height="120" style:fill="color-mix(in srgb, {color} 10%, var(--background))" />

		<path d="M168 92 C 192 106, 206 96, 230 90" fill="none" stroke={NAVY} stroke-width="3.5" stroke-linecap="round" />
		<rect x="224" y="85" width="12" height="9" rx="2" fill={NAVY} />

		<StarlingRobot x={64} y={24} scale={0.36} light={GREY} dark={NAVY} accent={GREEN} eye="#fff" />

		<g transform="translate(240 28)">
			<rect width="84" height="56" rx="6" fill={NAVY} />
			<rect x="6" y="6" width="72" height="44" rx="3" style:fill="var(--background)" />
			<circle cx="24" cy="28" r="9" fill="#0fb801" />
			<path d="M19.5 28 l3 3 l6 -6" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
			<rect x="38" y="21" width="30" height="5" rx="2.5" fill={NAVY} />
			<rect x="38" y="30" width="20" height="5" rx="2.5" fill={GREY} />
			<rect x="-8" y="58" width="100" height="8" rx="4" fill={GREY} />
		</g>
	</svg>
{:else}
<svg
	viewBox="0 0 320 180"
	class="block w-full h-auto"
	style:filter={muted ? "grayscale(1)" : undefined}
	role="img"
	aria-hidden="true"
>
	<rect width="320" height="180" fill={color} />

	{#if id === "l_mesh"}
		<!-- Three Starlings talking to each other -->
		<g fill="none" stroke="#fff" stroke-opacity="0.7" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="1 7">
			<path d="M120 104 L206 66" />
			<path d="M120 118 L206 132" />
			<path d="M239 84 L239 113" />
		</g>
		<ellipse cx="78" cy="130" rx="44" ry="4" fill={dark} fill-opacity="0.3" />
		<ellipse cx="240" cy="85" rx="32" ry="3" fill={dark} fill-opacity="0.3" />
		<ellipse cx="240" cy="149" rx="32" ry="3" fill={dark} fill-opacity="0.3" />
		<StarlingRobot x={34} y={74} scale={0.28} light={robotLight} eye="#fff" {dark} accent={GREEN} />
		<StarlingRobot x={206} y={40} scale={0.22} light={robotLight} eye="#fff" {dark} accent={GREEN} />
		<StarlingRobot x={206} y={104} scale={0.22} light={robotLight} eye="#fff" {dark} accent={GREEN} />
	{:else}
		<!-- Stage behind the prop and a shadow under the robot -->
		<circle cx="238" cy="90" r="62" fill="#fff" fill-opacity="0.08" />
		<ellipse cx="90" cy="124" rx="50" ry="4" fill={dark} fill-opacity="0.3" />
		<StarlingRobot {...robot} light={robotLight} eye="#fff" {dark} accent={GREEN} />
	{/if}

	{#if id === "l_lists"}
		<!-- An item flowing into an indexed list -->
		<path d="M138 100 C 164 100, 164 61, 183 61" fill="none" stroke="#fff" stroke-opacity="0.7" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="1 6" />
		{#each [0, 1, 2] as i}
			{@const y = 50 + i * 28}
			<rect x="186" {y} width="104" height="22" rx="6" fill="#fff" />
			<rect x="192" y={y + 5} width="18" height="12" rx="3" fill={dark} />
			<text x="201" y={y + 14.5} font-size="9" font-weight="bold" font-family="sans-serif" fill="#fff" text-anchor="middle">{i}</text>
			<rect x="218" y={y + 9} width={[52, 36, 60][i]} height="4" rx="2" fill={dark} fill-opacity="0.3" />
		{/each}
	{:else if id === "l_operators"}
		<!-- Calculating with numbers and text -->
		<g font-family="sans-serif" font-weight="bold" font-size="15" text-anchor="middle">
			<rect x="182" y="56" width="112" height="30" rx="8" fill="#fff" />
			<text x="238" y="76" fill={dark}>3 + 4 <tspan fill={color}>= 7</tspan></text>
			<rect x="182" y="96" width="112" height="30" rx="8" fill="#fff" />
			<text x="238" y="116" fill={dark}>"Hi" + "!"</text>
		</g>
	{:else if id === "l_ml"}
		<!-- Sensor data through a network to a recognised class -->
		<g fill="none" stroke="#fff" stroke-opacity="0.7" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="1 6">
			{#each mlLayers[0] as y}
				<path d="M138 101 L186 {y}" />
			{/each}
		</g>
		<g transform="translate(196 0)">
			{#each mlLayers as layer, l}
				{#if l < mlLayers.length - 1}
					{#each layer as y1}
						{#each mlLayers[l + 1] as y2}
							<line x1={l * 36} y1={y1} x2={(l + 1) * 36} y2={y2} stroke="#fff" stroke-opacity="0.45" stroke-width="2" />
						{/each}
					{/each}
				{/if}
			{/each}
			{#each mlLayers as layer, l}
				{#each layer as y, n}
					{#if l === mlLayers.length - 1 && n === 0}
						<circle cx={l * 36} cy={y} r="10" fill={GREEN} />
						<path d="M{l * 36 - 4} {y} l3 3 l5 -6" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
					{:else}
						<circle cx={l * 36} cy={y} r="7" fill="#fff" />
					{/if}
				{/each}
			{/each}
		</g>
	{:else if id === "l_teachable_machine"}
		<!-- A recorded sound sorted into classes -->
		<rect x="184" y="52" width="108" height="50" rx="8" fill="#fff" />
		{#each [10, 20, 30, 34, 24, 30, 16, 22, 12] as h, i}
			<rect x={194 + i * 10} y={77 - h / 2} width="5" height={h} rx="2.5" fill={color} />
		{/each}
		<rect x="184" y="110" width="52" height="18" rx="9" fill="#fff" />
		<circle cx="195" cy="119" r="4" fill={GREEN} />
		<rect x="203" y="117" width="24" height="4" rx="2" fill={dark} fill-opacity="0.35" />
		<rect x="240" y="110" width="52" height="18" rx="9" fill="#fff" fill-opacity="0.3" />
		<circle cx="251" cy="119" r="4" fill="#fff" />
		<rect x="259" y="117" width="24" height="4" rx="2" fill="#fff" fill-opacity="0.7" />
	{:else if id === "l_ble"}
		<!-- Driving the robot with the arrow keys over bluetooth -->
		<g fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round">
			<path d="M154 80 a12 12 0 0 1 0 20" stroke-opacity="0.5" />
			<path d="M162 73 a22 22 0 0 1 0 34" stroke-opacity="0.7" />
		</g>
		<rect x="224" y="64" width="28" height="26" rx="5" fill={dark} />
		<rect x="192" y="94" width="28" height="26" rx="5" fill="#fff" />
		<rect x="224" y="94" width="28" height="26" rx="5" fill="#fff" />
		<rect x="256" y="94" width="28" height="26" rx="5" fill="#fff" />
		<path d="M238 71 L244 81 H232 Z" fill="#fff" />
		<path d="M199 107 L209 101 V113 Z" fill={dark} />
		<path d="M238 113 L244 103 H232 Z" fill={dark} />
		<path d="M277 107 L267 101 V113 Z" fill={dark} />
		<circle cx="282" cy="62" r="13" fill="#fff" />
		<path d="M278 56 L287 65 L282 70 L282 54 L287 59 L278 68" fill="none" stroke={color} stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" />
	{/if}
</svg>
{/if}
