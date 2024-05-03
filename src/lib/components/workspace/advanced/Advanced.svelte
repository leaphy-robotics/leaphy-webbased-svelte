<script lang="ts">
import SerialMonitor from "$components/core/popups/popups/SerialMonitor.svelte";
import CodeEditor from "$components/ui/CodeEditor.svelte";
import SideBar from "$components/ui/SideBar.svelte";
import SideButton from "$components/ui/SideButton.svelte";
import { popups } from "$state/popup.svelte";
import { code, sidePanel } from "$state/workspace.svelte";
import {
	faBook,
	faCode,
	faSquarePollHorizontal,
} from "@fortawesome/free-solid-svg-icons";
import Code from "../panels/Code.svelte";
import LibraryManager from "../panels/LibraryManager.svelte";
</script>

<div class="environment">
    <CodeEditor bind:value={$code} language="cpp" />
</div>

<style>
    .environment {
        height: var(--full-height);
        position: relative;
    }
</style>
