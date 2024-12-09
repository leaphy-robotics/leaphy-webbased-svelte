<script lang="ts">
import type { Component as ComponentType } from "svelte";

interface Props {
	component: ComponentType;
}
const { component: Component }: Props = $props();
</script>

<Component />
