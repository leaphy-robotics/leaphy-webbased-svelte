<script lang="ts">
interface Props {
	progress: number;
}
const { progress }: Props = $props();
</script>

<div class="relative bg-secondary w-full h-3.5 rounded-full overflow-hidden">
	<div
		class="absolute bg-primary top-0 left-0 h-full transition-all duration-300 rounded-full"
		style:width={`${progress}%`}
	></div>
</div>
