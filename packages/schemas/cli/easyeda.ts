/**
 * Converts an EasyEDA Standard PCB source document into a breadboard style SVG
 * that matches the look of our Fritzing parts. EasyEDA only stores the layout of
 * a board, so the geometry (outline, pads, silkscreen) comes from the document
 * while the component bodies are drawn based on the type of each footprint.
 *
 * All coordinates stay in EasyEDA units, 1 unit is 10 mil.
 * Format reference: https://docs.easyeda.com/en/DocumentFormat/3-EasyEDA-PCB-File-Format/
 */

const UNITS_PER_INCH = 100;
const LAYER_TOP_COPPER = 1;
const LAYER_BOTTOM_COPPER = 2;
const LAYER_TOP_SILK = 3;
const LAYER_BOTTOM_SILK = 4;
const LAYER_BOARD_OUTLINE = 10;
const LAYER_MULTI = 11;

/** How far a header may be from the board edge to be drawn as a right-angle header */
const EDGE_HEADER_DISTANCE = 45;
/** Through hole parts larger than this are modules, those only keep their silkscreen */
const MAX_THROUGH_HOLE_BODY = 120;
/** Points of the board outline this close to each other are the same point */
const OUTLINE_TOLERANCE = 1;
/** Pads without a net with a hole this large hold screws, pin holes are much smaller */
const MOUNTING_HOLE_RADIUS = 3.5;

const Colors = {
	board: "#008000",
	silk: "#FFFFFF",
	padRing: "#FFCC00",
	padMetal: "#C0C0C0",
	pinShade: "#B8AF82",
	pinLight: "#E2D6A1",
	housing: "#404040",
	housingDark: "#262626",
	chip: "#303030",
	chipLight: "#474747",
	chipMark: "#8C8C8C",
	resistor: "#1F1F1F",
	capacitor: "#B8AF82",
	capacitorLight: "#E2D6A1",
	inductor: "#404040",
	led: "#F2F2F2",
	ledLens: "#D9D9D9",
	metal: "#B3B3B3",
	metalLight: "#E6E6E6",
};

interface Point {
	x: number;
	y: number;
}

interface Box {
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
}

interface Pad {
	shape: string;
	x: number;
	y: number;
	width: number;
	height: number;
	layer: number;
	net: string;
	number: string;
	holeRadius: number;
	outline: number[];
	rotation: number;
	holePoints: number[];
	plated: boolean;
	footprint?: Footprint;
}

interface Footprint {
	ref: string;
	pkg: string;
	x: number;
	y: number;
	rotation: number;
	pads: Pad[];
	silkLayers: number[];
	silkBox: Box;
}

interface SilkShape {
	layer: number;
	svg: string;
	isText: boolean;
	footprint?: Footprint;
}

type OutlineSegment =
	| { type: "line"; from: Point; to: Point }
	| {
			type: "arc";
			from: Point;
			to: Point;
			rx: number;
			ry: number;
			rotation: number;
			large: boolean;
			sweep: boolean;
	  };

interface Board {
	segments: OutlineSegment[];
	closedLoops: { path: string; points: Point[] }[];
	holes: { x: number; y: number; radius: number }[];
	footprints: Footprint[];
	pads: Pad[];
	silk: SilkShape[];
}

export interface ConvertedPin {
	name: string;
	svgId: string;
	label: string;
}

export interface ConvertedBoard {
	svg: string;
	/** Pins that are expected to be wired up, these are the default mappings */
	pins: ConvertedPin[];
	/** Every other pad on the visible side, can be mapped manually */
	otherPads: ConvertedPin[];
	warnings: string[];
}

/** Formats a number for SVG output */
function n(value: number) {
	return String(Math.round(value * 100) / 100);
}

