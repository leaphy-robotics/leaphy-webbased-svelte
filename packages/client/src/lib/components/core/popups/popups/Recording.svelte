<script lang="ts">
import Button from "$components/ui/Button.svelte";
import Select from "$components/ui/Select.svelte";
import TextInput from "$components/ui/TextInput.svelte";
import type { PopupState } from "$state/popup.svelte";
import RecordingState from "$state/recordings.svelte";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import { getContext } from "svelte";
import Fa from "svelte-fa";
import { _ } from "svelte-i18n";

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
	<form class="p-5 flex flex-col min-w-[400px] text-center gap-4" {onsubmit}>
		<h2 class="m-0">
			<span class="text-red-500"><Fa icon={faCircle} /></span>
			{$_("RECORDING")}
		</h2>
		<p class="m-0 whitespace-pre-line">{$_("RECORDING_DESCRIPTION", { values: { project: RecordingState.project.name }})}</p>
		<div class="pb-2.5">
			{#if RecordingState.project.acceptsNewParticipants}
				<TextInput
					placeholder={$_("NAME")}
					bind:value={name}
					suggestions={RecordingState.project.names?.map(name => name.name)}
					mode="secondary"
					required
					focus
					rounded={true}
				/>
			{:else}
				{#if RecordingState.project.names.length > 0}
					<Select options={RecordingState.project.names.map(name => ([name.name, name.name]))} bind:value={name} mode="secondary" full />
				{:else}
					<p>{$_("NO_PARTICIPANTS")}</p>
				{/if}
			{/if}
		</div>
		<div class="flex justify-center mt-2">
			<Button type="submit" mode={"primary"} name={$_("CONTINUE")}/>
		</div>
	</form>
{:else}
	<form action={import.meta.env.VITE_BACKEND_URL} class="p-5 flex flex-col min-w-[400px] text-center gap-4">
		<h2 class="m-0">{$_("PROJECT_SUBMISSIONS_CLOSED")}</h2>
		<p class="m-0 whitespace-pre-line">{$_("SUBMISSIONS_CLOSED_DESCRIPTION")}</p>
		<div class="flex justify-center mt-2">
			<Button type="submit" mode="primary" name={$_("CONTINUE")} />
		</div>
	</form>
{/if}
