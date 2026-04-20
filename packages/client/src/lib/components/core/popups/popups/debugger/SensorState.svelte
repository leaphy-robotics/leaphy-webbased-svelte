<script lang="ts">
import SerialState from "$state/serial.svelte.js";
import { onMount } from "svelte";

let date = $state(Date.now());
onMount(() => {
	setInterval(() => {
		date = Date.now();
	}, 1);
});

function motorState(left: number, right: number) {
	if (left === 0 && right === 0) return "Stationary";
	if (left === right) return left > 0 ? "Forward" : "Backward";
	if (left === -right) return left > right ? "Right" : "Left";
	if (left > right) return "Curving right";
	return "Curving left";
}
</script>

{#if SerialState.log.debugger.debuggers?.length}
	<div class="grid grid-cols-2 gap-2.5 p-2.5 content-center h-full w-full">
		{#each SerialState.log.debugger.debuggers as sensor}
			<div class="flex flex-col bg-bg-tint rounded-xl p-2 gap-2 w-full">
				<div class="flex justify-between items-center font-bold text-base">
					<div>{sensor.type.name}</div>
					<div class="pulse" style:opacity={`${Math.max(sensor.lastSignal - date + 1000, 0)}%`}></div>
				</div>
				<div class="flex-1 flex gap-1.5 items-center">
					{#if sensor.type.type === "basic"}
						<div class="text-base font-mono">{sensor.values[0].toFixed(2)} {sensor.type.unit}</div>
					{/if}
					{#if sensor.type.type === "rgb"}
						<div class="rgb w-4 h-4 rounded-full scale-150 mr-1.5" style:--color={`rgb(${sensor.values.join(', ')})`}></div>
						<div class="text-base font-mono">{sensor.values.join(', ')}</div>
					{/if}
					{#if sensor.type.type === "servo"}
						<div class="servo" style:--angle={`${sensor.values[0]}deg`}>
							<div class="servo-pointer"></div>
						</div>
						<div class="text-base font-mono">{sensor.values[0]}°</div>
					{/if}
					{#if sensor.type.type === "motors"}
						<div class="flex gap-1 text-sm">
							<div class="bg-secondary p-1 rounded-lg">L: {sensor.values[0]}%</div>
							<div class="bg-secondary p-1 rounded-lg">R: {sensor.values[1] * -1}%</div>
							<div class="bg-secondary p-1 rounded-lg">{motorState(sensor.values[0], sensor.values[1]*-1)}</div>
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
{/if}

<style>
	@property --color {
		syntax: '<color>';
		inherits: false;
		initial-value: black;
	}

	.pulse {
		background: radial-gradient(circle, dodgerblue 8%, rgba(0, 0, 0, 0) 100%);
		width: 15px;
		height: 15px;
		border-radius: 100%;
		animation: pulse 2s infinite;
		transition: .3s ease;
	}

	.rgb {
		--color: black;
		background: radial-gradient(circle, var(--color) 8%, rgba(0, 0, 0, 0) 100%);
		transition: --color .3s ease;
	}

	.servo {
		--angle: 0deg;
		--size: 24px;
		width: var(--size);
		height: var(--size);
		position: relative;
		display: inline-block;
	}

	.servo::before {
		content: '';
		position: absolute;
		inset: 0;
		border: 3px solid #ddd;
		border-radius: 50%;
	}

	.servo::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 50%;
		background: conic-gradient(var(--accent) 0deg, var(--accent) var(--angle), transparent var(--angle));
		mask: radial-gradient(circle, transparent calc(var(--size) / 2 - 4px), black calc(var(--size) / 2 - 4px));
		transition: background 0.3s ease-out;
	}

	.servo-pointer {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 50%;
		height: 4px;
		background: #333;
		transform-origin: left center;
		transform: translateY(-50%) rotate(calc(var(--angle) - 90deg));
		border-radius: 0 5px 5px 0;
		z-index: 10;
		transition: transform 0.3s ease-out;
	}

	.servo-pointer::after {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		transform: translate(-50%, -50%);
		width: 8px;
		height: 8px;
		background: #333;
		border-radius: 50%;
	}

	@keyframes pulse {
		0% { transform: scale(1); }
		50% { transform: scale(1.3); }
		100% { transform: scale(1); }
	}
</style>