function escapeAttribute(value: string) {
	return value
		.replace(/&/g, "&amp;")
		.replace(/"/g, "&quot;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}

function numbersIn(value: string | undefined): number[] {
	return (value?.match(/-?\d*\.?\d+(?:e-?\d+)?/gi) ?? []).map(Number);
}

function pairs(values: number[]): Point[] {
	const points: Point[] = [];
	for (let i = 0; i + 1 < values.length; i += 2) {
		points.push({ x: values[i], y: values[i + 1] });
	}
	return points;
}

function emptyBox(): Box {
	return {
		minX: Number.POSITIVE_INFINITY,
		minY: Number.POSITIVE_INFINITY,
		maxX: Number.NEGATIVE_INFINITY,
		maxY: Number.NEGATIVE_INFINITY,
	};
}

function includePoint(box: Box, x: number, y: number) {
	box.minX = Math.min(box.minX, x);
	box.minY = Math.min(box.minY, y);
	box.maxX = Math.max(box.maxX, x);
	box.maxY = Math.max(box.maxY, y);
}

function includeBox(box: Box, other: Box) {
	includePoint(box, other.minX, other.minY);
	includePoint(box, other.maxX, other.maxY);
}

function isEmptyBox(box: Box) {
	return !Number.isFinite(box.minX);
}

function rect(
	x: number,
	y: number,
	width: number,
	height: number,
	fill: string,
	extra = "",
) {
	return `<rect x="${n(x)}" y="${n(y)}" width="${n(width)}" height="${n(height)}" fill="${fill}"${extra ? ` ${extra}` : ""}/>`;
}

function circle(x: number, y: number, radius: number, attributes: string) {
	return `<circle cx="${n(x)}" cy="${n(y)}" r="${n(radius)}" ${attributes}/>`;
}

function unwrapDocument(input: unknown): Record<string, any> {
	let document = input as any;
	if (typeof document === "string") document = JSON.parse(document);
	if (document?.result) document = document.result;
	if (document?.dataStr) {
		document =
			typeof document.dataStr === "string"
				? JSON.parse(document.dataStr)
				: document.dataStr;
	}
	return document;
}

export function getDocumentType(input: unknown): string | undefined {
	const head = unwrapDocument(input)?.head;
	if (typeof head === "string") return head.split("~")[0];
	return head?.docType === undefined ? undefined : String(head.docType);
}

/** Parses a path or a plain "x y x y" point list into a closed SVG path */
function regionPath(value: string) {
	if (/[a-z]/i.test(value.replace(/e-?\d/gi, ""))) return value;

	const points = pairs(numbersIn(value));
	return `M ${points.map(({ x, y }) => `${n(x)} ${n(y)}`).join(" L ")} Z`;
}

function arcSegments(path: string): OutlineSegment[] {
	const values = numbersIn(path);
	const segments: OutlineSegment[] = [];
	let from = { x: values[0], y: values[1] };

	for (let i = 2; i + 6 < values.length; i += 7) {
		const to = { x: values[i + 5], y: values[i + 6] };
		segments.push({
			type: "arc",
			from,
			to,
			rx: values[i],
			ry: values[i + 1],
			rotation: values[i + 2],
			large: values[i + 3] === 1,
			sweep: values[i + 4] === 1,
		});
		from = to;
	}

	return segments;
}

function parseShape(raw: string, board: Board, footprint?: Footprint) {
	const fields = raw.split("~");
	const addSilk = (layer: number, svg: string, isText = false) => {
		if (layer !== LAYER_TOP_SILK && layer !== LAYER_BOTTOM_SILK) return;
		board.silk.push({ layer, svg, isText, footprint });
		footprint?.silkLayers.push(layer);
	};
	const stroke = (width: number) =>
		`fill="none" stroke="${Colors.silk}" stroke-width="${n(Math.max(width, 0.5))}" stroke-linecap="round" stroke-linejoin="round"`;

	switch (fields[0]) {
		case "TRACK": {
			const layer = Number(fields[2]);
			const points = pairs(numbersIn(fields[4]));
			if (layer === LAYER_BOARD_OUTLINE) {
				for (let i = 0; i + 1 < points.length; i++) {
					board.segments.push({
						type: "line",
						from: points[i],
						to: points[i + 1],
					});
				}
			} else if (points.length > 1) {
				if (layer === LAYER_TOP_SILK || layer === LAYER_BOTTOM_SILK) {
					points.forEach(({ x, y }) => {
						if (footprint) includePoint(footprint.silkBox, x, y);
					});
				}
				addSilk(
					layer,
					`<polyline points="${points.map(({ x, y }) => `${n(x)},${n(y)}`).join(" ")}" ${stroke(Number(fields[1]))}/>`,
				);
			}
			break;
		}
		case "ARC": {
			const layer = Number(fields[2]);
			if (layer === LAYER_BOARD_OUTLINE) {
				board.segments.push(...arcSegments(fields[4]));
			} else {
				addSilk(
					layer,
					`<path d="${escapeAttribute(fields[4])}" ${stroke(Number(fields[1]))}/>`,
				);
			}
			break;
		}
		case "CIRCLE": {
			const [x, y, radius] = fields.slice(1, 4).map(Number);
			const layer = Number(fields[5]);
			if (layer === LAYER_BOARD_OUTLINE) {
				board.closedLoops.push({
					path: `M ${n(x - radius)} ${n(y)} A ${n(radius)} ${n(radius)} 0 1 0 ${n(x + radius)} ${n(y)} A ${n(radius)} ${n(radius)} 0 1 0 ${n(x - radius)} ${n(y)} Z`,
					points: [
						{ x: x - radius, y: y - radius },
						{ x: x + radius, y: y + radius },
					],
				});
			} else {
				addSilk(layer, circle(x, y, radius, stroke(Number(fields[4]))));
			}
			break;
		}
		case "RECT": {
			const [x, y, width, height] = fields.slice(1, 5).map(Number);
			const layer = Number(fields[5]);
			if (layer === LAYER_BOARD_OUTLINE) {
				board.closedLoops.push({
					path: `M ${n(x)} ${n(y)} h ${n(width)} v ${n(height)} h ${n(-width)} Z`,
					points: [
						{ x, y },
						{ x: x + width, y: y + height },
					],
				});
			} else {
				addSilk(layer, rect(x, y, width, height, Colors.silk));
			}
			break;
		}
		case "SOLIDREGION": {
			const layer = Number(fields[1]);
			const path = regionPath(fields[3]);
			if (layer === LAYER_BOARD_OUTLINE || fields[4] === "npth") {
				board.closedLoops.push({
					path: escapeAttribute(path),
					points: pairs(numbersIn(path)),
				});
			} else {
				addSilk(
					layer,
					`<path d="${escapeAttribute(path)}" fill="${Colors.silk}"/>`,
				);
			}
			break;
		}
		case "TEXT": {
			if (fields[12] === "none" || !fields[11]) break;
			addSilk(
				Number(fields[7]),
				`<path d="${escapeAttribute(fields[11])}" ${stroke(Number(fields[4]))}/>`,
				true,
			);
			break;
		}
		case "SVGNODE": {
			addSvgNode(JSON.parse(fields.slice(1).join("~")), addSilk);
			break;
		}
		case "HOLE": {
			board.holes.push({
				x: Number(fields[1]),
				y: Number(fields[2]),
				radius: Number(fields[3]),
			});
			break;
		}
		case "PAD": {
			const pad: Pad = {
				shape: fields[1],
				x: Number(fields[2]),
				y: Number(fields[3]),
				width: Number(fields[4]),
				height: Number(fields[5]),
				layer: Number(fields[6]),
				net: fields[7] ?? "",
				number: fields[8] ?? "",
				holeRadius: Number(fields[9]) || 0,
				outline: numbersIn(fields[10]),
				rotation: Number(fields[11]) || 0,
				holePoints: numbersIn(fields[14]),
				plated: fields[15] !== "N",
				footprint,
			};
			board.pads.push(pad);
			footprint?.pads.push(pad);
			break;
		}
	}
}

/** Logos and imported artwork are stored as a tree of SVG nodes */
function addSvgNode(
	node: any,
	addSilk: (layer: number, svg: string) => void,
	layer = Number(node?.attrs?.layerid),
) {
	if (node?.nodeName === "path" && node.attrs?.d) {
		addSilk(
			layer,
			`<path d="${escapeAttribute(node.attrs.d)}" fill="${Colors.silk}"/>`,
		);
	}
	for (const child of node?.childNodes ?? []) {
		addSvgNode(child, addSilk, layer);
	}
}

function parseFootprint(raw: string, board: Board) {
	const [header, ...shapes] = raw.split("#@$");
	const fields = header.split("~");
	const attributes = (fields[3] ?? "").split("`");
	const packageIndex = attributes.indexOf("package");

	const footprint: Footprint = {
		ref: "",
		pkg: packageIndex === -1 ? "" : (attributes[packageIndex + 1] ?? ""),
		x: Number(fields[1]),
		y: Number(fields[2]),
		rotation: Number(fields[4]) || 0,
		pads: [],
		silkLayers: [],
		silkBox: emptyBox(),
	};
	board.footprints.push(footprint);

	for (const shape of shapes) {
		const shapeFields = shape.split("~");
		if (shapeFields[0] === "TEXT" && shapeFields[1] === "P") {
			footprint.ref = shapeFields[10] ?? "";
		}
		parseShape(shape, board, footprint);
	}
}

function parseBoard(document: Record<string, any>): Board {
	const board: Board = {
		segments: [],
		closedLoops: [],
		holes: [],
		footprints: [],
		pads: [],
		silk: [],
	};

	for (const shape of (document.shape ?? []) as string[]) {
		if (shape.startsWith("LIB~")) parseFootprint(shape, board);
		else parseShape(shape, board);
	}

	return board;
}

function distance(a: Point, b: Point) {
	return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Samples an SVG arc into points, close enough together to draw it as straight lines */
function sampleArc(arc: Extract<OutlineSegment, { type: "arc" }>): Point[] {
	const angle = (arc.rotation * Math.PI) / 180;
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);
	const dx = (arc.from.x - arc.to.x) / 2;
	const dy = (arc.from.y - arc.to.y) / 2;
	const x1 = cos * dx + sin * dy;
	const y1 = -sin * dx + cos * dy;

	let rx = Math.abs(arc.rx);
	let ry = Math.abs(arc.ry);
	if (!rx || !ry) return [arc.from, arc.to];

	const lambda = (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry);
	if (lambda > 1) {
		rx *= Math.sqrt(lambda);
		ry *= Math.sqrt(lambda);
	}

	const numerator = rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1;
	const denominator = rx * rx * y1 * y1 + ry * ry * x1 * x1;
	const factor =
		(arc.large === arc.sweep ? -1 : 1) *
		Math.sqrt(Math.max(0, numerator / (denominator || 1)));
	const cx1 = (factor * rx * y1) / ry;
	const cy1 = (-factor * ry * x1) / rx;

	const start = Math.atan2((y1 - cy1) / ry, (x1 - cx1) / rx);
	let delta = Math.atan2((-y1 - cy1) / ry, (-x1 - cx1) / rx) - start;
	if (arc.sweep && delta < 0) delta += Math.PI * 2;
	if (!arc.sweep && delta > 0) delta -= Math.PI * 2;

	const centerX = cos * cx1 - sin * cy1 + (arc.from.x + arc.to.x) / 2;
	const centerY = sin * cx1 + cos * cy1 + (arc.from.y + arc.to.y) / 2;

	const steps = Math.min(
		Math.max(Math.ceil((Math.abs(delta) * Math.max(rx, ry)) / 2), 4),
		64,
	);
	const points: Point[] = [];
	for (let i = 0; i <= steps; i++) {
		const theta = start + (delta * i) / steps;
		const px = rx * Math.cos(theta);
		const py = ry * Math.sin(theta);
		points.push({
			x: cos * px - sin * py + centerX,
			y: sin * px + cos * py + centerY,
		});
	}
	return points;
}

type OutlineGraph = Map<number, Set<number>>;

function connectNodes(graph: OutlineGraph, a: number, b: number) {
	if (a === b) return;

	if (!graph.has(a)) graph.set(a, new Set());
	if (!graph.has(b)) graph.set(b, new Set());
	graph.get(a)?.add(b);
	graph.get(b)?.add(a);
}

function disconnectNode(graph: OutlineGraph, node: number) {
	graph.get(node)?.forEach((other) => {
		graph.get(other)?.delete(node);
	});
	graph.delete(node);
}

function segmentIntersection(
	[a, b]: [Point, Point],
	[c, d]: [Point, Point],
): Point | null {
	const denominator = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x);
	if (Math.abs(denominator) < 1e-9) return null;

	const t =
		((c.x - a.x) * (d.y - c.y) - (c.y - a.y) * (d.x - c.x)) / denominator;
	const u =
		((c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x)) / denominator;
	if (t < 0 || t > 1 || u < 0 || u > 1) return null;

	return { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) };
}

