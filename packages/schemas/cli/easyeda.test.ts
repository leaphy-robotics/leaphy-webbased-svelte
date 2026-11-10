import { describe, expect, it } from "vitest";
import { convertEasyEDA, getDocumentType } from "./easyeda";

const head = { docType: "3", editorVersion: "6.5.0" };

const outline = [
	"TRACK~1~10~~100 100 200 100~gge1~0",
	// Stored against the direction of the chain, so it has to be reversed
	"ARC~1~10~~M 210 110 A 10 10 0 0 0 200 100~~gge2~0",
	"TRACK~1~10~~210 110 210 200 100 200 100 100~gge3~0",
];

function pad(
	x: number,
	y: number,
	net: string,
	number: string,
	layer = 11,
	holeRadius = 1.8,
) {
	return `PAD~ELLIPSE~${x}~${y}~6~6~${layer}~${net}~${number}~${holeRadius}~~0~gge${x}${y}~0~~Y~0~0~0.2~${x},${y}`;
}

function footprint(attributes: string, ref: string, ...shapes: string[]) {
	return [
		`LIB~150~150~${attributes}~0~~gge9~1`,
		`TEXT~P~150~150~0.7~0~~3~~4~${ref}~M 150 150 L 151 151~~gge10~~0`,
		...shapes,
	].join("#@$");
}

const header = footprint(
	"package`HDR-1X3",
	"H1",
	pad(110, 130, "VCC", "1"),
	pad(110, 140, "+5V", "2"),
	pad(110, 150, "H1_3", "3"),
);
const resistor = footprint(
	"package`0603",
	"R1",
	pad(150, 150, "VCC", "1", 1, 0),
	pad(160, 150, "GND", "2", 1, 0),
);

