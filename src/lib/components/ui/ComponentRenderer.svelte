<script lang="ts">
	import type { Component } from 'svelte';

	interface Props {
		component: Component;
	}
	const { component: Component }: Props = $props();
</script>

<Component />