/**
 * Outlines are hand drawn, so their lines can overlap, cross, overshoot corners
 * and be stored in any order. Everything is split up where it touches, which
 * leaves a graph of the lines without any duplicates.
 */
function buildOutlineGraph(segments: OutlineSegment[]) {
	const lines: [Point, Point][] = segments.flatMap((segment) => {
		const points =
			segment.type === "arc" ? sampleArc(segment) : [segment.from, segment.to];
		return points
			.slice(1)
			.map((point, index): [Point, Point] => [points[index], point]);
	});

	const nodes: Point[] = [];
	const addNode = (point: Point) => {
		const existing = nodes.findIndex(
			(node) => distance(node, point) <= OUTLINE_TOLERANCE,
		);
		return existing === -1 ? nodes.push(point) - 1 : existing;
	};

	lines.forEach(([from, to], index) => {
		addNode(from);
		addNode(to);
		lines.slice(index + 1).forEach((other) => {
			const crossing = segmentIntersection([from, to], other);
			if (crossing) addNode(crossing);
		});
	});

	const graph: OutlineGraph = new Map();
	lines.forEach(([from, to]) => {
		const length = distance(from, to);
		if (!length) return;

		const onLine = nodes
			.map((node, id) => {
				const along =
					((node.x - from.x) * (to.x - from.x) +
						(node.y - from.y) * (to.y - from.y)) /
					length;
				const away =
					Math.abs(
						(node.x - from.x) * (to.y - from.y) -
							(node.y - from.y) * (to.x - from.x),
					) / length;
				const nearLine =
					away <= OUTLINE_TOLERANCE &&
					along >= -OUTLINE_TOLERANCE &&
					along <= length + OUTLINE_TOLERANCE;
				return { id, along, nearLine };
			})
			.filter(({ nearLine }) => nearLine)
			.sort((a, b) => a.along - b.along);

		onLine.slice(1).forEach(({ id }, index) => {
			connectNodes(graph, onLine[index].id, id);
		});
	});

	return { nodes, graph };
}

function graphComponents(graph: OutlineGraph) {
	const seen = new Set<number>();
	const components: number[][] = [];

	graph.forEach((_, start) => {
		if (seen.has(start)) return;

		seen.add(start);
		const component = [start];
		for (const node of component) {
			graph.get(node)?.forEach((other) => {
				if (seen.has(other)) return;

				seen.add(other);
				component.push(other);
			});
		}
		components.push(component);
	});

	return components;
}

/** Closes outlines which aren't a loop by connecting the ends of their lines */
function closeOutlineGaps(
	nodes: Point[],
	graph: OutlineGraph,
	warnings: string[],
) {
	while (true) {
		const open = graphComponents(graph).filter((component) => {
			const edges =
				component.reduce(
					(total, node) => total + (graph.get(node)?.size ?? 0),
					0,
				) / 2;
			return edges < component.length;
		});
		if (!open.length) return;

		const ends = open.map((component) =>
			component.filter((node) => graph.get(node)?.size === 1),
		);

		let from = -1;
		let to = -1;
		if (open.length > 1) {
			// Several loose lines, those are parts of a loop so join the closest ends
			let closest = Number.POSITIVE_INFINITY;
			ends.forEach((group, index) => {
				group.forEach((a) => {
					ends.slice(index + 1).forEach((others) => {
						others.forEach((b) => {
							const gap = distance(nodes[a], nodes[b]);
							if (gap < closest) {
								closest = gap;
								from = a;
								to = b;
							}
						});
					});
				});
			});
		} else {
			let farthest = -1;
			ends[0].forEach((a) => {
				ends[0].forEach((b) => {
					const gap = distance(nodes[a], nodes[b]);
					if (gap > farthest) {
						farthest = gap;
						from = a;
						to = b;
					}
				});
			});
		}

		const { x, y } = nodes[from];
		warnings.push(
			`The board outline has a gap near (${n(x)}, ${n(y)}), it was closed with a straight line.`,
		);

		// A single line can't be closed into a loop, it doesn't outline anything
		if (open.length === 1 && graph.get(from)?.has(to)) {
			graphComponents(graph)
				.find((component) => component.includes(from))
				?.forEach((node) => {
					disconnectNode(graph, node);
				});
		} else {
			connectNodes(graph, from, to);
		}
	}
}

/** Removes lines which lead nowhere, such as a line overshooting a corner */
function pruneDeadEnds(graph: OutlineGraph) {
	let dangling = [...graph.keys()].filter(
		(node) => (graph.get(node)?.size ?? 0) < 2,
	);
	while (dangling.length) {
		dangling.forEach((node) => {
			disconnectNode(graph, node);
		});
		dangling = [...graph.keys()].filter(
			(node) => (graph.get(node)?.size ?? 0) < 2,
		);
	}
}

/** Walks around the outside of a set of connected lines */
function traceOutline(
	nodes: Point[],
	graph: OutlineGraph,
	component: number[],
): Point[] {
	const start = component.reduce((best, node) =>
		nodes[node].x < nodes[best].x ||
		(nodes[node].x === nodes[best].x && nodes[node].y < nodes[best].y)
			? node
			: best,
	);
	const angleBetween = (from: number, to: number) =>
		Math.atan2(nodes[to].y - nodes[from].y, nodes[to].x - nodes[from].x);
	const turn = (node: number, back: number) => {
		let best = -1;
		let bestTurn = Number.POSITIVE_INFINITY;
		graph.get(node)?.forEach((other) => {
			let amount = (angleBetween(node, other) - back) % (Math.PI * 2);
			if (amount <= 1e-9) amount += Math.PI * 2;
			if (amount < bestTurn) {
				bestTurn = amount;
				best = other;
			}
		});
		return best;
	};

	// Nothing is to the left of the start, so that is where the outside is
	const first = turn(start, Math.PI);
	const path = [start];
	let previous = start;
	let current = first;
	while (
		current !== start ||
		turn(start, angleBetween(start, previous)) !== first
	) {
		path.push(current);
		const next = turn(current, angleBetween(current, previous));
		previous = current;
		current = next;
	}

	return path
		.map((node) => nodes[node])
		.filter((point, index, points) => {
			const before = points[(index + points.length - 1) % points.length];
			const after = points[(index + 1) % points.length];
			const cross =
				(point.x - before.x) * (after.y - point.y) -
				(point.y - before.y) * (after.x - point.x);
			const dot =
				(point.x - before.x) * (after.x - point.x) +
				(point.y - before.y) * (after.y - point.y);
			return Math.abs(cross) > 1e-6 || dot < 0;
		});
}

function buildOutline(board: Board, warnings: string[]) {
	const paths = board.closedLoops.map((loop) => loop.path);
	const bounds = emptyBox();
	board.closedLoops.forEach((loop) => {
		loop.points.forEach(({ x, y }) => {
			includePoint(bounds, x, y);
		});
	});

	const { nodes, graph } = buildOutlineGraph(board.segments);
	closeOutlineGaps(nodes, graph, warnings);
	pruneDeadEnds(graph);

	graphComponents(graph).forEach((component) => {
		const points = traceOutline(nodes, graph, component);
		points.forEach(({ x, y }) => {
			includePoint(bounds, x, y);
		});
		paths.push(
			`M ${points.map(({ x, y }) => `${n(x)} ${n(y)}`).join(" L ")} Z`,
		);
	});

	return { paths, bounds };
}

