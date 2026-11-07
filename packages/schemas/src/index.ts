import ELK, { type ElkNode, type ElkPort } from "elkjs";
import { CABLE_SPACING, type Point, routeCable, wirePath } from "./cable";
import { type Component, MurphyI2C } from "./components";
import Murphy from "./components/murphy";

interface LoadedComponent {
	src: string;
	content: string;

	width: number;
	height: number;
	ports: ElkPort[];
}

interface Wire {
	id: string;
	/** Wires with the same cable are in the same connector */
	cable: string;

	componentA: string;
	portA: string;
	componentB: string;
	portB: string;

	color: string;
}

const componentCache = {} as Record<string, LoadedComponent>;

/** The colors of the wires in Leaphy cables */
const WireColor = {
	BLACK: "#000000",
	RED: "#dc2626",
	YELLOW: "#facc15",
	ORANGE: "#f59e0b",
	WHITE: "#ffffff",
};

/** A white wire can't be seen on a white background without this outline */
const WHITE_WIRE_OUTLINE = "#9ca3af";

/** The wires of the Leaphy cables, in the order that they are in their connector */
const Cables: Record<number, string[]> = {
	2: [WireColor.RED, WireColor.BLACK],
	3: [WireColor.RED, WireColor.BLACK, WireColor.YELLOW],
	4: [WireColor.ORANGE, WireColor.WHITE, WireColor.RED, WireColor.BLACK],
};

interface VisiblePort {
	component: string;
	port: string;
}

class JoinedComponent {
	constructor(
		public components: VisibleComponent[],
		public id: string = crypto.randomUUID(),
	) {}
}

class VisibleComponent {
	constructor(
		public component: Component,
		public id: string = crypto.randomUUID(),
	) {}

	port(port: string): VisiblePort {
		if (!this.component.mappings[port]) {
			throw Error(
				`Port ${port} not found on ${this.id} (${this.component.schema})`,
			);
		}

		return {
			component: this.id,
			port: port,
		};
	}
}

class ComponentBuilder {
	public components: JoinedComponent[] = [];
	public wires: Wire[] = [];
	public murphy: VisibleComponent;
	public i2c: VisibleComponent;

	constructor() {
		this.murphy = this.add("murphy", Murphy);
		this.i2c = this.add("murphy-i2c", MurphyI2C);
		this.join(this.murphy, this.i2c);
	}

	add(id: string, component: Component) {
		const existingComponent = this.components.find(
			(component) => component.id === id,
		);
		if (existingComponent) {
			return existingComponent.components[0];
		}

		const visibleComponent = new VisibleComponent(component, id);
		const joined = new JoinedComponent([visibleComponent], visibleComponent.id);
		this.components.push(joined);

		return visibleComponent;
	}

	join(...components: VisibleComponent[]) {
		const identifiers = components.map((component) => component.id);
		this.components = this.components.filter(
			(component) => !identifiers.includes(component.id),
		);

		this.components.push(new JoinedComponent(components));
	}

	private connect(
		cable: string,
		portA: VisiblePort,
		portB: VisiblePort,
		color: string,
	) {
		const connects = (wire: Wire, a: VisiblePort, b: VisiblePort) =>
			wire.componentA === a.component &&
			wire.portA === a.port &&
			wire.componentB === b.component &&
			wire.portB === b.port;
		// Generators run for every block, which can be many for the same component
		if (
			this.wires.some(
				(wire) => connects(wire, portA, portB) || connects(wire, portB, portA),
			)
		) {
			return;
		}

		this.wires.push({
			id: crypto.randomUUID(),
			cable,
			color,

			componentA: portA.component,
			portA: portA.port,
			componentB: portB.component,
			portB: portB.port,
		});
	}

	/**
	 * Connects the pins of a connector using a single cable, list the pins in the
	 * order they are in on the connector. A cable can't be split, so its colors can
	 * only be flipped around, they won't always match the function of a pin:
	 * - GND is black on 2 and 4 pin cables, the other pins take the wire that's next
	 * - 3 pin cables have black in the middle, where our connectors have VCC. Their
	 *   red wire goes on GND, which puts the yellow wire on the signal pin
	 */
	connectCable(...pins: [VisiblePort, VisiblePort][]) {
		const cable = Cables[pins.length];
		if (!cable) throw Error(`There is no cable with ${pins.length} pins`);

		const ground = pins.findIndex((ports) =>
			ports.some(({ port }) => /gnd/i.test(port)),
		);
		const groundWire = pins.length === 3 ? WireColor.RED : WireColor.BLACK;
		const colors =
			ground === -1 || cable[ground] === groundWire
				? cable
				: [...cable].reverse();

		const id = crypto.randomUUID();
		pins.forEach(([portA, portB], index) => {
			this.connect(id, portA, portB, colors[index]);
		});
	}

