<script lang="ts">
interface Props {
	progress: number;
}
const { progress }: Props = $props();
</script>

<div class="bar">
    <div class="progress" style:width={`${progress}%`}></div>
</div>

<style>
    .bar {
        position: relative;
        background: var(--secondary);
        width: 100%;
        height: 15px;
    }

    .progress {
        content: "";
        position: absolute;
        background: var(--primary);
        top: 0;
        left: 0;
        width: var(--progress);
        height: 100%;
    }
</style>
