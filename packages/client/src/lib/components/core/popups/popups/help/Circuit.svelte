<script lang="ts">
import { faMagnifyingGlassPlus } from "@fortawesome/free-solid-svg-icons";
import { arduino } from "@leaphy-robotics/leaphy-blocks";
import { layoutComponents } from "@leaphy-robotics/schemas";
import { getContext } from "svelte";
import Fa from "svelte-fa";
import { _ } from "svelte-i18n";
import PopupsState, { type PopupState } from "$state/popup.svelte";
import { track } from "$state/utils";
import WorkspaceState from "$state/workspace.svelte";
import Circuit from "../Circuit.svelte";

let popupState = getContext<PopupState>("state");

const canvas = document.createElement("canvas");
let image = $state<string>();
$effect(() => {
	track(WorkspaceState.code);
	layoutComponents(canvas, arduino.builder).then(() => {
		image = canvas.toDataURL();
	});
});

function zoomIn() {
	PopupsState.open({ component: Circuit, data: {}, allowInteraction: true });
	popupState.close();
}
</script>

<div class="flex flex-col gap-2.5 flex-1">
	<div class="group relative flex-1 cursor-pointer" onclick={zoomIn}>
		<img class="w-full h-full object-contain" src={image} alt="Circuit" />
		<div class="absolute inset-0 bg-black/40 flex justify-center items-center flex-col text-center text-xl font-bold z-10 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200">
			<div class="flex flex-col items-center gap-2.5">
				<div class="text-4xl"><Fa icon={faMagnifyingGlassPlus} /></div>
				<div>Click to zoom in</div>
			</div>
		</div>
	</div>
	<div class="text-sm">{$_("CIRCUIT_DESCRIPTION")}</div>
</div>
