/**
 * Geometry of cables in the circuit schema: the wires of a cable run next to each
 * other along a single route, and fan out to their pins at both ends of the route.
 */

export interface Point {
	x: number;
	y: number;
}

export interface RoutedWire {
	points: Point[];
	/** The radius of the corner at every point */
	radii: number[];
}

/** Distance between the wires of a cable, wires are 4 wide so they just touch */
export const WIRE_PITCH = 4.2;
/** Routes need to be this far apart to keep the widest cable from touching another */
export const CABLE_SPACING = 24;

const CORNER_RADIUS = 12;
const FAN_CORNER_RADIUS = 5;
const MIN_FAN_LENGTH = 10;

function subtract(a: Point, b: Point): Point {
	return { x: a.x - b.x, y: a.y - b.y };
}

function dot(a: Point, b: Point) {
	return a.x * b.x + a.y * b.y;
}

function distance(a: Point, b: Point) {
	return Math.hypot(a.x - b.x, a.y - b.y);
}

function direction(from: Point, to: Point): Point {
	const length = distance(from, to) || 1;
	return { x: (to.x - from.x) / length, y: (to.y - from.y) / length };
}

function normal({ x, y }: Point): Point {
	return { x: -y, y: x };
}

function mean(points: Point[]): Point {
	return {
		x: points.reduce((total, { x }) => total + x, 0) / points.length,
		y: points.reduce((total, { y }) => total + y, 0) / points.length,
	};
}

/** Removes points that don't change where the route goes */
function simplify(route: Point[]) {
	const unique = route.filter(
		(point, index) => !index || distance(point, route[index - 1]) > 0.01,
	);

	return unique.filter((point, index) => {
		if (!index || index === unique.length - 1) return true;

		const before = direction(unique[index - 1], point);
		const after = direction(point, unique[index + 1]);
		return dot(before, after) < 0.9999;
	});
}

function routeLength(route: Point[]) {
	return route
		.slice(1)
		.reduce((total, point, index) => total + distance(route[index], point), 0);
}

/** Cuts the given length off of the start of a route */
function trimStart(route: Point[], length: number) {
	let remaining = length;
	for (let index = 0; index + 1 < route.length; index++) {
		const segment = distance(route[index], route[index + 1]);
		if (remaining < segment) {
			const { x, y } = direction(route[index], route[index + 1]);
			return [
				{
					x: route[index].x + x * remaining,
					y: route[index].y + y * remaining,
				},
				...route.slice(index + 1),
			];
		}
		remaining -= segment;
	}

	return route.slice(-1);
}

/** Moves a route sideways, which makes it shorter on the inside of its corners */
function offsetRoute(route: Point[], offset: number): RoutedWire {
	const normals = route
		.slice(1)
		.map((point, index) => normal(direction(route[index], point)));

	const radii: number[] = [];
	const points = route.map((point, index) => {
		const before = normals[index - 1] ?? normals[index];
		const after = normals[index] ?? normals[index - 1];
		const length = 1 + dot(before, after);

		// The cable turns towards this side if the next normal is rotated towards it
		const turn = before.x * after.y - before.y * after.x;
		radii.push(Math.max(CORNER_RADIUS - Math.sign(turn) * offset, 2));

		return length < 0.01
			? { x: point.x + before.x * offset, y: point.y + before.y * offset }
			: {
					x: point.x + ((before.x + after.x) * offset) / length,
					y: point.y + ((before.y + after.y) * offset) / length,
				};
	});

	// A segment that's shorter than the width of the cable would end up going backwards
	for (let index = 0; index + 1 < route.length; index++) {
		const expected = direction(route[index], route[index + 1]);
		if (dot(subtract(points[index + 1], points[index]), expected) < 0) {
			const middle = mean([points[index], points[index + 1]]);
			points[index] = middle;
			points[index + 1] = middle;
		}
	}

	return { points, radii };
}

