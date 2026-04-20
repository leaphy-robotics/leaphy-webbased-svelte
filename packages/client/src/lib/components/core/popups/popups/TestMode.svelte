<script lang="ts">
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { getContext } from "svelte";
import Fa from "svelte-fa";
import { _ } from "svelte-i18n";
import { Circle, DoubleBounce, RingLoader } from "svelte-loading-spinners";
import Button from "$components/ui/Button.svelte";
import ListSelect from "$components/ui/ListSelect.svelte";
import type { PopupState } from "$state/popup.svelte";
import RecordingState from "$state/recordings.svelte";

interface Props {
	waitingMessage?: string;
	waitingPromise?: Promise<any>;
}
const { waitingMessage, waitingPromise }: Props = $props();
let waiting = $state(false);

$effect(() => {
	waiting = !!waitingPromise;
	waitingPromise?.then(() => {
		waiting = false;
	});
});

const popupState = getContext<PopupState>("state");
let value = $state("");

function start() {
	if (!value) return;
	popupState.close(value);
}

function checkEnabled(value: { done: boolean }) {
	return !value.done;
}
</script>

<div class="p-5 flex flex-col gap-5 min-w-[400px] text-center">
	{#if waiting}
		<div class="flex flex-col gap-2.5">
			<h1 class="m-0">{$_("PLEASE_WAIT")}</h1>
			<span class="flex justify-center gap-1.5"><Circle size="20" color="#06778f" /> {$_(waitingMessage)}</span>
		</div>
	{:else}
		<div class="flex flex-col gap-2.5">
			<h1 class="m-0">{$_("TEST_MODE_ENABLED")}</h1>
			<span class="flex justify-center gap-1.5">{$_("TEST_MODE_SELECT")}</span>
		</div>

		{#if RecordingState.autoGradingResult}
			<div class="bg-secondary text-on-secondary rounded-full px-2.5 py-2.5">
				{#if RecordingState.autoGradingResult.pass}
					<h2 class="m-0 mb-1.5">{$_("AUTOGRADING_PASSED")}</h2>
					<span class="flex justify-center gap-1.5">{$_("AUTOGRADING_PASSED_DESC")}</span>
				{:else}
					<h2 class="m-0 mb-1.5">{$_("AUTOGRADING_FAILED")}</h2>
					<span class="flex justify-center gap-1.5">{RecordingState.autoGradingResult.failReason}</span>
				{/if}
			</div>
		{/if}

		<div class="flex flex-col gap-2.5">
			{#each RecordingState.tests as test}
				<div class="flex flex-col gap-1.5">
					<div class="text-left pl-3 font-bold text-lg">{test.name}</div>
					<ListSelect disabledText="DONE" options={test.assignments.map(assignment => ([assignment.name, assignment]))} bind:value {checkEnabled}>
						{#snippet disabled()}
							<div class="text-primary-dark flex items-center gap-1">
								<Fa icon={faCircleCheck} />
								{$_("DONE_ASSIGNMENT")}
							</div>
						{/snippet}
					</ListSelect>
				</div>
			{/each}
		</div>
		<Button onclick={start} disabled={!value} bold large center mode="primary" name="Start" />
	{/if}
</div>
