<script lang="ts">
interface Props {
	/** Current upload phase: idle | compiling | uploading | done | error */
	state?: "idle" | "compiling" | "uploading" | "done" | "error";
}

const { state = "idle" }: Props = $props();

const beaming = $derived(state === "compiling" || state === "uploading");
const broken = $derived(state === "error");
const happy = $derived(state === "done");
</script>

<div class="robot-wrap" class:broken class:happy class:beaming>
	<svg
		viewBox="0 0 240 200"
		xmlns="http://www.w3.org/2000/svg"
		class="robot"
		aria-hidden="true"
	>
		<!-- Code beam (shown while compiling/uploading) -->
		<g class="beam">
			<text x="20" y="40" class="beam-char" style="--i:0">{'{ }'}</text>
			<text x="35" y="60" class="beam-char" style="--i:1">01</text>
			<text x="25" y="80" class="beam-char" style="--i:2">&lt;/&gt;</text>
			<text x="40" y="100" class="beam-char" style="--i:3">10</text>
			<text x="22" y="120" class="beam-char" style="--i:4">fn()</text>
		</g>

		<!-- Antenna wires (the curved cables on top) -->
		<g class="antennas">
			<path
				class="antenna antenna-left"
				d="M 85 115 C 85 80, 110 70, 120 95"
				fill="none"
				stroke="#3f3d56"
				stroke-width="4"
				stroke-linecap="round"
			/>
			<path
				class="antenna antenna-right"
				d="M 155 115 C 155 75, 125 60, 115 95"
				fill="none"
				stroke="#1e90e8"
				stroke-width="4"
				stroke-linecap="round"
			/>
			<!-- antenna bases -->
			<rect class="part" x="80" y="112" width="12" height="10" fill="#4a4a4a" />
			<rect class="part" x="150" y="112" width="12" height="10" fill="#4a4a4a" />
		</g>

		<!-- Robot body -->
		<g class="body">
			<!-- top rail -->
			<rect class="part rail" x="60" y="120" width="125" height="6" fill="#c9c9c9" />
			<!-- main chassis -->
			<rect class="part chassis" x="68" y="126" width="109" height="45" fill="#3f3d56" rx="2" />
			<!-- side pillars -->
			<rect class="part pillar-l" x="65" y="120" width="8" height="58" fill="#6e6e6e" />
			<rect class="part pillar-r" x="172" y="120" width="8" height="58" fill="#6e6e6e" />
			<!-- bottom rail -->
			<rect class="part rail" x="60" y="171" width="125" height="6" fill="#c9c9c9" />
			<!-- legs -->
			<rect class="part leg-l" x="72" y="177" width="8" height="12" fill="#4a4a4a" />
			<rect class="part leg-r" x="165" y="177" width="8" height="12" fill="#4a4a4a" />

			<!-- Eyes (sensors) -->
			<g class="eye eye-left">
				<circle cx="100" cy="148" r="11" fill="#e6e6e6" />
				<circle class="pupil" cx="100" cy="148" r="7" fill="#17a821" />
				<circle class="glint" cx="100" cy="148" r="3" fill="#ffffff" />
			</g>
			<g class="eye eye-right">
				<circle cx="138" cy="148" r="11" fill="#e6e6e6" />
				<circle class="pupil" cx="138" cy="148" r="7" fill="#17a821" />
				<circle class="glint" cx="138" cy="148" r="3" fill="#ffffff" />
			</g>

			<!-- Mouth (smile on done) -->
			<path
				class="mouth"
				d="M 110 165 Q 120 165 130 165"
				fill="none"
				stroke="#ffffff"
				stroke-width="2"
				stroke-linecap="round"
			/>
		</g>

		<!-- Sparkles on done -->
		<g class="sparkles">
			<text x="50" y="50" class="sparkle" style="--i:0">✦</text>
			<text x="195" y="60" class="sparkle" style="--i:1">✦</text>
			<text x="200" y="130" class="sparkle" style="--i:2">✧</text>
			<text x="45" y="140" class="sparkle" style="--i:3">✧</text>
		</g>
	</svg>
</div>

