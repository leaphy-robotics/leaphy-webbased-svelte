<script lang="ts">
import { _ } from "svelte-i18n";
import { SUPPORTED_VENDOR_IDS } from "$state/serial.svelte";
import WorkspaceState from "$state/workspace.svelte";
import Windowed from "../Windowed.svelte";
</script>

<Windowed title={$_("UPLOAD_OUTPUT")}>
	<div class="flex flex-col w-[450px] h-[650px] bg-bg-tint">
		<div class="flex-1 overflow-y-auto p-1.5">
			{#each WorkspaceState.uploadLog as item}
				<div class="border-b border-on-bg overflow-wrap-break-word">{item}</div>
			{/each}
		</div>
		<div>
			<div class="p-1.5 bg-primary text-on-primary">{$_("DEVICE_INFORMATION")}</div>
			<div class="p-1.5 flex flex-col gap-1 text-sm">
				<div>Platform: {navigator["userAgentData"]?.platform || $_("UNKNOWN")}</div>
				<div>Browser: {navigator["userAgentData"]?.brands[0].brand || $_("UNKNOWN")} ({navigator["userAgentData"]?.brands[0].version || $_("UNKNOWN")})</div>
				<div>Supported Vendor IDs: {SUPPORTED_VENDOR_IDS.map((e) => `0x${e.toString(16)}`).join(", ")}</div>
				<div>Web Serial Supported: {"serial" in navigator ? $_("WEB_SERIAL_SUPPORTED") : $_("WEB_SERIAL_NOT_SUPPORTED")}</div>
			</div>
		</div>
	</div>
</Windowed>
