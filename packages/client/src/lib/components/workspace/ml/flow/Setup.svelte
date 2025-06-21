<script>
	import {faBluetooth, faUsb} from "@fortawesome/free-brands-svg-icons";
	import Button from "$components/ui/Button.svelte";
	import MLState from "$state/ml.svelte"
	import Uploader from "$components/core/popups/popups/Uploader.svelte";
	import WorkspaceState from "$state/workspace.svelte";
	import PopupState from "$state/popup.svelte";

	function upload() {
		PopupState.open({
			component: Uploader,
			data: {
				source: WorkspaceState.code,
			},
			allowInteraction: false,
		});
	}
</script>

<div class="content-area">
	<div class="header">
		<h1>Prepare your robot</h1>
		<span>Set up your sensors and upload the training program to the robot, you can then connect to the robot using Bluetooth</span>
	</div>

	<div class="sensors">
		<span>TODO: add sensors</span>
		<Button name="Add sensor" mode="primary" />
	</div>
	<div class="btn">
		<Button onclick={upload} large bold mode="primary" icon={faUsb} name="Upload" />
		<Button onclick={() => MLState.connect()} large bold mode="secondary" icon={faBluetooth} name="Connect" />
	</div>
</div>

<style>
	h1 {
		margin: 0;
	}

	.content-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 30px;
	}

	.header {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.sensors {
		display: flex;
		flex-direction: column;
		gap: 20px;
		background: var(--secondary);
		width: 100%;
		padding: 20px;
		border-radius: 15px;
	}

	.btn {
		display: flex;
		gap: 10px;
	}
</style>