function isThroughHole(pad: Pad) {
	return pad.layer === LAYER_MULTI && pad.holeRadius > 0.1;
}

function isMountingPad(pad: Pad) {
	const standalone = !pad.footprint || pad.footprint.pads.length === 1;
	return (
		standalone &&
		!pad.net &&
		pad.layer === LAYER_MULTI &&
		pad.holeRadius >= MOUNTING_HOLE_RADIUS &&
		pad.width === pad.height
	);
}

function padBox(pad: Pad): Box {
	const box = emptyBox();
	if (pad.outline.length >= 6) {
		pairs(pad.outline).forEach(({ x, y }) => {
			includePoint(box, x, y);
		});
		return box;
	}

	const sideways = Math.abs((((pad.rotation % 180) + 180) % 180) - 90) < 1;
	const width = sideways ? pad.height : pad.width;
	const height = sideways ? pad.width : pad.height;
	includePoint(box, pad.x - width / 2, pad.y - height / 2);
	includePoint(box, pad.x + width / 2, pad.y + height / 2);
	return box;
}

function renderPad(pad: Pad, id?: string) {
	const throughHole = isThroughHole(pad);
	const fill = throughHole ? Colors.padRing : Colors.padMetal;
	const idAttribute = id ? `id="${id}" ` : "";

	if (isMountingPad(pad)) {
		const outer = pad.width / 2;
		return circle(
			pad.x,
			pad.y,
			(outer + pad.holeRadius) / 2,
			`${idAttribute}fill="none" stroke="${Colors.padRing}" stroke-width="${n(outer - pad.holeRadius)}"`,
		);
	}

	let shape: string;
	if (pad.outline.length >= 6) {
		const points = pairs(pad.outline)
			.map(({ x, y }) => `${n(x)},${n(y)}`)
			.join(" ");
		shape = `<polygon ${idAttribute}points="${points}" fill="${fill}"/>`;
	} else if (pad.shape === "ELLIPSE" && pad.width === pad.height) {
		shape = circle(pad.x, pad.y, pad.width / 2, `${idAttribute}fill="${fill}"`);
	} else {
		const radius =
			pad.shape === "RECT" ? 0 : Math.min(pad.width, pad.height) / 2;
		const rotation = pad.rotation
			? ` transform="rotate(${n(pad.rotation)} ${n(pad.x)} ${n(pad.y)})"`
			: "";
		shape = `<rect ${idAttribute}x="${n(pad.x - pad.width / 2)}" y="${n(pad.y - pad.height / 2)}" width="${n(pad.width)}" height="${n(pad.height)}" rx="${n(radius)}" fill="${fill}"${rotation}/>`;
	}

	if (!throughHole) return shape;

	const [x1, y1, x2, y2] = pad.holePoints;
	const hole =
		pad.holePoints.length >= 4
			? `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${Colors.padMetal}" stroke-width="${n(pad.holeRadius * 2)}" stroke-linecap="round"/>`
			: circle(pad.x, pad.y, pad.holeRadius, `fill="${Colors.padMetal}"`);
	return shape + hole;
}

type FootprintKind =
	| "connector"
	| "metal-connector"
	| "resistor"
	| "capacitor"
	| "inductor"
	| "diode"
	| "led"
	| "crystal"
	| "switch"
	| "chip"
	| "module"
	| "none";

function classifyFootprint(footprint: Footprint): FootprintKind {
	if (footprint.pads.some(isMountingPad)) return "none";

	const prefix = (footprint.ref.match(/^[a-z]+/i)?.[0] ?? "").toUpperCase();
	const pkg = footprint.pkg.toUpperCase();
	const throughHole = footprint.pads.some(isThroughHole);

	if (/USB|HDMI|JACK|SD-?CARD|RJ45|DC-?\d/.test(pkg)) return "metal-connector";
	if (
		/HDR|HEADER|PINHEAD|PIN-?H|CONN|JST|XH|TERMINAL|SCREW|KF\d|\bPH2/.test(
			pkg,
		) ||
		["J", "CN", "CON", "JP", "H", "P"].includes(prefix)
	) {
		return "connector";
	}
	if (/LED/.test(pkg) || ["LED", "DS"].includes(prefix)) return "led";
	if (/HC-?49|CRYSTAL|XTAL/.test(pkg) || ["Y", "XTAL", "X"].includes(prefix)) {
		return "crystal";
	}
	if (/SWITCH|TACT|BUTTON/.test(pkg) || ["SW", "S", "BTN"].includes(prefix)) {
		return "switch";
	}
	if (["R", "RN", "RP"].includes(prefix)) return "resistor";
	if (["C", "CP"].includes(prefix)) return "capacitor";
	if (["L", "FB"].includes(prefix)) return "inductor";
	if (["D", "Z", "ZD"].includes(prefix)) return "diode";
	if (footprint.pads.length < 2) return "none";

	const box = emptyBox();
	footprint.pads.forEach((pad) => {
		includePoint(box, pad.x, pad.y);
	});
	const span = Math.max(box.maxX - box.minX, box.maxY - box.minY);
	if (/DIP|SOIC|SOP|QFP|QFN/.test(pkg)) return "chip";
	if (
		/MODULE|COMM-|ARDUINO|PRO MICRO|ESP-?\d|RF\d/.test(pkg) ||
		(throughHole && span > MAX_THROUGH_HOLE_BODY)
	) {
		return "module";
	}

	return "chip";
}

function isPinHeader(footprint: Footprint) {
	const pkg = footprint.pkg.toUpperCase();
	if (/JST|XH|TERMINAL|SCREW|KF\d|\bPH2/.test(pkg)) return false;
	// Package names of vertical headers are marked with a V, like HDR-TH_4P-P2.54-V-M
	if (/-V(-|$)/.test(pkg)) return false;
	if (!footprint.pads.every(isThroughHole)) return false;

	const xs = footprint.pads.map((pad) => pad.x);
	const ys = footprint.pads.map((pad) => pad.y);
	const width = Math.max(...xs) - Math.min(...xs);
	const height = Math.max(...ys) - Math.min(...ys);
	return Math.min(width, height) < 1;
}

function isVisibleOn(pad: Pad, copperLayer: number) {
	return pad.layer === LAYER_MULTI || pad.layer === copperLayer;
}

/** The side a footprint is mounted on, based on SMD pads or else on its silkscreen */
function footprintLayer(footprint: Footprint) {
	const copper = footprint.pads.find(
		({ layer }) => layer === LAYER_TOP_COPPER || layer === LAYER_BOTTOM_COPPER,
	);
	if (copper) return copper.layer;

	return footprint.silkLayers.includes(LAYER_BOTTOM_SILK) &&
		!footprint.silkLayers.includes(LAYER_TOP_SILK)
		? LAYER_BOTTOM_COPPER
		: LAYER_TOP_COPPER;
}

/**
 * Rotation in a footprint that isn't a multiple of 90 degrees, its body is drawn
 * axis aligned and then turned back. EasyEDA stores absolute pad positions so
 * multiples of 90 degrees need no special treatment.
 */
function residualRotation(footprint: Footprint) {
	const rotation = ((footprint.rotation % 90) + 90) % 90;
	const residual = rotation > 45 ? rotation - 90 : rotation;
	if (Math.abs(residual) < 0.01) return 0;

	const area = (angle: number) => {
		const box = emptyBox();
		footprint.pads.forEach((pad) => {
			const { x, y } = rotateAround(pad, footprint, -angle);
			includePoint(box, x, y);
		});
		return (box.maxX - box.minX) * (box.maxY - box.minY);
	};
	return area(residual) <= area(-residual) ? residual : -residual;
}

