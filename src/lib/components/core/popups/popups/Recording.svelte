<script lang="ts">
import Button from "$components/ui/Button.svelte";
import Select from "$components/ui/Select.svelte";
import TextInput from "$components/ui/TextInput.svelte";
import type { PopupState } from "$state/popup.svelte";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import { getContext } from "svelte";
import Fa from "svelte-fa";
import { _ } from "svelte-i18n";

interface Props {
	id: string;
	name: string;
	acceptsSubmissions: boolean;
	suggestNames: boolean;
	acceptsNewParticipants: boolean;
	showSubmit: boolean;
	names: { id: string; name: string }[];
}
const config: Props = $props();

const popupState = getContext<PopupState>("state");
let name = $state(
	config.acceptsNewParticipants
		? localStorage.getItem("name") || ""
		: config.names[0]?.name,
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

{#if config.acceptsSubmissions}
	<form class="content" {onsubmit}>
		<h2>
			<span class="icon">
				<Fa icon={faCircle} />
			</span>
			{$_("RECORDING")}
		</h2>

		<p class="description">{$_("RECORDING_DESCRIPTION", { values: {
				project: config.name
			}})}</p>

		<div class="input">
			{#if config.acceptsNewParticipants}
				<TextInput
					placeholder={$_("NAME")}
					bind:value={name}
					suggestions={config.names?.map(name => name.name)}
					mode="secondary"
					required
					focus
					rounded={true}>
				</TextInput>
			{:else}
				{#if config.names.length > 0}
					<Select
						options={config.names.map(name => ([name.name, name.name]))}
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
