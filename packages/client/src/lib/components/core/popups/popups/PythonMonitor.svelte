<script lang="ts">
import { _ } from "svelte-i18n";
import Terminal from "$components/workspace/python/Terminal.svelte";
import Windowed from "../Windowed.svelte";
</script>

<Windowed title={$_("SERIAL_OUTPUT")}>
	<Terminal/>
</Windowed>
