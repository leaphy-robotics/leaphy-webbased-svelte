<svelte:options namespace="svg" />

<script lang="ts">
/**
 * Two-tone Leaphy Starling, simplified from assets/robots/icons/l_starling.svg.
 * Drawn with a light colour and a dark tone so it blends into any coloured banner.
 * The group is 312 x 208 units before scaling, with its top-left at (x, y).
 */
interface Props {
	x?: number;
	y?: number;
	scale?: number;
	/** Colour of the plates, standoffs and eye rings */
	light?: string;
	/** Colour of the body */
	dark: string;
	/** Colour of the iris */
	accent: string;
	/** Colour of the eye rings and highlights, defaults to the light colour */
	eye?: string;
}

const {
	x = 0,
	y = 0,
	scale = 1,
	light = "#fff",
	dark,
	accent,
	eye,
}: Props = $props();

const eyeColor = $derived(eye ?? light);
</script>

<g transform="translate({x} {y}) scale({scale}) translate(-69 -98)">
	<!-- Wires -->
	<path d="M137 172 C 137 112, 227 112, 227 172" fill="none" stroke={dark} stroke-width="7" stroke-linecap="round" />
	<path d="M214 172 C 214 100, 300 100, 300 172" fill="none" stroke={light} stroke-width="7" stroke-linecap="round" />

	<!-- Connectors -->
	<rect x="128" y="150" width="20" height="24" rx="3" fill={light} />
	<rect x="210" y="150" width="20" height="24" rx="3" fill={light} />
	<rect x="288" y="150" width="20" height="24" rx="3" fill={light} />

	<!-- Standoffs -->
	<rect x="82" y="176" width="22" height="108" fill={light} />
	<rect x="344" y="176" width="22" height="108" fill={light} />

	<!-- Body -->
	<rect x="122" y="180" width="204" height="96" rx="6" fill={dark} />

	<!-- Plates -->
	<rect x="70" y="168" width="310" height="12" rx="6" fill={light} />
	<rect x="70" y="274" width="310" height="12" rx="6" fill={light} />

	<!-- Ultrasonic eyes -->
	<circle cx="190" cy="228" r="28" fill={eyeColor} />
	<circle cx="256" cy="228" r="28" fill={eyeColor} />
	<circle cx="190" cy="228" r="16" fill={accent} />
	<circle cx="256" cy="228" r="16" fill={accent} />
	<circle cx="194" cy="224" r="6" fill={eyeColor} />
	<circle cx="260" cy="224" r="6" fill={eyeColor} />
</g>
