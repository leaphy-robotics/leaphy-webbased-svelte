<script>
	let { leftSpeed = 0, rightSpeed = 0 } = $props();

	// Constants for visualization
	const SIZE = 200;
	const CENTER = SIZE / 2;
	const SCALE = 80; // Max length of the arrow
	const WHEEL_BASE = 1; // Normalized distance between wheels

	let arrowPath = $derived.by(() => {
		// Normalize inputs to -1, 1 range
		const L = Math.max(-1, Math.min(1, leftSpeed));
		const R = Math.max(-1, Math.min(1, rightSpeed));

		// Case 1: Dead Stop
		if (Math.abs(L) < 0.01 && Math.abs(R) < 0.01) return "";

		// Case 2: Perfect Rotation (Opposite directions)
		if (Math.abs(L + R) < 0.01) {
			const direction = R > 0 ? 1 : -1;
			// Draws a 3/4 circle to indicate rotation
			return `M ${CENTER} ${CENTER - 40}
              A 40 40 0 1 ${direction === 1 ? 1 : 0} ${CENTER + 0.1} ${CENTER - 40}`;
		}

		// Case 3: Straight line (Equal speeds)
		if (Math.abs(L - R) < 0.01) {
			return `M ${CENTER} ${CENTER} L ${CENTER} ${CENTER - L * SCALE}`;
		}

		// Case 4: Differential Steering (Arcs)
		// Formula for radius: R = (W/2) * (vL + vR) / (vR - vL)
		const radius = (WHEEL_BASE / 2) * (L + R) / (R - L);
		const speedSum = (L + R) / 2;

		// Calculate arc parameters
		const sweepFlag = R > L ? 1 : 0;
		const bend = (R - L) * 1.5; // How much it curves
		const targetX = CENTER + (1 - Math.cos(bend)) * radius * SCALE;
		const targetY = CENTER - Math.sin(bend) * Math.sign(speedSum) * Math.abs(radius) * SCALE;

		// For visual simplicity in the component, we'll use a quadratic curve
		// to approximate the differential path for the SVG
		const ctrlX = CENTER;
		const ctrlY = CENTER - speedSum * SCALE;
		const endX = CENTER + (R - L) * SCALE * 0.5;
		const endY = CENTER - speedSum * SCALE;

		return `M ${CENTER} ${CENTER} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`;
	});

	// Calculate rotation for the arrowhead
	let headTransform = $derived.by(() => {
		if (Math.abs(leftSpeed - rightSpeed) < 0.01) {
			return `translate(${CENTER}, ${CENTER - leftSpeed * SCALE}) rotate(${leftSpeed >= 0 ? 0 : 180})`;
		}
		// Simple rotation based on differential
		const angle = (rightSpeed - leftSpeed) * 45;
		const offset = (leftSpeed + rightSpeed) / 2 * SCALE;
		return `translate(${CENTER + (rightSpeed - leftSpeed) * SCALE * 0.5}, ${CENTER - offset}) rotate(${angle})`;
	});
</script>

<svg viewBox="0 0 {SIZE} {SIZE}" width={SIZE} height={SIZE}>
	<circle cx={CENTER} cy={CENTER} r="6" fill="currentColor" />

	<path
		d={arrowPath}
		fill="none"
		stroke="currentColor"
		stroke-width="4"
		stroke-linecap="round"
	/>

	<g transform={headTransform}>
		<path
			d="M -6 0 L 0 -10 L 6 0 Z"
			fill="currentColor"
		/>
	</g>
</svg>

<style>
	svg {
		color: #333;
		transition: all 0.2s ease;
	}
</style>
