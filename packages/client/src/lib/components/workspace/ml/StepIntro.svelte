<script lang="ts">
interface Props {
	title: string;
	description: string;
}
const { title, description }: Props = $props();
</script>

<div class="flex flex-col gap-1 text-left">
	<h1 class="m-0 text-xl!">{title}</h1>
	<p class="m-0 text-on-secondary-muted">{description}</p>
</div>
