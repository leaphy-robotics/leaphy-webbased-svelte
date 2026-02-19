<script lang="ts">
	import starling from "$assets/starling-svg.svg"
	import Windowed from "$components/core/popups/Windowed.svelte";
	import { onMount } from "svelte";
	import SerialState from "$state/serial.svelte"
	import Debugger from "$components/core/popups/popups/debugger/Debugger.svelte";

	let motorDebugger = $derived(SerialState.log.debugger.debuggers?.find(e => e.type.type === 'motors'))
	let leftSpeed = $derived(motorDebugger?.values?.[0] || 0)
	let rightSpeed = $derived(-motorDebugger?.values?.[1] || 0)

	let distance = $derived(SerialState.log.debugger.debuggers?.find(e => e.type.type === 'basic' && e.type.unit === 'cm')?.values?.[0] ?? 1313)

	const WHEEL_BASE = 203.392682906;
	const AXIS_OFFSET = 31.4487804847;
	const MAX_SPEED = 4;
	const CM_TO_PX = (343 / 138) * 10;

	let backgroundX = $state(0)
	let backgroundY = $state(0)
	let robotRotation = $state(0)

	let proximityFactor = $derived(Math.max(0, Math.min(1, (30 - distance) / 30)));
	let proximityScale = $derived(distance > 30 ? 1 : 0.5 + (proximityFactor * 0.5));
	let sonarHeight = $derived(distance * CM_TO_PX);

	function differentialDriveTick(leftSpeed: number, rightSpeed: number): void {
		const leftVelocity = (leftSpeed / 100) * MAX_SPEED;
		const rightVelocity = (rightSpeed / 100) * MAX_SPEED;
		const linearVelocity = (leftVelocity + rightVelocity) / 2;
		const angularVelocity = (rightVelocity - leftVelocity) / WHEEL_BASE;
		robotRotation += angularVelocity;
		robotRotation = Math.atan2(Math.sin(robotRotation), Math.cos(robotRotation));
		const dx = linearVelocity * Math.sin(robotRotation) + angularVelocity * AXIS_OFFSET * Math.cos(robotRotation);
		const dy = -linearVelocity * Math.cos(robotRotation) + angularVelocity * AXIS_OFFSET * Math.sin(robotRotation);
		backgroundX -= Math.cos(-robotRotation - Math.PI / 2) * Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
		backgroundY -= Math.sin(-robotRotation - Math.PI / 2) * Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
	}

	onMount(() => {
		const interval = setInterval(() => differentialDriveTick(leftSpeed, rightSpeed), 1000 / 60)
		return () => clearInterval(interval);
	})
</script>

<Windowed title="VISUAL">
	<div class="viewport" class:near-mode={proximityFactor > 0}>
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
				<div
					class="sonar-ray"
					style:height="{sonarHeight}px"
					style:opacity={proximityFactor > 0 ? 1 : 0}
				>
					<div class="distance-label">{distance.toFixed(1)} cm</div>
				</div>
				<img class="robot" src={starling} alt="Robot" />
			</div>
		</div>

		<div class="debugger">
			<Debugger />
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
		height: 700px; /* Slightly taller to accommodate the scale */
		overflow: hidden;
		position: relative;
	}

	.playground {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		/* Padding-top transition ensures the playground grows to fit the ray */
		transition: 0.4s ease-out;
	}

	.background {
		position: absolute;
		/* Important: inset must cover the entire potential height of the ray */
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

	.robot {
		width: 300px;
		display: block;
		z-index: 2;
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

	.debugger {
		width: 500px;
		z-index: 10;
	}
</style>
