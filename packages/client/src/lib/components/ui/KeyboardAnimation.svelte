<script lang="ts">
interface Props {
	pressedKeys: Set<string>;
}

const { pressedKeys }: Props = $props();

// Map of key codes to display labels
const keyLabels: Record<string, string> = {
	Space: "Space",
	ArrowUp: "↑",
	ArrowDown: "↓",
	ArrowLeft: "←",
	ArrowRight: "→",
};

// Relevant keys for Bluetooth control: letters (a-z), numbers (0-9), space, and arrows
const relevantKeys = new Set([
	...Array.from({ length: 26 }, (_, i) => `Key${String.fromCharCode(65 + i)}`), // KeyA-KeyZ
	...Array.from({ length: 10 }, (_, i) => `Digit${i}`), // Digit0-Digit9
	"Space",
	"ArrowUp",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight",
]);

// Main keyboard layout with only relevant keys shown, null for blank placeholders
const displayKeys = [
	[null, "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0", null, null, null],
	[null, "KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", null, null, null],
	[null, "KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", null, null, null],
	[null, "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", null, null, null, null],
	[null, null, null, "Space", "ArrowLeft", ["ArrowUp", "ArrowDown"], "ArrowRight"],
];

function isPressed(code: string | null): boolean {
	return code !== null && pressedKeys.has(code);
}

function getKeyLabel(code: string | null): string {
	if (code === null) return "";
	if (keyLabels[code]) {
		return keyLabels[code];
	}
	// Extract letter from KeyX format
	if (code.startsWith("Key")) {
		return code.slice(3);
	}
	// Extract digit from DigitX format
	if (code.startsWith("Digit")) {
		return code.slice(5);
	}
	return code;
}

function getKeyWidth(code: string | null): string {
	if (code === null) return "40px";
	if (code === "Space") {
		return "300px";
	}
	return "40px";
}
</script>

{#snippet key(keyCode: string)}
<div
    class="key"
    class:pressed={isPressed(keyCode)}
    class:space={keyCode === "Space"}
    style="width: {getKeyWidth(keyCode)}"
>
    {getKeyLabel(keyCode)}
</div>
{/snippet}

<div class="keyboard">
	<div class="main-keys">
		{#each displayKeys as row}
			<div class="row">
				{#each row as keyCode}
					{#if keyCode === null}
						<div class="key blank" style="width: {getKeyWidth(null)}"></div>
					{:else if Array.isArray(keyCode)}
                        <div class="key-group">
                            {#each keyCode as code}
                                {@render key(code)}
                            {/each}
                        </div>
					{:else}
						{@render key(keyCode)}
					{/if}
				{/each}
			</div>
		{/each}
	</div>
</div>

<style>
	.keyboard {
		display: flex;
		flex-direction: row;
		gap: 20px;
		align-items: flex-start;
		padding: 20px;
		background: var(--background-tint);
		border-radius: 12px;
		border: 1px solid var(--text-muted);
		max-width: fit-content;
		margin: 0 auto;
	}

	.main-keys {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.arrow-keys {
		display: flex;
		flex-direction: column;
		gap: 8px;
		align-items: center;
	}

	.row {
		display: flex;
		gap: 6px;
		justify-content: center;
		align-items: center;
	}

	.key {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 40px;
		padding: 0 12px;
		background: var(--background);
		border: 2px solid var(--text-muted);
		border-bottom: 4px solid rgba(0, 0, 0, 0.3);
		border-radius: 6px;
		font-size: 12px;
		font-weight: 600;
		color: var(--on-background);
		transition: all 0.1s ease;
		user-select: none;
		cursor: default;
		box-shadow: 
			0 2px 0 rgba(0, 0, 0, 0.2),
			0 4px 4px rgba(0, 0, 0, 0.1);
	}

	.key::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		border-radius: 4px;
		background: linear-gradient(to bottom, rgba(255, 255, 255, 0.1), transparent);
		pointer-events: none;
	}

	.key.pressed {
		background: var(--accent);
		color: var(--on-accent);
		border-color: var(--accent);
		border-bottom: 2px solid rgba(0, 0, 0, 0.4);
		transform: translateY(2px);
		box-shadow: 
			0 1px 0 rgba(0, 0, 0, 0.2),
			0 2px 2px rgba(0, 0, 0, 0.1);
	}

	.key.pressed::before {
		background: linear-gradient(to bottom, rgba(255, 255, 255, 0.15), transparent);
	}

	.key.space {
		min-width: 300px;
	}

	.key.blank {
		background: var(--background);
		border-color: var(--text-muted);
		cursor: default;
	}

    .key-group {
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 40px;
    }

    .key-group .key {
        height: unset;
        flex: 1;
        font-size: 10px;
    }
</style>