function rotateAround(point: Point, origin: Point, degrees: number): Point {
	const angle = (degrees * Math.PI) / 180;
	const dx = point.x - origin.x;
	const dy = point.y - origin.y;
	return {
		x: origin.x + dx * Math.cos(angle) - dy * Math.sin(angle),
		y: origin.y + dx * Math.sin(angle) + dy * Math.cos(angle),
	};
}

interface FootprintGeometry {
	/** Bounds of the pad centers */
	centers: Box;
	/** Bounds of the pads themselves */
	outer: Box;
	padCenters: Point[];
	padBoxes: Box[];
}

function footprintGeometry(
	footprint: Footprint,
	residual: number,
): FootprintGeometry {
	const centers = emptyBox();
	const outer = emptyBox();
	const padCenters: Point[] = [];
	const padBoxes: Box[] = [];

	footprint.pads.forEach((pad) => {
		const center = rotateAround(pad, footprint, -residual);
		const box = padBox(pad);
		const halfWidth = (box.maxX - box.minX) / 2;
		const halfHeight = (box.maxY - box.minY) / 2;
		const local = {
			minX: center.x - halfWidth,
			minY: center.y - halfHeight,
			maxX: center.x + halfWidth,
			maxY: center.y + halfHeight,
		};

		padCenters.push(center);
		padBoxes.push(local);
		includePoint(centers, center.x, center.y);
		includeBox(outer, local);
	});

	return { centers, outer, padCenters, padBoxes };
}

function drawChip(footprint: Footprint, geometry: FootprintGeometry) {
	const { centers, outer, padCenters } = geometry;
	const throughHole = footprint.pads.every(isThroughHole);

	let box: Box;
	if (throughHole) {
		const radius = Math.max(
			...footprint.pads.map((pad) => Math.max(pad.width, pad.height) / 2),
		);
		const wide = centers.maxX - centers.minX >= centers.maxY - centers.minY;
		const inset = (min: number, max: number, along: boolean) =>
			along
				? [min - radius - 1, max + radius + 1]
				: max - min > radius * 4
					? [min + radius + 0.5, max - radius - 0.5]
					: [min - radius - 2, max + radius + 2];
		const [minX, maxX] = inset(centers.minX, centers.maxX, wide);
		const [minY, maxY] = inset(centers.minY, centers.maxY, !wide);
		box = { minX, minY, maxX, maxY };
	} else {
		const margin = 1.5;
		box = {
			minX: centers.minX - margin,
			minY: centers.minY - margin,
			maxX: centers.maxX + margin,
			maxY: centers.maxY + margin,
		};
		// A footprint with a single row of pads has no depth from its centers alone
		if (box.maxX - box.minX < 4) {
			box.minX = outer.minX;
			box.maxX = outer.maxX;
		}
		if (box.maxY - box.minY < 4) {
			box.minY = outer.minY;
			box.maxY = outer.maxY;
		}
	}

	const width = box.maxX - box.minX;
	const height = box.maxY - box.minY;
	let result =
		rect(box.minX, box.minY, width, height, Colors.chip, 'rx="0.6"') +
		rect(
			box.minX + 0.5,
			box.minY + 0.5,
			width - 1,
			height - 1,
			Colors.chipLight,
			'rx="0.4" fill-opacity="0.45"',
		);

	const firstIndex = footprint.pads.findIndex((pad) => pad.number === "1");
	if (firstIndex !== -1 && Math.min(width, height) > 5) {
		const first = padCenters[firstIndex];
		const inset = 1 + Math.min(width, height) * 0.1;
		const x = Math.min(Math.max(first.x, box.minX + inset), box.maxX - inset);
		const y = Math.min(Math.max(first.y, box.minY + inset), box.maxY - inset);
		result += circle(
			x,
			y,
			Math.min(width, height) * 0.06 + 0.3,
			`fill="${Colors.chipMark}"`,
		);
	}
	return result;
}

/** Draws a body between two terminals, the pads remain visible as its metal ends */
function drawTwoTerminalBody(
	geometry: FootprintGeometry,
	color: string,
	highlight?: string,
	band?: string,
) {
	const { outer, padBoxes } = geometry;
	const horizontal = outer.maxX - outer.minX >= outer.maxY - outer.minY;
	const [a, b] = padBoxes;

	let box: Box;
	if (horizontal) {
		const first = a.minX <= b.minX ? a : b;
		const second = first === a ? b : a;
		const inset = Math.max(0.3, (first.maxY - first.minY) * 0.08);
		box = {
			minX: first.maxX - 0.4,
			maxX: second.minX + 0.4,
			minY: outer.minY + inset,
			maxY: outer.maxY - inset,
		};
	} else {
		const first = a.minY <= b.minY ? a : b;
		const second = first === a ? b : a;
		const inset = Math.max(0.3, (first.maxX - first.minX) * 0.08);
		box = {
			minY: first.maxY - 0.4,
			maxY: second.minY + 0.4,
			minX: outer.minX + inset,
			maxX: outer.maxX - inset,
		};
	}

	const width = box.maxX - box.minX;
	const height = box.maxY - box.minY;
	if (width <= 0 || height <= 0) return "";

	let result = rect(box.minX, box.minY, width, height, color);
	if (highlight) {
		result += horizontal
			? rect(box.minX, box.minY + height * 0.2, width, height * 0.25, highlight)
			: rect(box.minX + width * 0.2, box.minY, width * 0.25, height, highlight);
	}
	if (band) {
		result += horizontal
			? rect(box.minX + width * 0.12, box.minY, width * 0.16, height, band)
			: rect(box.minX, box.minY + height * 0.12, width, height * 0.16, band);
	}
	return result;
}

/** Draws a through hole body with two legs, the pads are drawn on top of it */
function drawLeadedBody(
	kind: FootprintKind,
	geometry: FootprintGeometry,
	footprint: Footprint,
) {
	const { centers } = geometry;
	const x = (centers.minX + centers.maxX) / 2;
	const y = (centers.minY + centers.maxY) / 2;
	const spacing = Math.max(
		centers.maxX - centers.minX,
		centers.maxY - centers.minY,
	);
	const horizontal = centers.maxX - centers.minX >= centers.maxY - centers.minY;
	const pkg = footprint.pkg.toUpperCase();

	const leg = `<line x1="${n(centers.minX)}" y1="${n(horizontal ? y : centers.minY)}" x2="${n(horizontal ? centers.maxX : centers.minX)}" y2="${n(horizontal ? y : centers.maxY)}" stroke="${Colors.chipMark}" stroke-width="1.6"/>`;
	const barrel = (color: string, band?: string, thickness = 0.24) => {
		const length = spacing * 0.62;
		const depth = Math.max(spacing * thickness, 4);
		const width = horizontal ? length : depth;
		const height = horizontal ? depth : length;
		let result = rect(
			x - width / 2,
			y - height / 2,
			width,
			height,
			color,
			'rx="1.2"',
		);
		if (band) {
			result += horizontal
				? rect(x - width / 2 + 1, y - height / 2, width * 0.12, height, band)
				: rect(x - width / 2, y - height / 2 + 1, width, height * 0.12, band);
		}
		return leg + result;
	};

	switch (kind) {
		case "resistor":
			return barrel(Colors.capacitor, Colors.capacitorLight);
		case "diode":
			return barrel(Colors.resistor, Colors.metalLight);
		case "inductor":
			return barrel(Colors.inductor);
		case "capacitor": {
			const disc = /RAD|CP|ELEC/.test(pkg)
				? circle(x, y, spacing * 0.95, `fill="${Colors.chip}"`) +
					circle(x, y, spacing * 0.75, `fill="${Colors.chipLight}"`)
				: circle(x, y, spacing * 0.5 + 1, `fill="${Colors.capacitor}"`) +
					circle(x, y, spacing * 0.38 + 1, `fill="${Colors.capacitorLight}"`);
			return disc;
		}
		case "led":
			return (
				circle(x, y, Math.max(spacing * 0.95, 5), `fill="${Colors.ledLens}"`) +
				circle(x, y, Math.max(spacing * 0.75, 4), `fill="${Colors.led}"`)
			);
		default:
			return "";
	}
}

