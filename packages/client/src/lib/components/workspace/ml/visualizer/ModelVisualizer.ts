import * as tf from "@tensorflow/tfjs";
import "./ModelVisualizer.css";

// --- Type Definitions ---
interface NodePosition {
	cx: number;
	cy: number;
}

interface RenderedLayer {
	nodes: SVGElement[];
	nodePositions: NodePosition[];
	connections: SVGElement[][];
}

interface VisualizerConfig {
	inputLabels?: string[];
	outputLabels?: string[];
	inputTitle?: string;
	outputTitle?: string;
}

// --- Helper Functions ---
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Maps a value to a color. Positive = blue, Negative = red.
function activationToColor(value: number): string {
	const intensity = Math.min(1, Math.abs(value)) * 200;
	if (value > 0) {
		// Blue scale for positive values
		return `rgb(${255 - intensity}, ${255 - intensity}, 255)`;
	}
	// Red scale for negative values
	return `rgb(255, ${255 - intensity}, ${255 - intensity})`;
}

// --- Main Visualizer Class ---
export class ModelVisualizer {
	private model: tf.LayersModel;
	private container: HTMLElement;
	private controlsContainer: HTMLElement;
	private outputContainer: HTMLElement;
	private config: VisualizerConfig;

	private readonly svg: SVGSVGElement;
	private renderedLayers: RenderedLayer[] = [];

	private inputSliders: HTMLInputElement[] = [];

	// --- Constants for rendering ---
	private readonly NODE_RADIUS = 15;
	private readonly LAYER_SPACING = 150;
	private readonly NODE_SPACING = 50;

	constructor(
		model: tf.LayersModel,
		container: HTMLElement,
		controlsContainer: HTMLElement,
		outputContainer: HTMLElement,
		config: VisualizerConfig = {},
	) {
		this.model = model;
		this.container = container;
		this.controlsContainer = controlsContainer;
		this.outputContainer = outputContainer;
		this.config = config;
		this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

		this.render();
		this.setupInputControls();
	}

	private getLayerUnitCount(
		layer: tf.layers.Layer,
		layerIndex: number,
	): number {
		if (layerIndex === 0) {
			// Input layer - get from batchInputShape
			return layer.batchInputShape?.[1] || 1;
		}
		// Hidden/output layers - get units from Dense layer config
		const denseLayer = layer as unknown as { units: number };
		return denseLayer.units || 1;
	}

	private drawNode(group: SVGGElement, cx: number, cy: number, label?: string) {
		const node = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"circle",
		);
		node.setAttribute("cx", `${cx}`);
		node.setAttribute("cy", `${cy}`);
		node.setAttribute("r", `${this.NODE_RADIUS}`);
		node.setAttribute("fill", "#DDD");
		node.setAttribute("stroke", "#333");
		node.setAttribute("stroke-width", "2");
		node.style.transition = "fill 0.3s ease";
		group.appendChild(node);

