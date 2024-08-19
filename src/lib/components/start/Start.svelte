<script lang="ts">
import Connect from "$components/core/popups/popups/Connect.svelte";
import RobotSelector from "$components/start/RobotSelector.svelte";
import {
	type RobotListing,
	getSelector,
	robotListing,
	robots,
} from "$domain/robots";
import { Screen, screen } from "$state/app.svelte";
import { restore } from "$state/blockly.svelte";
import { popups } from "$state/popup.svelte";
import {
	Mode,
	Prompt,
	code,
	mode,
	port,
	robot,
	saveState,
} from "$state/workspace.svelte";

async function connect() {
	try {
		await port.connect(Prompt.NEVER);
	} catch {}
}

function onselect(type: RobotListing) {
	robot.set(
		robots[localStorage.getItem(`${type.saveAddress}_robot`)] ||
			type.defaultRobot,
	);
	mode.set(type.mode || Mode.BLOCKS);
	screen.set(Screen.WORKSPACE);

	if ($mode !== Mode.BLOCKS)
		code.set(
			localStorage.getItem(`${type.saveAddress}_content`) ||
				type.defaultProgram,
		);
	else
		restore.set(
			JSON.parse(localStorage.getItem(`${type.saveAddress}_content`)),
		);

	saveState.set(true);

	if (type.mode === Mode.PYTHON) return;
	if (getSelector(type.defaultRobot)) {
		popups.open({
			component: Connect,
			data: {
				connectOverride: !localStorage.getItem(`${type.saveAddress}_robot`),
			},
			allowInteraction: false,
		});
	}
	connect();
}
</script>

<div class="start">
	<RobotSelector {onselect} robots="{robotListing}" />
</div>

<style>
    .start {
        display: flex;
        justify-content: center;
        overflow-x: hidden;
        height: var(--full-height);
    }
</style>