function drawCrystal({ outer }: FootprintGeometry) {
	const width = outer.maxX - outer.minX;
	const height = outer.maxY - outer.minY;
	const radius = Math.min(width, height) / 2;
	return (
		rect(
			outer.minX,
			outer.minY,
			width,
			height,
			Colors.metal,
			`rx="${n(radius)}"`,
		) +
		rect(
			outer.minX + 0.8,
			outer.minY + 0.8,
			width - 1.6,
			height - 1.6,
			Colors.metalLight,
			`rx="${n(Math.max(radius - 0.8, 0))}"`,
		)
	);
}

function drawSwitch({ outer, centers }: FootprintGeometry) {
	const size = Math.min(
		Math.max(centers.maxX - centers.minX, 8),
		Math.max(centers.maxY - centers.minY, 8),
	);
	const x = (outer.minX + outer.maxX) / 2;
	const y = (outer.minY + outer.maxY) / 2;
	const width = Math.max(centers.maxX - centers.minX, size);
	const height = Math.max(centers.maxY - centers.minY, size);
	return (
		rect(
			x - width / 2,
			y - height / 2,
			width,
			height,
			Colors.housing,
			'rx="0.8"',
		) + circle(x, y, size * 0.32, `fill="${Colors.housingDark}"`)
	);
}

function drawMetalConnector({ outer }: FootprintGeometry) {
	const width = outer.maxX - outer.minX;
	const height = outer.maxY - outer.minY;
	return (
		rect(outer.minX, outer.minY, width, height, Colors.metal, 'rx="0.8"') +
		rect(
			outer.minX + 1,
			outer.minY + 1,
			width - 2,
			height - 2,
			Colors.metalLight,
			'rx="0.5"',
		)
	);
}

/** Drawn below or on top of the pads, through hole parts leave their pads visible */
function drawBody(kind: FootprintKind, footprint: Footprint) {
	const residual = residualRotation(footprint);
	const geometry = footprintGeometry(footprint, residual);
	const twoPads = footprint.pads.length === 2;
	const throughHole = footprint.pads.every(isThroughHole);

	let svg = "";
	if (throughHole && twoPads && kind !== "crystal" && kind !== "switch") {
		svg = drawLeadedBody(kind, geometry, footprint);
	} else if (kind === "crystal") {
		svg = drawCrystal(geometry);
	} else if (kind === "switch") {
		svg = drawSwitch(geometry);
	} else if (kind === "metal-connector") {
		svg = drawMetalConnector(geometry);
	} else if (twoPads && kind === "resistor") {
		svg = drawTwoTerminalBody(geometry, Colors.resistor);
	} else if (twoPads && kind === "capacitor") {
		svg = drawTwoTerminalBody(
			geometry,
			Colors.capacitor,
			Colors.capacitorLight,
		);
	} else if (twoPads && kind === "inductor") {
		svg = drawTwoTerminalBody(geometry, Colors.inductor);
	} else if (twoPads && kind === "diode") {
		svg = drawTwoTerminalBody(
			geometry,
			Colors.resistor,
			undefined,
			Colors.metalLight,
		);
	} else if (twoPads && kind === "led") {
		svg = drawTwoTerminalBody(geometry, Colors.led, Colors.ledLens);
	} else if (
		kind !== "none" &&
		kind !== "module" &&
		footprint.pads.length >= 2
	) {
		svg = drawChip(footprint, geometry);
	}

	if (!svg || !residual) return svg;
	return `<g transform="rotate(${n(residual)} ${n(footprint.x)} ${n(footprint.y)})">${svg}</g>`;
}

function headerPitch(footprint: Footprint) {
	let pitch = Number.POSITIVE_INFINITY;
	footprint.pads.forEach((a) => {
		footprint.pads.forEach((b) => {
			if (a !== b) pitch = Math.min(pitch, distance(a, b));
		});
	});
	return Number.isFinite(pitch) ? Math.min(Math.max(pitch, 6), 20) : 10;
}

/** A header near the edge of a board, its pins stick out to connect the wires to */
function drawEdgeHeader(
	footprint: Footprint,
	board: Box,
	obstacles: Box[],
	ids: Map<Pad, string>,
	bounds: Box,
) {
	const { pads } = footprint;
	const xs = pads.map((pad) => pad.x);
	const ys = pads.map((pad) => pad.y);
	const vertical =
		Math.max(...ys) - Math.min(...ys) >= Math.max(...xs) - Math.min(...xs);

	// Across is the axis the pins point along
	const across = vertical ? pads[0].x : pads[0].y;
	const toMin = across - (vertical ? board.minX : board.minY);
	const toMax = (vertical ? board.maxX : board.maxY) - across;
	if (Math.min(toMin, toMax) > EDGE_HEADER_DISTANCE) return null;

	const direction = toMin <= toMax ? -1 : 1;
	const edge = direction === -1 ? across - toMin : across + toMax;
	const pitch = headerPitch(footprint);
	const padRadius = Math.max(
		...pads.map((pad) => Math.max(pad.width, pad.height) / 2),
	);
	const housingDepth = pitch * 0.9;
	const housingStart = across + direction * (padRadius + 0.5);
	const housingEnd = housingStart + direction * housingDepth;
	const pinEnd =
		direction === 1
			? Math.max(housingEnd + pitch * 1.8, edge + pitch * 1.2)
			: Math.min(housingEnd - pitch * 1.8, edge - pitch * 1.2);
	const pinWidth = pitch * 0.26;

	// Pins can't go through whatever is between the header and the edge
	const alongValues = vertical ? ys : xs;
	const lane = {
		from: Math.min(housingStart, pinEnd),
		to: Math.max(housingStart, pinEnd),
		start: Math.min(...alongValues) - pitch / 2,
		end: Math.max(...alongValues) + pitch / 2,
	};
	const blocked = obstacles.some((box) => {
		const [acrossMin, acrossMax, alongMin, alongMax] = vertical
			? [box.minX, box.maxX, box.minY, box.maxY]
			: [box.minY, box.maxY, box.minX, box.maxX];
		return (
			acrossMax > lane.from &&
			acrossMin < lane.to &&
			alongMax > lane.start &&
			alongMin < lane.end
		);
	});
	if (blocked) return null;

	const place = (a: number, b: number, length: number, breadth: number) =>
		vertical
			? { x: a, y: b, w: length, h: breadth }
			: { x: b, y: a, w: breadth, h: length };

	let pins = "";
	let housing = "";
	pads.forEach((pad) => {
		const along = vertical ? pad.y : pad.x;
		const start = Math.min(across, pinEnd);
		const length = Math.abs(pinEnd - across);

		const body = place(start, along - pinWidth / 2, length, pinWidth);
		const light = place(start, along - pinWidth / 2, length, pinWidth * 0.4);
		const tipStart = direction === 1 ? pinEnd - pitch * 0.25 : pinEnd;
		const tip = place(tipStart, along - pinWidth / 2, pitch * 0.25, pinWidth);
		pins +=
			rect(body.x, body.y, body.w, body.h, Colors.pinShade) +
			rect(light.x, light.y, light.w, light.h, Colors.pinLight) +
			rect(tip.x, tip.y, tip.w, tip.h, Colors.pinLight, `id="${ids.get(pad)}"`);

		const block = place(
			Math.min(housingStart, housingEnd),
			along - pitch / 2,
			housingDepth,
			pitch,
		);
		housing += rect(
			block.x,
			block.y,
			block.w,
			block.h,
			Colors.housing,
			`stroke="${Colors.housingDark}" stroke-width="0.4"`,
		);

		const padExtent = place(pinEnd, along - pitch / 2, 0, pitch);
		includePoint(bounds, padExtent.x, padExtent.y);
		includePoint(bounds, padExtent.x + padExtent.w, padExtent.y + padExtent.h);
	});

	return { pins, housing };
}

