<script lang="ts">
import { onMount } from "svelte";

interface Props {
	question: string;
	answer: string;
}

let { question, answer }: Props = $props();

let questionElement: HTMLDivElement;
let answerElement: HTMLDivElement;
let containerElement: HTMLDivElement;

let topOffset = $state(0);
let bottomOffset = $state(0);
let containerHeight = $state(0);

let pathData = $derived.by(() => {
	if (containerHeight === 0 || topOffset === 0 || bottomOffset === 0) return "";

	const cornerRadius = 6;
	const lineWidth = 3;
	const connectorWidth = 30;

	// Start at right edge, at question center
	const startX = connectorWidth;
	const startY = topOffset;

	// Go left to where we'll turn down
	const leftTurnX = lineWidth + cornerRadius;
	const leftTurnY = topOffset;

	// Turn down (rounded corner)
	const verticalStartY = topOffset + cornerRadius;

	// Vertical line down
	const verticalEndY = bottomOffset - cornerRadius;

	// Turn right (rounded corner)
	const rightTurnX = leftTurnX;
	const rightTurnY = bottomOffset;

	// Go right to answer
	const endX = connectorWidth;
	const endY = bottomOffset;

	return `M ${startX} ${startY} 
            L ${leftTurnX} ${leftTurnY} 
            Q ${lineWidth} ${topOffset} ${lineWidth} ${verticalStartY}
            L ${lineWidth} ${verticalEndY}
            Q ${lineWidth} ${bottomOffset} ${rightTurnX} ${rightTurnY}
            L ${endX} ${endY}`;
});

onMount(() => {
	const updatePositions = () => {
		if (questionElement && answerElement && containerElement) {
			const questionRect = questionElement.getBoundingClientRect();
			const answerRect = answerElement.getBoundingClientRect();
			const containerRect = containerElement.getBoundingClientRect();

			// Calculate offsets relative to container (center of each element)
			topOffset =
				questionRect.top - containerRect.top + questionRect.height / 2;
			bottomOffset = answerRect.top - containerRect.top + answerRect.height / 2;
			containerHeight = containerRect.height;
		}
	};

	// Initial update
	setTimeout(updatePositions, 0);

	// Use ResizeObserver to handle dynamic content changes
	const resizeObserver = new ResizeObserver(() => {
		setTimeout(updatePositions, 0);
	});

	if (questionElement) resizeObserver.observe(questionElement);
	if (answerElement) resizeObserver.observe(answerElement);
	if (containerElement) resizeObserver.observe(containerElement);

	return () => {
		resizeObserver.disconnect();
	};
});
</script>

<div class="result-container" bind:this={containerElement}>
    <div class="connector">
        {#if pathData}
            <svg class="connector-svg" viewBox="0 0 30 {containerHeight}" preserveAspectRatio="none">
                <path
                    d={pathData}
                    stroke="var(--primary)"
                    stroke-width="3"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>
        {/if}
    </div>
    <div class="content">
        <div class="question" bind:this={questionElement}>{question}</div>
        <div class="answer" bind:this={answerElement}>{answer}</div>
    </div>
</div>

<style>
    .result-container {
        position: relative;
        padding-left: 40px;
        margin: 20px 0;
    }

    .content {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .question {
        font-weight: 500;
        font-weight: bold;
        color: var(--on-background);
    }

    .answer {
        color: var(--on-background);
        opacity: 0.8;
    }

    .connector {
        position: absolute;
        left: 0;
        top: 0;
        width: 30px;
        height: 100%;
        pointer-events: none;
    }

    .connector-svg {
        width: 100%;
        height: 100%;
    }
</style>