<style>
	.robot-wrap {
		width: 240px;
		height: 200px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.robot {
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	/* ---------- Idle: gentle bob ---------- */
	.body {
		transform-origin: 120px 150px;
		animation: bob 3s ease-in-out infinite;
	}
	@keyframes bob {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-3px); }
	}

	/* ---------- Eyes: blink always, pulse on activity ---------- */
	.eye {
		transform-origin: center;
		animation: blink 4s infinite;
	}
	.eye-right { animation-delay: 0.15s; }
	@keyframes blink {
		0%, 92%, 100% { transform: scaleY(1); }
		95% { transform: scaleY(0.1); }
	}
	.pupil {
		transform-box: fill-box;
		transform-origin: center;
	}
	.robot-wrap.beaming .pupil {
		animation: pupil-pulse 0.8s ease-in-out infinite;
		fill: #17a821;
	}
	@keyframes pupil-pulse {
		0%, 100% { transform: scale(1); fill: #17a821; }
		50% { transform: scale(0.75); fill: #6ee87a; }
	}

	/* ---------- Antennas wiggle while working ---------- */
	.antenna {
		transform-origin: 88px 118px;
	}
	.antenna-right { transform-origin: 158px 118px; }
	.robot-wrap.beaming .antenna-left {
		animation: wiggle-l 0.9s ease-in-out infinite;
	}
	.robot-wrap.beaming .antenna-right {
		animation: wiggle-r 0.9s ease-in-out infinite;
	}
	@keyframes wiggle-l {
		0%, 100% { transform: rotate(0deg); }
		50% { transform: rotate(-6deg); }
	}
	@keyframes wiggle-r {
		0%, 100% { transform: rotate(0deg); }
		50% { transform: rotate(6deg); }
	}

	/* ---------- Code beam ---------- */
	.beam { opacity: 0; transition: opacity 0.3s; }
	.robot-wrap.beaming .beam { opacity: 1; }
	.beam-char {
		font-family: ui-monospace, Menlo, Consolas, monospace;
		font-size: 11px;
		font-weight: bold;
		fill: #1e90e8;
		opacity: 0;
		animation: beam-fly 1.6s linear infinite;
		animation-delay: calc(var(--i) * 0.3s);
	}
	@keyframes beam-fly {
		0% { transform: translateX(0); opacity: 0; }
		15% { opacity: 1; }
		85% { opacity: 1; }
		100% { transform: translateX(70px); opacity: 0; }
	}

	/* Faster beam while actually uploading */
	.robot-wrap:not(.beaming) .beam-char { animation: none; }

	/* ---------- Mouth: smile on done ---------- */
	.mouth { opacity: 0; transition: opacity 0.3s; }
	.robot-wrap.happy .mouth {
		opacity: 1;
		d: path("M 108 162 Q 120 172 132 162");
	}

	/* ---------- Sparkles on done ---------- */
	.sparkles { opacity: 0; }
	.robot-wrap.happy .sparkles { opacity: 1; }
	.sparkle {
		font-size: 14px;
		fill: #f5c518;
		animation: twinkle 1.2s ease-in-out infinite;
		animation-delay: calc(var(--i) * 0.25s);
		transform-box: fill-box;
		transform-origin: center;
	}
	@keyframes twinkle {
		0%, 100% { opacity: 0; transform: scale(0.4); }
		50% { opacity: 1; transform: scale(1.2); }
	}

	/* ---------- Error: fall apart ---------- */
	.robot-wrap.broken .body { animation: shake 0.3s ease-in-out 2; }
	@keyframes shake {
		0%, 100% { transform: translateX(0) rotate(0); }
		25% { transform: translateX(-4px) rotate(-2deg); }
		75% { transform: translateX(4px) rotate(2deg); }
	}

	.robot-wrap.broken .pupil { fill: #e53935 !important; animation: none; }
	.robot-wrap.broken .antenna-left,
	.robot-wrap.broken .antenna-right { animation: none; }

	.robot-wrap.broken .part,
	.robot-wrap.broken .eye,
	.robot-wrap.broken .antenna,
	.robot-wrap.broken .mouth {
		animation: fall-apart 1.2s ease-in forwards;
		animation-delay: 0.6s;
	}
	.robot-wrap.broken .rail { --fx: 0; --fy: -30px; --fr: 15deg; }
	.robot-wrap.broken .chassis { --fx: 8px; --fy: 10px; --fr: -10deg; }
	.robot-wrap.broken .pillar-l { --fx: -50px; --fy: -10px; --fr: -45deg; }
	.robot-wrap.broken .pillar-r { --fx: 50px; --fy: -10px; --fr: 45deg; }
	.robot-wrap.broken .leg-l { --fx: -35px; --fy: 0px; --fr: -60deg; }
	.robot-wrap.broken .leg-r { --fx: 35px; --fy: 0px; --fr: 60deg; }
	.robot-wrap.broken .eye-left { --fx: -45px; --fy: -40px; --fr: -90deg; }
	.robot-wrap.broken .eye-right { --fx: 45px; --fy: -40px; --fr: 90deg; }
	.robot-wrap.broken .antenna-left { --fx: -60px; --fy: -60px; --fr: -120deg; }
	.robot-wrap.broken .antenna-right { --fx: 60px; --fy: -60px; --fr: 120deg; }
	.robot-wrap.broken .mouth { --fx: 0; --fy: 15px; --fr: 30deg; }

	@keyframes fall-apart {
		0% {
			transform: translate(0, 0) rotate(0);
		}
		60% {
			transform: translate(
				calc(var(--fx, 0) * 1.05),
				calc(var(--fy, 60px) * 1.02)
			) rotate(calc(var(--fr, 0) * 1.05));
		}
		100% {
			transform: translate(var(--fx, 0), var(--fy, 60px)) rotate(var(--fr, 0));
		}
	}
	.robot-wrap.broken .part,
	.robot-wrap.broken .eye,
	.robot-wrap.broken .antenna,
	.robot-wrap.broken .mouth {
		transform-box: fill-box;
		transform-origin: center;
	}
</style>
