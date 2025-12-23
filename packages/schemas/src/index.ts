import ELK, { type ElkNode, type ElkPort } from "elkjs";
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

	componentA: string;
	portA: string;
	componentB: string;
	portB: string;

	color: string;
}

const componentCache = {} as Record<string, LoadedComponent>;

const WireColor = {
	// Power lines
	GND: "#000000", // Black - Ground (standard)
	VCC: "#dc2626", // Red - Positive voltage (standard)
	VDD: "#dc2626", // Red - Positive supply voltage (standard)
	VSS: "#000000", // Black - Negative supply voltage (standard)

	// Data lines
	DATA_1: "#16a34a", // Green - Primary data line
	DATA_2: "#2563eb", // Blue - Secondary data line
	DATA_3: "#ca8a04", // Dark Yellow - Tertiary data line
	DATA_4: "#c026d3", // Magenta - Quaternary data line

	// Communication protocols
	SDA: "#0891b2", // Cyan - I2C Data
	SCL: "#eab308", // Yellow - I2C Clock
	TX: "#15803d", // Dark Green - UART Transmit
	RX: "#7c3aed", // Purple - UART Receive
	MOSI: "#22c55e", // Green - SPI Master Out Slave In
	MISO: "#3b82f6", // Blue - SPI Master In Slave Out
	SCK: "#eab308", // Yellow/Gold - SPI Clock
	CS: "#a855f7", // Purple - SPI Chip Select

	// Control signals
	RESET: "#991b1b", // Dark Red - Reset signal
	ENABLE: "#166534", // Dark Green - Enable signal
	INTERRUPT: "#6b21a8", // Indigo - Interrupt signal
	CLOCK: "#d97706", // Orange - Clock signal

	// Analog signals
	ANALOG_1: "#ec4899", // Pink - Primary analog
	ANALOG_2: "#06b6d4", // Cyan - Secondary analog
	ANALOG_3: "#b45309", // Brown - Tertiary analog

	// PWM signals
	PWM_1: "#8b5cf6", // Purple - Primary PWM
	PWM_2: "#10b981", // Emerald - Secondary PWM
	PWM_3: "#f59e0b", // Amber - Tertiary PWM

	// Shield and reference
	SHIELD: "#6b7280", // Gray - Shield/Screen
	REF: "#4b5563", // Dark Gray - Reference voltage
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
	public murphy = this.add("murphy", Murphy);
	public i2c = this.add("murphy-i2c", MurphyI2C);

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

	connect(portA: VisiblePort, portB: VisiblePort, color: string) {
		this.wires.push({
			id: crypto.randomUUID(),
			color,

			componentA: portA.component,
			portA: portA.port,
			componentB: portB.component,
			portB: portB.port,
		});
	}

	connectI2C(
		I2C: VisibleComponent,
		component: VisibleComponent,
		channel?: number,
	) {
		const channelPrefix = typeof channel === "undefined" ? "" : `C${channel}.`;

		this.connect(
			component.port("SDA"),
			I2C.port(`${channelPrefix}SDA`),
			WireColor.SDA,
		);
		this.connect(
			component.port("SCL"),
			I2C.port(`${channelPrefix}SCL`),
			WireColor.SCL,
		);

		if (typeof channel === "number") {
			this.connect(
				component.port("VCC"),
				I2C.port(`${channelPrefix}VCC`),
				WireColor.VCC,
			);
			this.connect(
				component.port("GND"),
				I2C.port(`${channelPrefix}GND`),
				WireColor.GND,
			);
		} else {
			this.connect(component.port("VCC"), I2C.port("SDA.3V3"), WireColor.VCC);
			this.connect(component.port("GND"), I2C.port("SDA.GND"), WireColor.GND);
		}
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

	const layout = await elk.layout(
		{
			id: "root",
			layoutOptions: {
				"elk.algorithm": "layered",
			},
			children: loadedComponents,
			edges: builder.wires.map((wire) => ({
				id: wire.id,
				sources: [`${wire.componentA}.${wire.portA}`],
				targets: [`${wire.componentB}.${wire.portB}`],
			})),
		},
		{
			layoutOptions: {
				"elk.portConstraints": "FIXED_POS",
				"elk.spacing.edgeEdge": "5",
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

	layout.edges.forEach((edge) => {
		const { color } = builder.wires.find(({ id }) => id === edge.id);
		const { sections } = edge as unknown as {
			sections: {
				startPoint: { x: number; y: number };
				endPoint: { x: number; y: number };
				bendPoints: { x: number; y: number }[];
			}[];
		};

		ctx.lineCap = "round";
		ctx.lineWidth = 4 * scale;
		ctx.strokeStyle = color;
		ctx.fillStyle = color;
		sections?.forEach((section) => {
			ctx.fillRect(
				(section.startPoint.x - 4) * scale,
				(section.startPoint.y - 4) * scale,
				8 * scale,
				8 * scale,
			);
			ctx.fillRect(
				(section.endPoint.x - 4) * scale,
				(section.endPoint.y - 4) * scale,
				8 * scale,
				8 * scale,
			);

			const path = new Path2D();
			const cornerRadius = 10; // Adjust this value to control the roundness

			// Start at the first point
			path.moveTo(section.startPoint.x * scale, section.startPoint.y * scale);

			if (section.bendPoints && section.bendPoints.length > 0) {
				const allPoints = [
					section.startPoint,
					...section.bendPoints,
					section.endPoint,
				];

				for (let i = 1; i < allPoints.length - 1; i++) {
					const prevPoint = allPoints[i - 1];
					const currentPoint = allPoints[i];
					const nextPoint = allPoints[i + 1];

					// Calculate vectors from current point to previous and next
					const toPrev = {
						x: prevPoint.x - currentPoint.x,
						y: prevPoint.y - currentPoint.y,
					};
					const toNext = {
						x: nextPoint.x - currentPoint.x,
						y: nextPoint.y - currentPoint.y,
					};

					// Normalize the vectors
					const prevLength = Math.sqrt(
						toPrev.x * toPrev.x + toPrev.y * toPrev.y,
					);
					const nextLength = Math.sqrt(
						toNext.x * toNext.x + toNext.y * toNext.y,
					);

					const toPrevNorm = {
						x: toPrev.x / prevLength,
						y: toPrev.y / prevLength,
					};
					const toNextNorm = {
						x: toNext.x / nextLength,
						y: toNext.y / nextLength,
					};

					// Calculate the actual radius (limited by segment length)
					const maxRadius = Math.min(
						cornerRadius,
						prevLength / 2,
						nextLength / 2,
					);

					// Calculate the start and end points of the curve
					const curveStart = {
						x: (currentPoint.x + toPrevNorm.x * maxRadius) * scale,
						y: (currentPoint.y + toPrevNorm.y * maxRadius) * scale,
					};
					const curveEnd = {
						x: (currentPoint.x + toNextNorm.x * maxRadius) * scale,
						y: (currentPoint.y + toNextNorm.y * maxRadius) * scale,
					};

					// Draw line to curve start, then curve to curve end
					path.lineTo(curveStart.x, curveStart.y);
					path.quadraticCurveTo(
						currentPoint.x * scale,
						currentPoint.y * scale,
						curveEnd.x,
						curveEnd.y,
					);
				}

				// Draw final line to end point
				path.lineTo(section.endPoint.x * scale, section.endPoint.y * scale);
			} else {
				// No bend points, just draw straight line
				path.lineTo(section.endPoint.x * scale, section.endPoint.y * scale);
			}

			ctx.stroke(path);
		});
	});
}

export { ComponentBuilder, layoutComponents, WireColor, type VisibleComponent };
export * from "./components";
