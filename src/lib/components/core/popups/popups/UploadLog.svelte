<script lang="ts">
import {
	SUPPORTED_VENDOR_IDS,
	log,
	port,
	uploadLog,
} from "$state/workspace.svelte";
import { _ } from "svelte-i18n";
import Windowed from "../Windowed.svelte";
</script>

{#snippet content()}
    <div class="content">
        <div class="log">
            {#each $uploadLog as item}
                <div class="item">{item}</div>
            {/each}
        </div>
        <div class="device">
            <div class="header">{$_("DEVICE_INFORMATION")}</div>
            <div class="device-info">
                <div class="info">
                    Platform: {navigator["userAgentData"]?.platform ||
                        $_("UNKNOWN")}
                </div>
                <div class="info">
                    Browser: {navigator["userAgentData"]?.brands[0].brand ||
                        $_("UNKNOWN")}
                    ({navigator["userAgentData"]?.brands[0].version ||
                        $_("UNKNOWN")})
                </div>
                <div class="info">
                    Supported Vendor IDs: {SUPPORTED_VENDOR_IDS.map(
                        (e) => `0x${e.toString(16)}`,
                    ).join(", ")}
                </div>
                <div class="info">
                    Web Serial Supported: {"serial" in navigator
                        ? $_("WEB_SERIAL_SUPPORTED")
                        : $_("WEB_SERIAL_NOT_SUPPORTED")}
                </div>
            </div>
        </div>
    </div>
{/snippet}

<Windowed title={$_("UPLOAD_OUTPUT")} {content} />

<style>
    .content {
        display: flex;
        flex-direction: column;
        width: 450px;
        height: 650px;
        background: var(--background-tint);
    }

    .log {
        flex: 1;
        overflow-y: auto;
        padding: 5px;
    }
    .item {
        border-bottom: 1px solid var(--on-background);
        overflow-wrap: break-word;
    }

    .header {
        padding: 5px;
        background: var(--primary);
        color: var(--on-primary);
    }
    .device-info {
        padding: 5px;
    }
</style>