	connectI2C(
		I2C: VisibleComponent,
		component: VisibleComponent,
		channel?: number,
	) {
		const channelPrefix = typeof channel === "undefined" ? "" : `C${channel}.`;
		const onChannel = typeof channel === "number";

		this.connectCable(
			[component.port("SDA"), I2C.port(`${channelPrefix}SDA`)],
			[component.port("SCL"), I2C.port(`${channelPrefix}SCL`)],
			[
				component.port("VCC"),
				I2C.port(onChannel ? `${channelPrefix}VCC` : "SDA.3V3"),
			],
			[
				component.port("GND"),
				I2C.port(onChannel ? `${channelPrefix}GND` : "SDA.GND"),
			],
		);
	}

	clear() {
		this.components = [];
		this.wires = [];
	}
}

const elk = new ELK();

function augmentComponent(id: string, component: LoadedComponent) {
	return {
		id,
		...component,
		ports: component.ports.map((port) => ({
			...port,
			id: `${id}.${port.id}`,
		})),
	};
}

async function getLoadedComponent(node: VisibleComponent) {
	const { component, id } = node;
	if (componentCache[component.schema]) {
		return augmentComponent(id, componentCache[component.schema]);
	}

	const content = await fetch(component.schema).then((res) => res.text());

	const svgParent = document.createElement("div");
	svgParent.style.visibility = "hidden";
	svgParent.style.position = "fixed";
	svgParent.style.top = "0";

	document.body.appendChild(svgParent);
	svgParent.innerHTML = content;

	const svg = svgParent.querySelector("svg");
	if (!svg) throw new Error("Component is not a valid SVG");

	const svgBlob = new Blob([content], { type: "image/svg+xml" });
	const url = URL.createObjectURL(svgBlob);

	const loadedComponent: LoadedComponent = {
		src: url,
		content: content,

		width: svg.getBoundingClientRect().width,
		height: svg.getBoundingClientRect().height,
		ports: Object.entries(component.mappings).map(([id, svgId]) => {
			const position = svg.getElementById(svgId)?.getBoundingClientRect();

			return {
				id,
				x: position.x + position.width / 2,
				y: position.y + position.height / 2,
			};
		}),
	};

	document.body.removeChild(svgParent);
	componentCache[component.schema] = loadedComponent;

	return augmentComponent(id, loadedComponent);
}

function getLoadedComponents(builder: ComponentBuilder) {
	return Promise.all(
		builder.components.map(async (node) => {
			const loadedComponents = await Promise.all(
				node.components.map((component) => getLoadedComponent(component)),
			);

			const width = loadedComponents.reduce(
				(acc, component) => acc + component.width,
				0,
			);
			const height = Math.max(
				...loadedComponents.map((component) => component.height),
			);

			const src = loadedComponents.map((component) => ({
				url: component.src,
				width: component.width,
				height: component.height,
			}));

			let offsetX = 0;
			const ports = loadedComponents.flatMap((component) => {
				const result = component.ports.map((port) => ({
					...port,
					x: port.x + offsetX,
				}));

				offsetX += component.width;
				return result;
			});

			return {
				id: crypto.randomUUID(),
				src,
				width,
				height,
				ports,
			};
		}),
	);
}

