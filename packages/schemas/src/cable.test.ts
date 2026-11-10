import { describe, expect, it } from "vitest";
import { routeCable, WIRE_PITCH } from "./cable";

const pins = (x: number, ...ys: number[]) => ys.map((y) => ({ x, y }));

describe("routeCable", () => {
	it("runs the wires next to each other, ending on their own pins", () => {
		const pinsA = pins(0, 90, 100, 110);
		const pinsB = pins(200, 90, 100, 110);
		const wires = routeCable(
			[
				{ x: 0, y: 100 },
				{ x: 200, y: 100 },
			],
			pinsA,
			pinsB,
		);

		wires.forEach(({ points }, index) => {
			expect(points[0]).toEqual(pinsA[index]);
			expect(points[points.length - 1]).toEqual(pinsB[index]);
		});

		const middle = wires.map(({ points }) => points[1].y);
		expect(middle[0]).toBeCloseTo(100 - WIRE_PITCH);
		expect(middle[1]).toBeCloseTo(100);
		expect(middle[2]).toBeCloseTo(100 + WIRE_PITCH);
	});

	it("stays in order around corners, staying parallel", () => {
		const wires = routeCable(
			[
				{ x: 0, y: 100 },
				{ x: 100, y: 100 },
				{ x: 100, y: 300 },
			],
			pins(0, 95, 105),
			[
				{ x: 95, y: 300 },
				{ x: 105, y: 300 },
			],
		);

		// Index 2 is the corner, the wire on the outside takes the wide turn
		const [outer, inner] = wires;
		expect(outer.points[2].x).toBeCloseTo(100 + WIRE_PITCH / 2);
		expect(outer.points[2].y).toBeCloseTo(100 - WIRE_PITCH / 2);
		expect(inner.points[2].x).toBeCloseTo(100 - WIRE_PITCH / 2);
		expect(inner.points[2].y).toBeCloseTo(100 + WIRE_PITCH / 2);
		expect(outer.radii[2]).toBeGreaterThan(inner.radii[2]);
	});

	it("keeps the order of the end with the most spread out pins", () => {
		// All pins are on top of each other from the direction of the route at the start
		const wires = routeCable(
			[
				{ x: 0, y: 100 },
				{ x: 200, y: 100 },
			],
			[
				{ x: 0, y: 100 },
				{ x: -10, y: 100 },
			],
			pins(200, 110, 90),
		);

		const [first, second] = wires.map(({ points }) => points[1].y);
		expect(first).toBeGreaterThan(second);
	});

	it("doesn't let a fan go past the middle of a short route", () => {
		const wires = routeCable(
			[
				{ x: 0, y: 0 },
				{ x: 10, y: 0 },
			],
			pins(0, -20, 20),
			pins(10, -20, 20),
		);

		for (const { points } of wires) {
			for (const { x } of points) {
				expect(x).toBeGreaterThanOrEqual(0);
				expect(x).toBeLessThanOrEqual(10);
			}
		}
	});

	it("doesn't send wires backwards on a segment shorter than the cable", () => {
		const route = [
			{ x: 0, y: 0 },
			{ x: 100, y: 0 },
			{ x: 100, y: 2 },
			{ x: 0, y: 2 },
		];
		const wires = routeCable(
			route,
			pins(0, -5, -1, 3, 7),
			pins(0, -5, -1, 3, 7).reverse(),
		);

		for (const { points } of wires) {
			for (const { x, y } of points) {
				expect(Number.isFinite(x) && Number.isFinite(y)).toBe(true);
			}
		}
	});
});
