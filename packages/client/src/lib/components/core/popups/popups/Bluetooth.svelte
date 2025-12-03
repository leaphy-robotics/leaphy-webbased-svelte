<script lang="ts">
import Button from "$components/ui/Button.svelte";
import KeyboardAnimation from "$components/ui/KeyboardAnimation.svelte";
import BluetoothState from "$state/bluetooth.svelte";
import type { PopupState } from "$state/popup.svelte";
import { getContext } from "svelte";
import { _ } from "svelte-i18n";

let pressed = $state(new Set<string>());

function onKeyDown(ev: KeyboardEvent) {
	if (pressed.has(ev.code)) return;
	pressed = new Set([...pressed, ev.code]);

	ev.stopImmediatePropagation();
	BluetoothState.press(ev.code);
}

function onKeyUp(ev: KeyboardEvent) {
	if (!pressed.has(ev.code)) return;
	pressed = new Set([...pressed].filter((code) => code !== ev.code));

	ev.stopImmediatePropagation();
	BluetoothState.release(ev.code);
}

const popupState = getContext<PopupState>("state");
function close() {
	popupState.close();
}
</script>

<svelte:body on:keyup={onKeyUp} on:keydown={onKeyDown} />

<div class="content">
	<h2>{$_("BLUETOOTH_CONTROL")}</h2>
	<div class="text">{$_("BLUETOOTH_CONTROL_DESCRIPTION")}</div>
	<KeyboardAnimation pressedKeys={pressed} />
	<Button name={$_("CLOSE")} mode={"accent"} onclick={close} bold={true} />
</div>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 800px;
		padding: 20px;
		gap: 20px;
		text-align: center;
	}

	h2 {
		margin-bottom: 0;
	}
</style>
