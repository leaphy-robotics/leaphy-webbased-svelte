<script lang="ts">
import Button from "$components/ui/Button.svelte";
import Select from "$components/ui/Select.svelte";
import TextInput from "$components/ui/TextInput.svelte";
import type { PopupState } from "$state/popup.svelte";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import { getContext } from "svelte";
import Fa from "svelte-fa";
import { _ } from "svelte-i18n";
import RecordingState from "$state/recordings.svelte"

const popupState = getContext<PopupState>("state");
let name = $state(
	RecordingState.project.acceptsNewParticipants
		? localStorage.getItem("name") || ""
		: RecordingState.project.names[0]?.name,
);

async function done() {
	localStorage.setItem("name", name);
	popupState.close(name);
}

function onsubmit(event: SubmitEvent) {
	event.preventDefault();
	done();
}
</script>

{#if RecordingState.project.acceptsSubmissions}
	<form class="content" {onsubmit}>
		<h2>
			<span class="icon">
				<Fa icon={faCircle} />
			</span>
			{$_("RECORDING")}
		</h2>

		<p class="description">{$_("RECORDING_DESCRIPTION", { values: {
				project: RecordingState.project.name
			}})}</p>

		<div class="input">
			{#if RecordingState.project.acceptsNewParticipants}
				<TextInput
					placeholder={$_("NAME")}
					bind:value={name}
					suggestions={RecordingState.project.names?.map(name => name.name)}
					mode="secondary"
					required
					focus
					rounded={true}>
				</TextInput>
			{:else}
				{#if RecordingState.project.names.length > 0}
					<Select
						options={RecordingState.project.names.map(name => ([name.name, name.name]))}
						bind:value={name}
						mode="secondary" full
					/>
				{:else}
					<p>{$_("NO_PARTICIPANTS")}</p>
				{/if}

			{/if}
		</div>

		<div class="actions">
			<Button type="submit" mode={"primary"} name={$_("CONTINUE")}/>
		</div>
	</form>
{:else}
	<form action={import.meta.env.VITE_BACKEND_URL} class="content">
		<h2>{$_("PROJECT_SUBMISSIONS_CLOSED")}</h2>
		<p class="description">{$_("SUBMISSIONS_CLOSED_DESCRIPTION")}</p>
		<div class="actions">
			<Button type="submit" mode="primary" name={$_("CONTINUE")} />
		</div>
	</form>
{/if}

<style>
	.input {
		padding-bottom: 10px;
	}

	.content {
		padding: 20px;
		display: flex;
		flex-direction: column;
		min-width: 400px;
		text-align: center;
	}

	.actions {
		display: flex;
		justify-content: center;
		margin-top: 20px;
	}

	.icon {
		color: red;
	}

	.description {
		white-space: pre-line;
	}
</style>
