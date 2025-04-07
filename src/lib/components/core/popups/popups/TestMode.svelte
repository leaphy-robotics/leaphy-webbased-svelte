<script lang="ts">
	import RecordingState from '$state/recordings.svelte';
	import ListSelect from "$components/ui/ListSelect.svelte";
	import Button from "$components/ui/Button.svelte";
	import {getContext} from "svelte";
	import type {PopupState} from "$state/popup.svelte";
	import Fa from "svelte-fa";
	import {faCircleCheck} from "@fortawesome/free-solid-svg-icons";
	import { Circle, DoubleBounce, RingLoader } from 'svelte-loading-spinners';
	import { _ } from 'svelte-i18n'

	interface Props {
		waitingMessage?: string
		waitingPromise?: Promise<any>
	}
	const { waitingMessage, waitingPromise }: Props = $props()
	let waiting = $state(false)

	$effect(() => {
		waiting = !!waitingPromise
		waitingPromise?.then(() => {
			waiting = false;
		})
	})

	const popupState = getContext<PopupState>("state");
	let value = $state('');

	function start() {
		if (!value) return
		popupState.close(value)
	}

	function checkEnabled(value: { done: boolean }) {
		return !value.done
	}
</script>

<div class="content">
	{#if waiting}
		<div class="header">
			<h1>{$_("PLEASE_WAIT")}</h1>
			<span><Circle size="20" color="#06778f" /> {$_(waitingMessage)}</span>
		</div>
	{:else}
		<div class="header">
			<h1>{$_("TEST_MODE_ENABLED")}</h1>
			<span>{$_("TEST_MODE_SELECT")}</span>
		</div>

		{#if RecordingState.autoGradingResult}
			<div class="result">
				{#if RecordingState.autoGradingResult.pass}
					<h2>{$_("AUTOGRADING_PASSED")}</h2>
					<span>{$_("AUTOGRADING_PASSED_DESC")}</span>
				{:else}
					<h2>{$_("AUTOGRADING_FAILED")}</h2>
					<span>{RecordingState.autoGradingResult.failReason}</span>
				{/if}
			</div>
		{/if}

		<div class="tests">
			{#each RecordingState.tests as test}
				<div class="test">
					<div class="name">{test.name}</div>
					<ListSelect disabledText="DONE" options={test.assignments.map(assignment => ([assignment.name, assignment]))} bind:value {checkEnabled}>
						{#snippet disabled()}
							<div class="done">
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

<style>
	.content {
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 20px;
		min-width: 400px;
		text-align: center;
	}

	h1 {
		margin: 0;
	}

	.tests, .header {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.name {
		text-align: left;
		padding-left: 12px;
		font-weight: bold;
		font-size: 18px;
	}

	.test {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.done {
		color: var(--primary-dark-tint);
	}

	span {
		display: flex;
		justify-content: center;
		gap: 5px;
	}

	.result {
		background: var(--secondary);
		color: var(--on-secondary);
		border-radius: 20px;
		padding: 10px;
	}

	h2 {
		margin: 0 0 5px;
	}
</style>