describe("convertEasyEDA", () => {
	it("names connector pins after their net and falls back to the pad", () => {
		const { pins, otherPads } = convertEasyEDA({
			head,
			shape: [...outline, header, resistor],
		});

		expect(pins.map(({ name }) => name)).toEqual(["VCC", "5V", "H1.3"]);
		expect(otherPads.map(({ label }) => label)).toEqual(["R1.1", "R1.2"]);
	});

	it("gives each pin a unique name and an existing element", () => {
		const { pins, otherPads, svg } = convertEasyEDA({
			head,
			shape: [
				...outline,
				footprint(
					"package`HDR-1X2",
					"J1",
					pad(110, 130, "GND", "1"),
					pad(110, 140, "GND", "2"),
				),
				resistor,
			],
		});

		expect(pins.map(({ name }) => name)).toEqual(["GND", "GND2"]);
		for (const { svgId } of [...pins, ...otherPads]) {
			expect(svg.split(`id="${svgId}"`)).toHaveLength(2);
		}
	});

	it("selects SMD connectors next to loose through hole pads", () => {
		const { pins } = convertEasyEDA({
			head,
			shape: [
				...outline,
				footprint("package`JST-SH", "J1", pad(150, 150, "SDA", "1", 1, 0)),
				pad(120, 120, "TEST", "1"),
			],
		});

		expect(pins.map(({ name }) => name)).toEqual(["SDA", "TEST"]);
	});

	it("extends header pins past the edge of the board", () => {
		const { svg } = convertEasyEDA({ head, shape: [...outline, header] });
		const [x, , width] = (svg.match(/viewBox="([^"]+)"/)?.[1] ?? "")
			.split(" ")
			.map(Number);

		expect(x).toBeLessThan(100);
		expect(x + width).toBe(210);
	});

	it("chains outline segments in any direction and order", () => {
		const { svg, warnings } = convertEasyEDA({
			head,
			shape: [...outline, header],
		});

		expect(warnings).toEqual([]);
		// The reversed arc has to bulge away from the board, through this point
		const board = svg.match(/id="board".* d="([^"]+)"/)?.[1] ?? "";
		const points = board.match(/-?[\d.]+ -?[\d.]+/g)?.map((point) => {
			const [x, y] = point.split(" ").map(Number);
			return Math.hypot(x - 200, y - 110);
		});
		expect(points?.filter((radius) => Math.abs(radius - 10) < 0.1).length).toBe(
			points?.filter((radius) => radius < 11).length,
		);
		expect(board).toContain("207.");
	});

	it("traces outlines with overlapping and overshooting lines", () => {
		const { svg, warnings } = convertEasyEDA({
			head,
			shape: [
				"TRACK~1~10~~100 100 200 100~gge1~0",
				// The right side is drawn in overlapping pieces
				"TRACK~1~10~~200 100 200 160~gge2~0",
				"TRACK~1~10~~200 180 200 140~gge3~0",
				"TRACK~1~10~~200 170 200 200~gge4~0",
				// This line overshoots the corner on the left
				"TRACK~1~10~~90 200 200 200~gge5~0",
				"TRACK~1~10~~100 200.4 100 100.1~gge6~0",
				header,
			],
		});

		expect(warnings).toEqual([]);
		expect(svg).toContain('d="M 100 100 L 200 100 L 200 200 L 100 200 Z"');
	});

	it("doesn't treat mounting holes as pins and cuts them out", () => {
		const { svg, pins, otherPads } = convertEasyEDA({
			head,
			shape: [
				...outline,
				header,
				"PAD~ELLIPSE~180~180~14.5~14.5~11~~1~6.5~~180~gge40~0~~Y~1",
			],
		});

		expect(pins.map(({ name }) => name)).toEqual(["VCC", "5V", "H1.3"]);
		expect(otherPads).toHaveLength(1);
		expect(svg).toContain("M 173.5 180 a 6.5 6.5");
	});

	it("only draws pins out of the board if nothing is in the way", () => {
		const hasPins = (...shape: string[]) =>
			convertEasyEDA({ head, shape: [...outline, ...shape] }).svg.includes(
				'fill="#B8AF82"',
			);

		expect(hasPins(header)).toBe(true);
		// Vertical headers point up out of the board
		expect(
			hasPins(
				footprint(
					"package`HDR-TH_1P-P2.54-V-M",
					"H1",
					pad(110, 130, "A", "1"),
					pad(110, 140, "B", "2"),
				),
			),
		).toBe(false);
		// A pad between the header and the edge of the board
		expect(hasPins(header, pad(103, 140, "C", "1"))).toBe(false);
	});

	it("staggers the tips of bent headers with multiple rows", () => {
		const { svg, pins } = convertEasyEDA({
			head,
			shape: [
				...outline,
				footprint(
					"package`HDR-TH_4P-P2.54-H-M-R2-C2-S2.54",
					"H1",
					pad(130, 140, "A", "1"),
					pad(140, 140, "B", "2"),
					pad(130, 150, "C", "3"),
					pad(140, 150, "D", "4"),
					// The silkscreen shows that the pins point to the left
					"TRACK~1~3~~90 136 125 136~gge50~0",
				),
			],
		});

		const tips = pins.map(({ svgId }) => {
			const tip = svg.match(
				new RegExp(`<rect x="([\\d.]+)" y="([\\d.]+)"[^>]*id="${svgId}"`),
			);
			return { x: Number(tip?.[1]), y: Number(tip?.[2]) };
		});

		expect(new Set(tips.map(({ y }) => y)).size).toBe(4);
		for (const { x } of tips) expect(x).toBeLessThan(120);
		// Pins of the row furthest from the edge stick out further
		expect(tips[1].x).toBeLessThan(tips[0].x);
		// The outline in the silkscreen is replaced by the drawn header
		expect(svg).not.toContain('points="90,136');
	});

	it("warns about an open outline and a missing outline", () => {
		expect(
			convertEasyEDA({ head, shape: [outline[0], header] }).warnings[0],
		).toContain("gap");
		expect(convertEasyEDA({ head, shape: [header] }).warnings[0]).toContain(
			"no board outline",
		);
	});

	it("shows the bottom side when most parts are on it", () => {
		const bottom = footprint(
			"package`0603",
			"R2",
			pad(150, 150, "A", "1", 2, 0),
			pad(160, 150, "B", "2", 2, 0),
		);

		expect(
			convertEasyEDA({ head, shape: [...outline, header, bottom] }).svg,
		).toContain('<g transform="matrix(-1 0 0 1');
		expect(
			convertEasyEDA({ head, shape: [...outline, header, resistor] }).svg,
		).not.toContain("matrix(-1");
	});

	it("hides invisible text and leaves out copper", () => {
		const { svg } = convertEasyEDA({
			head,
			shape: [
				...outline,
				header,
				"TEXT~L~1~1~0.8~0~none~3~~8~A~M 1 2 L 3 4~none~gge20~~0",
				"TEXT~L~1~1~0.8~0~none~3~~8~B~M 5 6 L 7 8~~gge21~~0",
				"TRACK~1~1~VCC~9 9 11 11~gge22~0",
			],
		});

		expect(svg).not.toContain("M 1 2 L 3 4");
		expect(svg).toContain("M 5 6 L 7 8");
		expect(svg).not.toContain("9,9");
	});

	it("escapes values that are copied into the SVG", () => {
		const { svg } = convertEasyEDA({
			head,
			shape: [...outline, header, 'ARC~1~3~~M 1 1"/><script>~~gge30~0'],
		});

		expect(svg).not.toContain("<script>");
	});

	it("reads the head of older documents and wrapped documents", () => {
		expect(getDocumentType({ head: "3~3.4.10~" })).toBe("3");
		expect(
			getDocumentType({ result: { dataStr: JSON.stringify({ head }) } }),
		).toBe("3");
	});

	it("rejects documents that aren't a PCB", () => {
		expect(() => convertEasyEDA({ head: { docType: "1" }, shape: [] })).toThrow(
			"not an EasyEDA PCB",
		);
	});
});
