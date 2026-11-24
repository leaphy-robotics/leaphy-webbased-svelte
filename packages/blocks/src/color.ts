/**
 * Blocks with a color format dropdown (RGB or HSV) and three channel inputs, like the
 * LED strip blocks. All channels go from 0 to 255, the way FastLED uses them.
 */

/** Name of the format dropdown */
export const COLOR_FORMAT_FIELD = "FORMAT";

/** Names of the three channel inputs, red/green/blue or hue/saturation/value */
export const COLOR_CHANNELS = ["CHANNEL_1", "CHANNEL_2", "CHANNEL_3"] as const;

export type ColorFormat = "RGB" | "HSV";

/** Labels shown in front of the channel inputs, the letters of the format */
export const COLOR_CHANNEL_LABELS: Record<ColorFormat, string[]> = {
	RGB: ["R", "G", "B"],
	HSV: ["H", "S", "V"],
};

type Channels = [number, number, number];

const clamp = (n: number) =>
	Number.isFinite(n) ? Math.min(255, Math.max(0, n)) : 0;

/** The hue wraps around, 256 is red again */
const wrap = (n: number) => (Number.isFinite(n) ? ((n % 256) + 256) % 256 : 0);

export function hsvToRgb([hue, saturation, value]: number[]): Channels {
	const h = (wrap(hue) / 256) * 6;
	const s = clamp(saturation) / 255;
	const v = clamp(value);

	const sector = Math.floor(h);
	const f = h - sector;
	const p = v * (1 - s);
	const q = v * (1 - s * f);
	const t = v * (1 - s * (1 - f));

	const rgb: Channels[] = [
		[v, t, p],
		[q, v, p],
		[p, v, t],
		[p, q, v],
		[t, p, v],
		[v, p, q],
	];
	return rgb[sector].map(Math.round) as Channels;
}

export function rgbToHsv(channels: number[]): Channels {
	const [r, g, b] = channels.map(clamp);
	const max = Math.max(r, g, b);
	const delta = max - Math.min(r, g, b);

	let h = 0;
	if (delta > 0) {
		if (max === r) h = ((g - b) / delta + 6) % 6;
		else if (max === g) h = (b - r) / delta + 2;
		else h = (r - g) / delta + 4;
	}

	return [
		Math.round((h / 6) * 256) % 256,
		max === 0 ? 0 : Math.round((delta / max) * 255),
		Math.round(max),
	];
}

/** Convert channel values from one format to the other */
export function convertColor(channels: number[], to: ColorFormat): Channels {
	return to === "HSV" ? rgbToHsv(channels) : hsvToRgb(channels);
}