		// Add label if provided
		if (label) {
			const text = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"text",
			);
			text.setAttribute("x", `${cx}`);
			text.setAttribute("y", `${cy + this.NODE_RADIUS + 15}`);
			text.setAttribute("text-anchor", "middle");
			text.setAttribute("font-size", "11");
			text.setAttribute("font-family", "Arial, sans-serif");
			text.setAttribute("fill", "#333");
			text.textContent = label;
			group.appendChild(text);
		}

		return node;
	}

	private drawLayerTitle(
		group: SVGGElement,
		x: number,
		y: number,
		title: string,
	) {
		const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
		text.setAttribute("x", `${x}`);
		text.setAttribute("y", `${y}`);
		text.setAttribute("text-anchor", "middle");
		text.setAttribute("font-size", "14");
		text.setAttribute("font-weight", "bold");
		text.setAttribute("font-family", "Arial, sans-serif");
		text.setAttribute("fill", "#333");
		text.textContent = title;
		group.appendChild(text);
	}

	private render(): void {
		this.container.innerHTML = "";

		// Calculate total layers including input representation
		const totalLayers = this.model.layers.length + 1; // +1 for input visualization

		// Find max units across all layers for height calculation
		const maxUnits = Math.max(
			this.getLayerUnitCount(this.model.layers[0], 0), // input size
			...this.model.layers.map((layer, i) =>
				this.getLayerUnitCount(layer, i + 1),
			),
		);

		// Calculate max label width to ensure SVG is wide enough
		const allLabels = [
			...(this.config.inputLabels || []),
			...(this.config.outputLabels || []),
			this.config.inputTitle || "",
			this.config.outputTitle || "",
		];
		const maxLabelLength = Math.max(
			...allLabels.map((label) => label.length),
			0,
		);
		const labelWidthBuffer = Math.max(100, maxLabelLength * 6); // Approximate 6px per character

		// Calculate network width and center it in the SVG
		const networkWidth = totalLayers * this.LAYER_SPACING;
		const svgWidth = networkWidth; // Extra space for labels on both sides
		const networkXOffset = (svgWidth - networkWidth) / 2; // Center the network horizontally

		const svgHeight = maxUnits * this.NODE_SPACING; // Extra space for titles and labels

		this.svg.setAttribute("width", `${svgWidth}`);
		this.svg.setAttribute("height", `${svgHeight}`);
		this.container.appendChild(this.svg);

		const connectionsGroup = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"g",
		);
		const nodesGroup = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"g",
		);
		const labelsGroup = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"g",
		);
		this.svg.appendChild(connectionsGroup);
		this.svg.appendChild(nodesGroup);
		this.svg.appendChild(labelsGroup);

		let prevLayerPositions: NodePosition[] = [];

		// Render input layer first
		const inputSize = this.getLayerUnitCount(this.model.layers[0], 0);
		const inputLayer: RenderedLayer = {
			nodes: [],
			nodePositions: [],
			connections: [],
		};
		const inputLayerHeight = inputSize * this.NODE_SPACING;
		const inputYOffset = (svgHeight - inputLayerHeight) / 2;

		// Center the first layer horizontally
		const inputX = networkXOffset + 50;

		// Add input layer title if provided
		if (this.config.inputTitle) {
			this.drawLayerTitle(
				labelsGroup,
				inputX,
				inputYOffset - 30,
				this.config.inputTitle,
			);
		}

		for (let j = 0; j < inputSize; j++) {
			const cx = inputX;
			const cy = j * this.NODE_SPACING + inputYOffset + this.NODE_RADIUS;

			const inputLabel = this.config.inputLabels?.[j];
			const node = this.drawNode(labelsGroup, cx, cy, inputLabel);
			inputLayer.nodes.push(node);
			inputLayer.nodePositions.push({ cx, cy });
		}
		this.renderedLayers.push(inputLayer);
		prevLayerPositions = inputLayer.nodePositions;

		// Render model layers (Dense layers)
		this.model.layers.forEach((layer, i) => {
			const unitCount = this.getLayerUnitCount(layer, i + 1);
			const currentLayer: RenderedLayer = {
				nodes: [],
				nodePositions: [],
				connections: [],
			};
			const layerHeight = unitCount * this.NODE_SPACING;
			const yOffset = (svgHeight - layerHeight) / 2;

			// Center each layer horizontally
			const layerX = networkXOffset + (i + 1) * this.LAYER_SPACING + 50;

			// Add output layer title if this is the last layer and title is provided
			const isOutputLayer = i === this.model.layers.length - 1;
			if (isOutputLayer && this.config.outputTitle) {
				this.drawLayerTitle(
					labelsGroup,
					layerX,
					yOffset - 30,
					this.config.outputTitle,
				);
			}

			for (let j = 0; j < unitCount; j++) {
				const cx = layerX;
				const cy = j * this.NODE_SPACING + yOffset + this.NODE_RADIUS;

				// Use output labels if this is the output layer
				const nodeLabel = isOutputLayer
					? this.config.outputLabels?.[j]
					: undefined;
				const node = this.drawNode(labelsGroup, cx, cy, nodeLabel);
				currentLayer.nodes.push(node);
				currentLayer.nodePositions.push({ cx, cy });

				// Draw Connections to previous layer
				currentLayer.connections.push([]);
				prevLayerPositions.forEach((prevPos) => {
					const line = document.createElementNS(
						"http://www.w3.org/2000/svg",
						"line",
					);
					line.setAttribute("x1", `${prevPos.cx}`);
					line.setAttribute("y1", `${prevPos.cy}`);
					line.setAttribute("x2", `${cx}`);
					line.setAttribute("y2", `${cy}`);
					line.setAttribute("stroke", "#AAA");
					line.setAttribute("stroke-width", "1");
					line.style.transition = "stroke 0.2s ease, stroke-width 0.2s ease";
					connectionsGroup.appendChild(line);
					currentLayer.connections[j].push(line);
				});
			}
			this.renderedLayers.push(currentLayer);
			prevLayerPositions = currentLayer.nodePositions;
		});
	}

	private setupInputControls(): void {
		this.controlsContainer.innerHTML = "";
		const inputSize = this.getLayerUnitCount(this.model.layers[0], 0);

		// Add title for input controls if provided
		if (this.config.inputTitle) {
			const title = document.createElement("h3");
			title.innerText = this.config.inputTitle;
			title.style.marginBottom = "10px";
			this.controlsContainer.appendChild(title);
		}

		for (let i = 0; i < inputSize; i++) {
			const group = document.createElement("div");
			group.className = "slider-group";

			const label = document.createElement("label");
			// Use custom input label if provided, otherwise default
			label.innerText = this.config.inputLabels?.[i] || `Input ${i + 1}`;

			const slider = document.createElement("input");
			slider.type = "range";
			slider.min = "0";
			slider.max = "1";
			slider.step = "0.01";
			slider.value = "1";

			const output = document.createElement("output");
			output.innerText = Number.parseFloat(slider.value).toFixed(2);

			slider.addEventListener("input", () => {
				output.innerText = Number.parseFloat(slider.value).toFixed(2);
				this.runAnimation().then();
			});

			group.appendChild(label);
			group.appendChild(slider);
			group.appendChild(output);
			this.controlsContainer.appendChild(group);
			this.inputSliders.push(slider);
		}
		this.runAnimation().then(); // Initial run
	}

	private getActivations(input: tf.Tensor, layerIndex: number): tf.Tensor {
		const intermediateModel = tf.model({
			inputs: this.model.inputs,
			outputs: this.model.layers[layerIndex].output,
		});
		return intermediateModel.predict(input) as tf.Tensor;
	}

	public async runAnimation(): Promise<void> {
		// Reset styles
		this.renderedLayers.forEach((layer) => {
			layer.nodes.forEach((node) => node.setAttribute("fill", "#DDD"));
			layer.connections.flat().forEach((conn) => {
				conn.setAttribute("stroke", "#AAA");
				conn.setAttribute("stroke-width", "1");
			});
		});
		this.outputContainer.innerText = "Output: ...";

		const inputValues = this.inputSliders.map((s) =>
			Number.parseFloat(s.value),
		);
		const inputTensor = tf.tensor2d([inputValues], [1, inputValues.length]);

		let currentActivations = await inputTensor.data();

		// Animate input layer (index 0 in renderedLayers)
		this.renderedLayers[0].nodes.forEach((node, i) => {
			node.setAttribute("fill", activationToColor(currentActivations[i]));
		});
		await sleep(200);

		// Animate model layers (indices 1+ in renderedLayers)
		for (let i = 0; i < this.model.layers.length; i++) {
			const layer = this.model.layers[i];
			const [weights] = layer.getWeights();
			const weightsArr = (await weights.array()) as number[][];

			const nextActivationsTensor = this.getActivations(inputTensor, i);
			const nextActivations = await nextActivationsTensor.data();

			// Animate connections (renderedLayers index is i+1 because input layer is at index 0)
			const renderedLayerIndex = i + 1;
			this.renderedLayers[renderedLayerIndex].nodes.forEach((_node, j) => {
				this.renderedLayers[renderedLayerIndex].connections[j].forEach(
					(conn, k) => {
						const weight = weightsArr[k][j];
						const prevActivation = currentActivations[k];
						const strength = Math.tanh(prevActivation * weight); // Use tanh to keep it in a [-1, 1] range for styling

						conn.setAttribute("stroke", activationToColor(strength));
						conn.setAttribute("stroke-width", `${Math.abs(strength) * 4 + 1}`);
					},
				);
			});
			await sleep(350);

			// Animate nodes
			this.renderedLayers[renderedLayerIndex].nodes.forEach((node, j) => {
				node.setAttribute("fill", activationToColor(nextActivations[j]));
			});

			currentActivations = nextActivations;
			tf.dispose(nextActivationsTensor);
			await sleep(350);
		}

		// Display final output with custom labels if available
		let outputText: string;
		if (
			this.config.outputLabels &&
			this.config.outputLabels.length === currentActivations.length
		) {
			const labeledOutputs = Array.from(currentActivations)
				.map((v, i) => `${this.config.outputLabels?.[i]}: ${v.toFixed(3)}`)
				.join(", ");
			outputText = `Output: {${labeledOutputs}}`;
		} else {
			const finalOutput = Array.from(currentActivations)
				.map((v) => v.toFixed(3))
				.join(", ");
			outputText = `Output: [${finalOutput}]`;
		}

		this.outputContainer.innerText = outputText;
		tf.dispose(inputTensor);
	}

	// Method to update labels after initialization
	public updateConfig(newConfig: Partial<VisualizerConfig>): void {
		this.config = { ...this.config, ...newConfig };
		this.render();
		this.setupInputControls();
	}
}
