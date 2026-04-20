<script lang="ts">
import {
	faBook,
	faBug,
	faList,
	faMessage,
	faProjectDiagram,
	faRobot,
} from "@fortawesome/free-solid-svg-icons";
import { getContext } from "svelte";
import { _ } from "svelte-i18n";
import Popup from "$components/core/popups/Popup.svelte";
import Debugger from "$components/core/popups/popups/debugger/Debugger.svelte";
import Button from "$components/ui/Button.svelte";
import PopupsState, { type PopupState } from "$state/popup.svelte";
import Windowed from "../../Windowed.svelte";
import Solver from "../solver/Solver.svelte";
import Tutorials from "../tutorials/Tutorials.svelte";
import Circuit from "./Circuit.svelte";
import Container from "./Container.svelte";
import Videos from "./Videos.svelte";

let popupState = getContext<PopupState>("state");

function openSolver() {
	PopupsState.open({ component: Solver, data: {}, allowInteraction: true });
	popupState.close();
}

function openTutorials() {
	PopupsState.open({
		component: Tutorials,
		data: {},
		allowInteraction: true,
		allowOverflow: true,
		position: {
			x: window.innerWidth / 2 - 320,
			y: window.innerHeight / 2 - 210,
		},
	});
	popupState.close();
}

function openDebugger() {
	PopupsState.open({ component: Debugger, data: {}, allowInteraction: true });
	popupState.close();
}
</script>

<Windowed title={$_("HELP_TOOLS")}>
	<div class="grid grid-cols-[1fr_400px] gap-2.5 p-2.5 bg-bg-tint w-[80vw] max-w-[1000px]">
		<Container title={$_("CIRCUIT")} icon={faProjectDiagram}>
			<Circuit />
		</Container>
		<div class="grid grid-rows-[auto_1fr] gap-2.5">
			<Container title={$_("SOLVER")} icon={faRobot}>
				<div class="text-sm">{$_("SOLVER_DESCRIPTION")}</div>
				<Button icon={faMessage} mode="primary" name={$_("ASK")} onclick={openSolver} />
			</Container>
			<Container title={$_("DEBUGGER")} icon={faBug}>
				<div class="text-sm">{$_("DEBUGGER_DESCRIPTION")}</div>
				<Button icon={faRobot} mode="primary" name={$_("DEBUG")} onclick={openDebugger} />
			</Container>
			<Container title={$_("TUTORIALS")} icon={faBook}>
				<div class="text-sm">{$_("TUTORIALS_DESCRIPTION")}</div>
				<Videos />
				<Button icon={faList} mode="primary" name={$_("SEE_ALL")} onclick={openTutorials} />
			</Container>
		</div>
	</div>
</Windowed>