async function layoutComponents(
	canvas: HTMLCanvasElement,
	builder: ComponentBuilder,
) {
	const loadedComponents = await getLoadedComponents(builder);

	// Pins are in the coordinates of the component they're on
	const pins = new Map(
		loadedComponents.flatMap((node) =>
			node.ports.map((port) => [
				port.id,
				{ node, x: port.x ?? 0, y: port.y ?? 0 },
			]),
		),
	);

	const wiresByCable = new Map<string, Wire[]>();
	for (const wire of builder.wires) {
		wiresByCable.set(wire.cable, [
			...(wiresByCable.get(wire.cable) ?? []),
			wire,
		]);
	}

	const cables = [...wiresByCable.values()].map((wires) => ({
		id: wires[0].cable,
		wires,
		pinsA: wires.map((wire) => pins.get(`${wire.componentA}.${wire.portA}`)),
		pinsB: wires.map((wire) => pins.get(`${wire.componentB}.${wire.portB}`)),
	}));

	// A cable is routed as a single line from the middle of its pins on each side
	const portsOf = (
		end: string,
		cablePins: (typeof cables)[number]["pinsA"],
	) => ({
		id: end,
		node: cablePins[0].node,
		x: cablePins.reduce((total, { x }) => total + x, 0) / cablePins.length,
		y: cablePins.reduce((total, { y }) => total + y, 0) / cablePins.length,
	});
	const cablePorts = cables.flatMap((cable) => [
		portsOf(`${cable.id}.a`, cable.pinsA),
		portsOf(`${cable.id}.b`, cable.pinsB),
	]);

	const layout = await elk.layout(
		{
			id: "root",
			layoutOptions: {
				"elk.algorithm": "layered",
			},
			children: loadedComponents.map((node) => ({
				...node,
				ports: cablePorts
					.filter((port) => port.node === node)
					.map(({ id, x, y }) => ({ id, x, y })),
			})),
			edges: cables.map(({ id }) => ({
				id,
				sources: [`${id}.a`],
				targets: [`${id}.b`],
			})),
		},
		{
			layoutOptions: {
				"elk.portConstraints": "FIXED_POS",
				"elk.spacing.edgeEdge": String(CABLE_SPACING),
				"elk.spacing.edgeNode": String(CABLE_SPACING),
				"elk.layered.spacing.edgeEdgeBetweenLayers": String(CABLE_SPACING),
				"elk.layered.spacing.edgeNodeBetweenLayers": String(CABLE_SPACING),
			},
		},
	);

	const { width, height } = layout as unknown as {
		width: number;
		height: number;
	};
	const scale = 4;

	canvas.width = width * scale;
	canvas.height = height * scale;

	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Could not obtain canvas context");

	function renderLayout(nodes: ElkNode[]) {
		return Promise.all(
			nodes.map(async (component) => {
				const loadedComponent = nodes.find(({ id }) => id === component.id);
				if (!loadedComponent) return;

				let offsetX = 0;
				await Promise.all(
					(
						loadedComponent as unknown as {
							src: { url: string; width: number; height: number }[];
						}
					).src.map(async (src) => {
						const offset = offsetX;
						offsetX += src.width;

						const image = new Image();
						await new Promise((resolve) => {
							image.addEventListener("load", resolve);
							image.src = src.url;
						});

						ctx.drawImage(
							image,
							(component.x + offset || 0) * scale,
							(component.y || 0) * scale,
							(src.width || 0) * scale,
							(src.height || 0) * scale,
						);
					}),
				);
			}),
		);
	}

	await renderLayout(layout.children);

	const nodePositions = new Map(
		layout.children.map(({ id, x, y }) => [id, { x: x ?? 0, y: y ?? 0 }]),
	);
	const onCanvas = ({
		node,
		x,
		y,
	}: (typeof cables)[number]["pinsA"][number]) => {
		const position = nodePositions.get(node.id);
		return { x: x + position.x, y: y + position.y };
	};

	ctx.lineCap = "round";
	layout.edges.forEach((edge) => {
		const cable = cables.find(({ id }) => id === edge.id);
		const { sections } = edge as unknown as {
			sections?: {
				startPoint: Point;
				endPoint: Point;
				bendPoints?: Point[];
			}[];
		};

		const pinsA = cable.pinsA.map(onCanvas);
		const pinsB = cable.pinsB.map(onCanvas);
		const route = (sections ?? []).flatMap((section) => [
			section.startPoint,
			...(section.bendPoints ?? []),
			section.endPoint,
		]);
		const paths = routeCable(route, pinsA, pinsB).map((wire) =>
			wirePath(wire, scale),
		);

		// Outlines go first, between other wires they'd only be in the way
		ctx.strokeStyle = WHITE_WIRE_OUTLINE;
		ctx.lineWidth = 5 * scale;
		cable.wires.forEach(({ color }, index) => {
			if (color === WireColor.WHITE) ctx.stroke(paths[index]);
		});

		ctx.lineWidth = 4 * scale;
		cable.wires.forEach(({ color }, index) => {
			ctx.strokeStyle = color;
			ctx.stroke(paths[index]);
		});

		cable.wires.forEach(({ color }, index) => {
			for (const { x, y } of [pinsA[index], pinsB[index]]) {
				ctx.fillStyle = color;
				ctx.fillRect((x - 4) * scale, (y - 4) * scale, 8 * scale, 8 * scale);
				if (color === WireColor.WHITE) {
					ctx.strokeStyle = WHITE_WIRE_OUTLINE;
					ctx.lineWidth = 0.5 * scale;
					ctx.strokeRect(
						(x - 4) * scale,
						(y - 4) * scale,
						8 * scale,
						8 * scale,
					);
				}
			}
		});
	});
}

export * from "./components";
export { ComponentBuilder, layoutComponents, WireColor };
