<script lang="ts">
import { arduino } from "@leaphy-robotics/leaphy-blocks";
import { serialization } from "blockly";
import { onMount, untrack } from "svelte";
import { _ } from "svelte-i18n";
import starling from "$assets/starling-svg.svg";
import SensorState from "$components/core/popups/popups/debugger/SensorState.svelte";
import Uploader from "$components/core/popups/popups/Uploader.svelte";
import Windowed from "$components/core/popups/Windowed.svelte";
import Button from "$components/ui/Button.svelte";
import Switch from "$components/ui/Switch.svelte";
import DebuggingSerializer from "$domain/blockly/debugging.svelte";
import BlocklyState from "$state/blockly.svelte";
import PopupsState from "$state/popup.svelte";
import SerialState, { Prompt } from "$state/serial.svelte";
import { track } from "$state/utils";
import WorkspaceState, { Mode } from "$state/workspace.svelte";

let motorDebugger = $derived(
	SerialState.log.debugger.debuggers?.find((e) => e.type.type === "motors"),
);
let leftSpeed = $derived(motorDebugger?.values?.[0] || 0);
let rightSpeed = $derived(-motorDebugger?.values?.[1] || 0);

let distance = $derived(
	SerialState.log.debugger.debuggers?.find(
		(e) => e.type.simulation === "distance",
	)?.values?.[0] ?? 1313,
);

let leftLineSensor = $derived(
	SerialState.log.debugger.debuggers?.find(
		(e) => e.type.simulation === "left_line_sensor",
	)?.values?.[0] ?? 1,
);
let rightLineSensor = $derived(
	SerialState.log.debugger.debuggers?.find(
		(e) => e.type.simulation === "right_line_sensor",
	)?.values?.[0] ?? 1,
);

const WHEEL_BASE = 203.392682906;
const AXIS_OFFSET = 31.4487804847;
const MAX_SPEED = 4;
const CM_TO_PX = (343 / 138) * 10;

let backgroundX = $state(0);
let backgroundY = $state(0);
let robotRotation = $state(0);
let currentCurveOffset = $state(0);

let proximityFactor = $derived(Math.max(0, Math.min(1, (30 - distance) / 30)));
let proximityScale = $derived(distance > 30 ? 1 : 0.5 + proximityFactor * 0.5);
let sonarHeight = $derived(distance * CM_TO_PX);

async function connect() {
	if (SerialState.port) {
		await SerialState.reset();
		return;
	}

	await SerialState.connect(Prompt.MAYBE);
}

function uploadCode() {
	PopupsState.open({
		component: Uploader,
		data: {
			getCode: async () => {
				if (WorkspaceState.Mode !== Mode.BLOCKS) {
					return WorkspaceState.code;
				}

				const cs = new CompressionStream("gzip");
				const stream = new Blob([
					JSON.stringify(serialization.workspaces.save(BlocklyState.workspace)),
				])
					.stream()
					.pipeThrough(cs);

				const compressedBlob = await new Response(stream).blob();
				const arrayBuffer = await compressedBlob.arrayBuffer();

				arduino.program = new Uint8Array(arrayBuffer);
				const code = arduino.workspaceToCode(BlocklyState.workspace);
				arduino.program = null;

				return code;
			},
		},
		allowInteraction: false,
	});
}

let firstRun = true;
$effect(() => {
	track(DebuggingSerializer.debugging);
	if (firstRun) {
		firstRun = false;
		return;
	}
	untrack(uploadCode);
});

function differentialDriveTick(leftSpeed: number, rightSpeed: number): void {
	const leftVelocity = (leftSpeed / 100) * MAX_SPEED;
	const rightVelocity = (rightSpeed / 100) * MAX_SPEED;
	const linearVelocity = (leftVelocity + rightVelocity) / 2;
	const angularVelocity = (rightVelocity - leftVelocity) / WHEEL_BASE;
	robotRotation += angularVelocity;
	robotRotation = Math.atan2(Math.sin(robotRotation), Math.cos(robotRotation));
	const dx =
		linearVelocity * Math.sin(robotRotation) +
		angularVelocity * AXIS_OFFSET * Math.cos(robotRotation);
	const dy =
		-linearVelocity * Math.cos(robotRotation) +
		angularVelocity * AXIS_OFFSET * Math.sin(robotRotation);
	backgroundX -=
		Math.cos(-robotRotation - Math.PI / 2) * Math.sqrt(dx ** 2 + dy ** 2);
	backgroundY -=
		Math.sin(-robotRotation - Math.PI / 2) * Math.sqrt(dx ** 2 + dy ** 2);

	let targetCurve = 0;
	if (leftLineSensor < 0.5 && rightLineSensor >= 0.5) {
		targetCurve = -250;
	} else if (rightLineSensor < 0.5 && leftLineSensor >= 0.5) {
		targetCurve = 250;
	} else if (leftLineSensor < 0.5 && rightLineSensor < 0.5) {
		targetCurve = 0;
	} else {
		targetCurve = 0;
	}

	currentCurveOffset += (targetCurve - currentCurveOffset) * 0.08;
}