/** Package names of bent headers are marked like HDR-TH_8P-P2.54-H-M-R2-C4 */
function isBentHeader(footprint: Footprint) {
	return (
		/-H(-|$)|ANGLE|RIGHT|BENT|R\/A/.test(footprint.pkg.toUpperCase()) &&
		footprint.pads.length > 1 &&
		footprint.pads.every(isThroughHole)
	);
}

/** Finds the direction of the pins, the footprint outlines them in its silkscreen */
function bentHeaderDirection(footprint: Footprint, board: Box, pitch: number) {
	const pads = emptyBox();
	footprint.pads.forEach(({ x, y }) => {
		includePoint(pads, x, y);
	});

	const { silkBox } = footprint;
	const sides = [
		{
			alongX: true,
			outward: -1,
			silk: pads.minX - silkBox.minX,
			edge: pads.minX - board.minX,
		},
		{
			alongX: true,
			outward: 1,
			silk: silkBox.maxX - pads.maxX,
			edge: board.maxX - pads.maxX,
		},
		{
			alongX: false,
			outward: -1,
			silk: pads.minY - silkBox.minY,
			edge: pads.minY - board.minY,
		},
		{
			alongX: false,
			outward: 1,
			silk: silkBox.maxY - pads.maxY,
			edge: board.maxY - pads.maxY,
		},
	];

	const longest = sides.reduce((best, side) =>
		side.silk > best.silk ? side : best,
	);
	if (longest.silk > pitch) return longest;

	return sides.reduce((best, side) => (side.edge < best.edge ? side : best));
}

/** A header with bent pins and multiple rows, these are staggered to keep every tip visible */
function drawBentHeader(
	footprint: Footprint,
	board: Box,
	ids: Map<Pad, string>,
	bounds: Box,
) {
	const pitch = headerPitch(footprint);
	const { alongX, outward } = bentHeaderDirection(footprint, board, pitch);

	// Across runs along the pins towards their tips, along runs over the width of the header
	const acrossOf = (pad: Pad) => (alongX ? pad.x : pad.y);
	const alongOf = (pad: Pad) => (alongX ? pad.y : pad.x);
	const toPoint = (across: number, along: number) =>
		alongX ? { x: across, y: along } : { x: along, y: across };
	const polygon = (points: [number, number][], attributes: string) =>
		`<polygon points="${points
			.map(([across, along]) => {
				const { x, y } = toPoint(across, along);
				return `${n(x)},${n(y)}`;
			})
			.join(" ")}" ${attributes}/>`;
	const box = (
		acrossA: number,
		acrossB: number,
		alongA: number,
		alongB: number,
		fill: string,
		extra = "",
	) => {
		const a = toPoint(Math.min(acrossA, acrossB), Math.min(alongA, alongB));
		const b = toPoint(Math.max(acrossA, acrossB), Math.max(alongA, alongB));
		return rect(a.x, a.y, b.x - a.x, b.y - a.y, fill, extra);
	};

	const columns = [
		...new Set(footprint.pads.map((pad) => Math.round(acrossOf(pad)))),
	].sort((a, b) => (b - a) * outward);
	const rows = [
		...new Set(footprint.pads.map((pad) => Math.round(alongOf(pad)))),
	];

	const pinWidth = pitch * 0.31;
	const stagger = pitch / columns.length;
	const offsetOf = (column: number) => -0.12 * pitch - column * stagger;

	const housingInner = columns[0] + outward * pitch * 0.73;
	const housingOuter = housingInner + outward * pitch * 0.98;
	const housingStart = Math.min(...rows) - pitch * 0.9;
	const housingEnd = Math.max(...rows) + pitch * 0.25;

	let pins = "";
	footprint.pads.forEach((pad) => {
		const across = acrossOf(pad);
		const along = alongOf(pad);
		const column = columns.indexOf(Math.round(across));
		const center = along + offsetOf(column);
		const top = center - pinWidth / 2;
		const bottom = center + pinWidth / 2;

		const tip = housingOuter + outward * pitch * (2 + column * 0.42);
		const shoulder = tip - outward * pitch * 0.25;
		const legEnd = Math.max(bottom + pitch * 0.18, along - pitch * 0.05);

		pins += polygon(
			[
				[tip, center - pinWidth * 0.28],
				[shoulder, top],
				[across - outward * pitch * 0.06, top],
				[across - outward * pitch * 0.15, legEnd],
				[across + outward * pitch * 0.17, legEnd + pitch * 0.05],
				[across + outward * pitch * 0.22, bottom],
				[shoulder, bottom],
				[tip, center + pinWidth * 0.28],
			],
			`fill="${Colors.pinShade}"`,
		);
		pins += box(
			tip,
			tip - outward * pitch * 0.09,
			center - pinWidth * 0.28,
			center + pinWidth * 0.28,
			Colors.pinLight,
			`id="${ids.get(pad)}"`,
		);

		const tipPoint = toPoint(tip, center);
		includePoint(bounds, tipPoint.x, tipPoint.y);
	});

	let housing = box(
		housingInner,
		housingOuter,
		housingStart,
		housingEnd,
		Colors.housing,
	);
	rows.forEach((row) => {
		const edge = row + offsetOf(columns.length - 1);
		housing +=
			box(
				housingInner,
				housingOuter,
				edge - pinWidth / 2,
				edge,
				Colors.chipLight,
			) +
			box(
				housingInner,
				housingOuter,
				edge,
				edge + pinWidth / 2,
				Colors.housingDark,
				'fill-opacity="0.45"',
			);
	});

	const start = toPoint(housingOuter, housingStart);
	const end = toPoint(housingOuter, housingEnd);
	includePoint(bounds, start.x, start.y);
	includePoint(bounds, end.x, end.y);

	return { pins, housing };
}

/** A header pointing up out of the board, only the top of the housing is seen */
function drawTopHeader(footprint: Footprint, ids: Map<Pad, string>) {
	const pitch = headerPitch(footprint);
	const pinSize = pitch * 0.3;

	let result = "";
	footprint.pads.forEach((pad) => {
		result +=
			rect(
				pad.x - pitch / 2,
				pad.y - pitch / 2,
				pitch,
				pitch,
				Colors.housing,
				`stroke="${Colors.housingDark}" stroke-width="0.4"`,
			) +
			rect(
				pad.x - pinSize / 2,
				pad.y - pinSize / 2,
				pinSize,
				pinSize,
				Colors.pinLight,
				`id="${ids.get(pad)}"`,
			);
	});
	return result;
}

const GENERATED_NET = /^(\$|S\$|N\$|Net[-_]|unconnected)|^[a-z]+\d+_\S+$/i;

function pinLabel(pad: Pad) {
	const ref = pad.footprint?.ref || "PAD";
	return pad.number ? `${ref}.${pad.number}` : ref;
}

function assignPinNames(pads: Pad[]) {
	const used = new Map<string, number>();
	return pads.map((pad) => {
		const net = pad.net.trim().replace(/^\+/, "");
		const base = net && !GENERATED_NET.test(net) ? net : pinLabel(pad);
		const count = (used.get(base) ?? 0) + 1;
		used.set(base, count);
		return count === 1 ? base : `${base}${count}`;
	});
}

/** Finds the pads which wires are expected to connect to */
function selectPins(pads: Pad[], connectors: Set<Footprint>) {
	const usable = pads.filter(
		(pad) => (pad.plated || pad.net) && !isMountingPad(pad),
	);
	const preferred = usable.filter((pad) =>
		pad.footprint ? connectors.has(pad.footprint) : isThroughHole(pad),
	);
	if (preferred.length) return preferred;

	const throughHole = usable.filter(isThroughHole);
	return throughHole.length ? throughHole : usable;
}

