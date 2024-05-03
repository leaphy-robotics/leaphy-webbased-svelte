<script lang="ts">
import RobotSelector from "$components/start/RobotSelector.svelte";
import { robotListing } from "$domain/robots";
import { selected } from "$state/app.svelte";
import { flip } from "svelte/animate";
import { cubicOut } from "svelte/easing";
import { fly } from "svelte/transition";

const selectors = $derived(
	$selected ? [robotListing, $selected.variants] : [robotListing],
);
const animationOptions = {
	easing: cubicOut,
	duration: 300,
};
</script>

<div class="start">
    {#each selectors as robots, i (i)}
        <div
            in:fly={{ x: "100%", ...animationOptions }}
            animate:flip={animationOptions}
        >
            <RobotSelector {robots} secondary={i > 0} />
        </div>
    {/each}
</div>

<style>
    .start {
        display: flex;
        justify-content: center;
        overflow-x: hidden;
        height: var(--full-height);
    }
</style>
