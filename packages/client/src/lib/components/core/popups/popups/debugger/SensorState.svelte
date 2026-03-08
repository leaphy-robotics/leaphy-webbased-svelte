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

	if (left === right) {
		if (left > 0) {
			return "Forward";
		}

		return "Backward";
	}

	if (left === -right) {
		if (left > right) {
			return "Right";
		}

		return "Left";
	}

	if (left > right) {
		return "Curving right";
	}

	return "Curving left";
}
</script>

{#if SerialState.log.debugger.debuggers?.length}
	<div class="content">
		{#each SerialState.log.debugger.debuggers as sensor}
			<div class="sensor">
				<div class="header">
					<div class="name">{sensor.type.name}</div>
					<div class="pulse" style:opacity={`${Math.max(sensor.lastSignal - date + 1000, 0)}%`}></div>
				</div>
				<div class="sensor-content">
					{#if sensor.type.type === "basic"}
						<div class="value">
							{sensor.values[0].toFixed(2)} {sensor.type.unit}
						</div>
					{/if}
					{#if sensor.type.type === "rgb"}
						<div class="rgb" style:--color={`rgb(${sensor.values.join(', ')})`}></div>
						<div class="value">{sensor.values.join(', ')}</div>
					{/if}
					{#if sensor.type.type === "servo"}
						<div class="servo" style:--angle={`${sensor.values[0]}deg`}>
							<div class="servo-pointer"></div>
						</div>
						<div class="value">{sensor.values[0]}°</div>
					{/if}
					{#if sensor.type.type === "motors"}
						<div class="motors-content">
							<div class="motor">L: {sensor.values[0]}%</div>
							<div class="motor">R: {sensor.values[1] * -1}%</div>
							<div class="motor">{motorState(sensor.values[0], sensor.values[1]*-1)}</div>
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
{/if}

<style>
	.content {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 10px;
		padding: 10px;
		/*width: 600px;*/
	}

	.sensor {
		display: flex;
		flex-direction: column;
		background: var(--background-tint);
		border-radius: 10px;
		padding: 8px;
		gap: 8px;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-weight: bold;
		font-size: 16px;
	}

	.pulse {
		background: radial-gradient(circle, dodgerblue 8%, rgba(0, 0, 0, 0) 100%);
		width: 15px;
		height: 15px;
		border-radius: 100%;
		animation: pulse 2s infinite;
		transition: .3s ease;
	}

	.value {
		font-size: 16px;
		font-family: monospace;
	}

	.sensor-content {
		flex: 1;
		display: flex;
		gap: 5px;
		align-items: center;
	}

	@property --color {
		syntax: '<color>';
		inherits: false;
		initial-value: black;
	}

	.rgb {
		width: 16px;
		height: 16px;
		border-radius: 100%;
		scale: 1.5;
		margin-right: 5px;
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

	/* Circular outline base */
	.servo::before {
		content: '';
		position: absolute;
		inset: 0;
		border: 3px solid #ddd;
		border-radius: 50%;
	}

	/* Active arc portion (fills based on angle) */
	.servo::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 50%;
		background: conic-gradient(
			var(--accent) 0deg,
			var(--accent) var(--angle),
			transparent var(--angle)
		);
		mask: radial-gradient(
			circle,
			transparent calc(var(--size) / 2 - 4px),
			black calc(var(--size) / 2 - 4px)
		);
		transition: background 0.3s ease-out;
	}

	/* Servo pointer */
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

	/* Center dot */
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

	.motors-content {
		display: flex;
		gap: 3px;
		font-size: 14px;
	}

	.motor {
		background: var(--secondary);
		padding: 3px;
		border-radius: 5px;
	}

	@keyframes pulse {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.3);
		}
		100% {
			transform: scale(1);
		}
	}
</style>