export function convertEasyEDA(input: unknown): ConvertedBoard {
	const document = unwrapDocument(input);
	const type = getDocumentType(document);
	if (type !== "3") {
		throw Error(
			`The provided document is not an EasyEDA PCB (document type ${type ?? "unknown"}), schematics and footprints can't be imported`,
		);
	}

	const warnings: string[] = [];
	const board = parseBoard(document);
	if (!board.pads.length)
		throw Error("The provided PCB does not have any pads");

	const kinds = new Map(
		board.footprints.map((footprint) => [
			footprint,
			classifyFootprint(footprint),
		]),
	);
	const connectors = new Set(
		board.footprints.filter(
			(footprint) => kinds.get(footprint) === "connector",
		),
	);

	// Show the side that most parts are on, the rest of the board is seen from there
	const onBottom = board.footprints.filter(
		(footprint) =>
			!connectors.has(footprint) &&
			footprintLayer(footprint) === LAYER_BOTTOM_COPPER,
	).length;
	const onTop = board.footprints.filter(
		(footprint) =>
			!connectors.has(footprint) &&
			footprintLayer(footprint) === LAYER_TOP_COPPER,
	).length;
	const flipped = onBottom > onTop;
	const copperLayer = flipped ? LAYER_BOTTOM_COPPER : LAYER_TOP_COPPER;
	const silkLayer = flipped ? LAYER_BOTTOM_SILK : LAYER_TOP_SILK;

	const { paths: outlinePaths, bounds: outlineBounds } = buildOutline(
		board,
		warnings,
	);

	const padBounds = emptyBox();
	board.pads.forEach((pad) => {
		if (isVisibleOn(pad, copperLayer)) includeBox(padBounds, padBox(pad));
	});

	const hasOutline = !isEmptyBox(outlineBounds);
	const boardBox = hasOutline
		? outlineBounds
		: {
				minX: padBounds.minX - 10,
				minY: padBounds.minY - 10,
				maxX: padBounds.maxX + 10,
				maxY: padBounds.maxY + 10,
			};
	if (!hasOutline) {
		warnings.push(
			"The PCB has no board outline, a rectangle around its pads was used instead.",
		);
		outlinePaths.push(
			`M ${n(boardBox.minX)} ${n(boardBox.minY)} H ${n(boardBox.maxX)} V ${n(boardBox.maxY)} H ${n(boardBox.minX)} Z`,
		);
	}

	const bounds = emptyBox();
	includeBox(bounds, boardBox);
	includeBox(bounds, padBounds);

	// Default pins come first so they are the lowest connector numbers, like in Fritzing parts
	const visiblePads = board.pads.filter((pad) => isVisibleOn(pad, copperLayer));
	const pinPads = selectPins(visiblePads, connectors);
	const otherPads = visiblePads.filter((pad) => !pinPads.includes(pad));
	const ids = new Map<Pad, string>();
	[...pinPads, ...otherPads].forEach((pad, index) => {
		ids.set(pad, `connector${index}pin`);
	});

	const bodiesBelowPads: string[] = [];
	const bodiesAbovePads: string[] = [];
	const headerPins: string[] = [];
	const headerHousings: string[] = [];
	const padsOwnedByHeaders = new Set<Pad>();
	const bentHeaders = new Set<Footprint>();

	board.footprints.forEach((footprint) => {
		if (!footprint.pads.length) return;

		const kind = kinds.get(footprint) as FootprintKind;
		if (kind === "connector") {
			const visible = footprint.pads.every((pad) =>
				isVisibleOn(pad, copperLayer),
			);
			if (!visible) return;

			if (isBentHeader(footprint)) {
				const bent = drawBentHeader(footprint, boardBox, ids, bounds);
				bentHeaders.add(footprint);
				footprint.pads.forEach((pad) => {
					padsOwnedByHeaders.add(pad);
				});
				headerPins.push(bent.pins);
				headerHousings.push(bent.housing);
				return;
			}

			const edgeHeader = isPinHeader(footprint)
				? drawEdgeHeader(
						footprint,
						boardBox,
						[
							...visiblePads
								.filter((pad) => pad.footprint !== footprint)
								.map(padBox),
							...board.holes.map(({ x, y, radius }) => ({
								minX: x - radius,
								minY: y - radius,
								maxX: x + radius,
								maxY: y + radius,
							})),
						],
						ids,
						bounds,
					)
				: null;
			footprint.pads.forEach((pad) => {
				padsOwnedByHeaders.add(pad);
			});
			if (edgeHeader) {
				headerPins.push(edgeHeader.pins);
				headerHousings.push(edgeHeader.housing);
			} else {
				headerHousings.push(drawTopHeader(footprint, ids));
			}
			return;
		}

		if (footprintLayer(footprint) !== copperLayer) return;

		const body = drawBody(kind, footprint);
		if (footprint.pads.every(isThroughHole)) bodiesBelowPads.push(body);
		else bodiesAbovePads.push(body);
	});

	const padSvg = visiblePads.map((pad) =>
		renderPad(pad, padsOwnedByHeaders.has(pad) ? undefined : ids.get(pad)),
	);

	const holePaths = [
		...board.holes,
		...visiblePads
			.filter(isMountingPad)
			.map(({ x, y, holeRadius }) => ({ x, y, radius: holeRadius })),
	].map(
		({ x, y, radius }) =>
			`M ${n(x - radius)} ${n(y)} a ${n(radius)} ${n(radius)} 0 1 0 ${n(radius * 2)} 0 a ${n(radius)} ${n(radius)} 0 1 0 ${n(-radius * 2)} 0 Z`,
	);
	const holeRings = board.holes.map(({ x, y, radius }) =>
		circle(
			x,
			y,
			radius + 0.5,
			`fill="none" stroke="${Colors.padRing}" stroke-width="1"`,
		),
	);

	const silk = board.silk.filter(({ layer }) => layer === silkLayer);
	// Outlines of bent headers would only be in the way of the header that is drawn
	const silkShapes = silk
		.filter(
			({ isText, footprint }) =>
				!isText && !(footprint && bentHeaders.has(footprint)),
		)
		.map(({ svg }) => svg);
	const silkText = silk.filter(({ isText }) => isText).map(({ svg }) => svg);

	const width = bounds.maxX - bounds.minX;
	const height = bounds.maxY - bounds.minY;
	const flip = flipped
		? ` transform="matrix(-1 0 0 1 ${n(bounds.minX + bounds.maxX)} 0)"`
		: "";

	const svg = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="${n(width / UNITS_PER_INCH)}in" height="${n(height / UNITS_PER_INCH)}in" viewBox="${n(bounds.minX)} ${n(bounds.minY)} ${n(width)} ${n(height)}">
<g${flip}>
<path id="board" fill="${Colors.board}" fill-rule="evenodd" d="${[...outlinePaths, ...holePaths].join(" ")}"/>
<g id="holes">${holeRings.join("")}</g>
<g id="silkscreen">${silkShapes.join("")}</g>
<g id="bodies-below-pads">${bodiesBelowPads.join("")}</g>
<g id="pads">${padSvg.join("")}</g>
<g id="header-pins">${headerPins.join("")}</g>
<g id="headers">${headerHousings.join("")}</g>
<g id="bodies">${bodiesAbovePads.join("")}</g>
<g id="silkscreen-text">${silkText.join("")}</g>
</g>
</svg>
`;

	const pinNames = assignPinNames(pinPads);
	const otherNames = assignPinNames(otherPads);

	return {
		svg,
		pins: pinPads.map((pad, index) => ({
			name: pinNames[index],
			svgId: ids.get(pad) as string,
			label: pinLabel(pad),
		})),
		otherPads: otherPads.map((pad, index) => ({
			name: otherNames[index],
			svgId: ids.get(pad) as string,
			label: pinLabel(pad),
		})),
		warnings,
	};
}