onMount(() => {
	const interval = setInterval(
		() => differentialDriveTick(leftSpeed, rightSpeed),
		1000 / 60,
	);
	return () => clearInterval(interval);
});
</script>

<Windowed title={$_("DEBUGGER")}>
	{#snippet actions()}
		<Switch name={$_("DEBUGGING")} bind:checked={DebuggingSerializer.debugging} />
	{/snippet}
	{#if !SerialState.port || !SerialState.log.debugger.debuggers}
		<div class="flex justify-between items-center bg-primary text-on-primary w-full px-2.5 py-1.5 pl-2.5">
			<div>
				<div class="text-lg font-bold">{$_("NOT_CONNECTED")}</div>
				<div class="text-sm opacity-80">{$_("NOT_CONNECTED_DESC")}</div>
			</div>
			<Button mode={"accent"} name={$_("CHOOSE_ROBOT")} onclick={connect} />
		</div>
	{/if}
	<div class="viewport" class:near-mode={proximityFactor > 0}>
		{#if !DebuggingSerializer.debugging}
			<div class="debugging-off">
				<div class="flex flex-col gap-1.5">
					<div class="text-xl font-bold">{$_("DEBUGGING_OFF")}</div>
					<div class="opacity-70">{$_("DEBUGGING_OFF_DESC")}</div>
				</div>
				<Button mode="accent" name={$_("ENABLE_DEBUGGING")} onclick={() => { DebuggingSerializer.debugging = true; }} />
			</div>
		{/if}
		<div
			class="playground"
			style:scale={proximityScale}
			style:translate={`0 ${proximityFactor > 0 ? sonarHeight * proximityScale / 2 : 0}px`}
			style:transform-origin="center"
		>
			<div
				class="background"
				style:background-position-x={`${backgroundX}px`}
				style:background-position-y={`${backgroundY}px`}
				style:rotate={`${robotRotation}rad`}
			></div>

			<div class="robot-wrapper">
				{#if leftLineSensor === 0 || rightLineSensor === 0}
					<svg class="predicted-line" viewBox="0 0 800 800">
						<defs>
							<mask id="line-mask" maskUnits="userSpaceOnUse">
								<rect width="800" height="800" fill="url(#mask-fade)"/>
							</mask>
							<linearGradient id="mask-fade" x1="0" y1="800" x2="0" y2="0" gradientUnits="userSpaceOnUse">
								<stop offset="0%" stop-color="white"/>
								<stop offset="100%" stop-color="black"/>
							</linearGradient>
						</defs>
						<path
							d={`M 400 800 Q 400 400, ${400 + currentCurveOffset} 0`}
							stroke="black"
							stroke-width="90"
							fill="none"
							mask="url(#line-mask)"
						/>
					</svg>
				{/if}

				<div
					class="sonar-ray"
					style:height="{sonarHeight}px"
					style:opacity={proximityFactor > 0 ? 1 : 0}
				>
					<div class="distance-label">{distance.toFixed(1)} cm</div>
				</div>
				<img class="w-[300px] block z-[2]" src={starling} alt="Robot" />
			</div>
		</div>

		<div class="flex-1 min-w-0 z-10 overflow-y-auto overflow-x-hidden h-full">
			<SensorState />
		</div>
	</div>
</Windowed>

<style>
	.viewport {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 30px;
		padding: 40px;
		width: min(1000px, 90vw);
		height: min(600px, 70vh);
		overflow: hidden;
		position: relative;
	}

	.playground {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		transition: 0.4s ease-out;
	}

	.background {
		position: absolute;
		inset: -2000px;
		z-index: -1;
		background-image:
			linear-gradient(to right, #dcdcdc 1px, transparent 1px),
			linear-gradient(to bottom, #dcdcdc 1px, transparent 1px);
		background-size: 40px 40px;
	}

	.robot-wrapper {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.predicted-line {
		position: absolute;
		bottom: 100%;
		width: 800px;
		height: 800px;
		left: 50%;
		transform: translateX(-50%) translateY(300px);
		translate: 0 10px;
		z-index: 0;
		pointer-events: none;
	}

	.sonar-ray {
		position: absolute;
		bottom: 100%;
		width: 100px;
		background: linear-gradient(to top, rgba(0, 149, 255, 0.9), transparent);
		translate: 0 10px;
		z-index: 1;
		transition: opacity 0.4s ease-out, height 0.1s linear;
		display: flex;
		justify-content: center;
	}

	.sonar-ray::before {
		content: '';
		position: absolute;
		top: 0;
		width: 100px;
		height: 3px;
		background: #0095ff;
		border-radius: 2px;
	}

	.distance-label {
		position: absolute;
		top: -30px;
		font-family: 'JetBrains Mono', monospace;
		font-weight: bold;
		font-size: 13px;
		color: #0070c0;
		background: rgba(255, 255, 255, 0.9);
		padding: 2px 8px;
		border-radius: 4px;
		border: 1px solid #0095ff;
		white-space: nowrap;
	}

	.debugging-off {
		position: absolute;
		inset: 0;
		z-index: 20;
		background: var(--background);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 20px;
		text-align: center;
	}
</style>