function rankOf(values: number[]) {
	const order = values
		.map((value, index) => ({ value, index }))
		.sort((a, b) => a.value - b.value || a.index - b.index);

	const ranks = new Array<number>(values.length);
	order.forEach(({ index }, rank) => {
		ranks[index] = rank;
	});
	return ranks;
}

/**
 * Routes the wires of a cable, wire i runs from pinsA[i] to pinsB[i]. The order of
 * the wires is the same over the whole route, it comes from the end of the cable
 * where the pins are the furthest apart. If the other end has its pins the other
 * way around then the wires cross there, just like a real cable has to be twisted.
 */
export function routeCable(
	route: Point[],
	pinsA: Point[],
	pinsB: Point[],
): RoutedWire[] {
	const center = simplify(route);
	if (center.length < 2) center.push(mean(pinsA), mean(pinsB));

	const last = center.length - 1;
	const startDirection = direction(center[0], center[1]);
	const endDirection = direction(center[last - 1], center[last]);

	const sidewaysA = pinsA.map((pin) =>
		dot(subtract(pin, center[0]), normal(startDirection)),
	);
	const sidewaysB = pinsB.map((pin) =>
		dot(subtract(pin, center[last]), normal(endDirection)),
	);
	const spread = (values: number[]) =>
		Math.max(...values) - Math.min(...values);
	const ranks = rankOf(
		spread(sidewaysA) >= spread(sidewaysB) ? sidewaysA : sidewaysB,
	);
	const offsets = ranks.map(
		(rank) => (rank - (pinsA.length - 1) / 2) * WIRE_PITCH,
	);

	/** The cable can come together after passing the last pin, at a gentle angle */
	const fanLength = (forward: number[], sideways: number[]) =>
		Math.max(...forward, 0) +
		Math.max(
			MIN_FAN_LENGTH,
			...sideways.map((value, index) => Math.abs(value - offsets[index]) * 1.2),
		);

	let fanA = fanLength(
		pinsA.map((pin) => dot(subtract(pin, center[0]), startDirection)),
		sidewaysA,
	);
	let fanB = fanLength(
		pinsB.map((pin) => -dot(subtract(pin, center[last]), endDirection)),
		sidewaysB,
	);

	const length = routeLength(center);
	const fans = fanA + fanB;
	if (fans > length * 0.9) {
		fanA *= (length * 0.9) / fans;
		fanB *= (length * 0.9) / fans;
	}

	const trimmed = trimStart(trimStart(center, fanA).reverse(), fanB).reverse();

	return pinsA.map((pin, index) => {
		const { points, radii } = offsetRoute(trimmed, offsets[index]);
		const lastCorner = radii.length - 1;
		radii[0] = FAN_CORNER_RADIUS;
		radii[lastCorner] = FAN_CORNER_RADIUS;

		return {
			points: [pin, ...points, pinsB[index]],
			radii: [0, ...radii, 0],
		};
	});
}

/** Creates the path of a wire, its corners are rounded where the segments allow it */
export function wirePath({ points, radii }: RoutedWire, scale: number) {
	const path = new Path2D();
	path.moveTo(points[0].x * scale, points[0].y * scale);

	for (let index = 1; index + 1 < points.length; index++) {
		const point = points[index];
		const toBefore = direction(point, points[index - 1]);
		const toAfter = direction(point, points[index + 1]);
		const radius = Math.min(
			radii[index],
			distance(point, points[index - 1]) / 2,
			distance(point, points[index + 1]) / 2,
		);

		path.lineTo(
			(point.x + toBefore.x * radius) * scale,
			(point.y + toBefore.y * radius) * scale,
		);
		path.quadraticCurveTo(
			point.x * scale,
			point.y * scale,
			(point.x + toAfter.x * radius) * scale,
			(point.y + toAfter.y * radius) * scale,
		);
	}

	const end = points[points.length - 1];
	path.lineTo(end.x * scale, end.y * scale);
	return path;
}
