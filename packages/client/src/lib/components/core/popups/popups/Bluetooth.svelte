<script lang="ts">
import { getContext } from "svelte";
import { _ } from "svelte-i18n";
import Button from "$components/ui/Button.svelte";
import KeyboardAnimation from "$components/ui/KeyboardAnimation.svelte";
import BluetoothState from "$state/bluetooth.svelte";
import type { PopupState } from "$state/popup.svelte";

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

<div class="flex flex-col items-center w-[800px] p-5 gap-5 text-center">
	<h2 class="m-0 mb-0">{$_("BLUETOOTH_CONTROL")}</h2>
	<div>{$_("BLUETOOTH_CONTROL_DESCRIPTION")}</div>
	<KeyboardAnimation pressedKeys={pressed} />
	<Button name={$_("CLOSE")} mode={"accent"} onclick={close} bold={true} />
</div>
