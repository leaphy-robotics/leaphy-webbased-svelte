<script lang="ts">
import { faUsb } from "@fortawesome/free-brands-svg-icons";
import {
	faCircleStop,
	faEarListen,
	faGear,
	faMicrophone,
	faPlay,
	faPlus,
	faRotateRight,
	faTrash,
	faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { onDestroy, onMount, tick } from "svelte";
import Fa from "svelte-fa";
import { _ } from "svelte-i18n";
import Windowed from "$components/core/popups/Windowed.svelte";
import Button from "$components/ui/Button.svelte";
import Disclosure from "$components/ui/Disclosure.svelte";
import Field from "$components/ui/Field.svelte";
import LineChart from "$components/ui/LineChart.svelte";
import Locked from "$components/ui/Locked.svelte";
import ProgressBar from "$components/ui/ProgressBar.svelte";
import StatusBanner from "$components/ui/StatusBanner.svelte";
import StepNumber from "$components/ui/StepNumber.svelte";
import Switch from "$components/ui/Switch.svelte";
import TextInput from "$components/ui/TextInput.svelte";
import TipCard from "$components/ui/TipCard.svelte";
import SerialState, { Prompt } from "$state/serial.svelte";
import TeachableMachineState, {
	type TeachableClass,
} from "$state/teachableMachine.svelte";
import RecordingProgress from "./RecordingProgress.svelte";
import Spectrogram from "./Spectrogram.svelte";

let workflow = $state<HTMLDivElement>();
let recordPaths = $state<{ id: string; d: string }[]>([]);
let trainPath = $state("");
let advanced = $state(false);
let batchSettingsClassId = $state<string | null>(null);
let batchCounts = $state<Record<string, number>>(
	Object.fromEntries(
		TeachableMachineState.classes.map((item) => [
			item.id,
			suggestedBatch(item),
		]),
	),
);

const lastLoss = $derived(
	TeachableMachineState.lossHistory[
		TeachableMachineState.lossHistory.length - 1
	],
);

const recorded = $derived(
	TeachableMachineState.classes.every(
		(item) => item.samples.length >= TeachableMachineState.minimumSamples(item),
	),
);

const deviceMessages = {
	connecting: [
		"TEACHABLE_MACHINE_STATUS_PROBING",
		"TEACHABLE_MACHINE_STATUS_PROBING_DESC",
	],
	probing: [
		"TEACHABLE_MACHINE_STATUS_PROBING",
		"TEACHABLE_MACHINE_STATUS_PROBING_DESC",
	],
	flashing: [
		"TEACHABLE_MACHINE_STATUS_FLASHING",
		"TEACHABLE_MACHINE_STATUS_FLASHING_DESC",
	],
	reconnecting: [
		"TEACHABLE_MACHINE_STATUS_RECONNECTING",
		"TEACHABLE_MACHINE_STATUS_RECONNECTING_DESC",
	],
};

function suggestedBatch(item: TeachableClass): number {
	return Math.max(
		1,
		Math.min(
			12,
			TeachableMachineState.minimumSamples(item) - item.samples.length,
		),
	);
}

function record(item: TeachableClass): void {
	void TeachableMachineState.record(
		item.id,
		Math.max(1, Math.min(12, Number(batchCounts[item.id]) || 1)),
	);
}

function addClass(): void {
	TeachableMachineState.addClass();
	const item = TeachableMachineState.classes.find(
		(candidate) => !(candidate.id in batchCounts),
	);
	if (item) batchCounts[item.id] = suggestedBatch(item);
}

function toggleBatchSettings(classId: string): void {
	batchSettingsClassId = batchSettingsClassId === classId ? null : classId;
}

async function connect(): Promise<void> {
	if (!SerialState.port) {
		try {
			await SerialState.connect(Prompt.MAYBE);
		} catch {
			// The user closed the port chooser, the connect banner stays visible so they can try again
			return;
		}
	}
	await TeachableMachineState.connectDevice();
}

function updateConnections(): void {
	if (!workflow) return;
	const root = workflow.getBoundingClientRect();
	const train = workflow.querySelector<HTMLElement>("[data-stage='train']");
	const test = workflow.querySelector<HTMLElement>("[data-stage='test']");
	if (!train || !test) return;
	const trainRect = train.getBoundingClientRect();
	const testRect = test.getBoundingClientRect();
	const trainX = trainRect.left - root.left;
	const trainY = trainRect.top - root.top + trainRect.height / 2;

	recordPaths = TeachableMachineState.classes.flatMap((item) => {
		const element = workflow.querySelector<HTMLElement>(
			`[data-class-id="${CSS.escape(item.id)}"]`,
		);
		if (!element) return [];
		const rect = element.getBoundingClientRect();
		const startX = rect.right - root.left;
		const startY = rect.top - root.top + rect.height / 2;
		const distance = Math.max(40, trainX - startX);
		return [
			{
				id: item.id,
				d: `M ${startX} ${startY} C ${startX + distance * 0.55} ${startY}, ${trainX - distance * 0.55} ${trainY}, ${trainX} ${trainY}`,
			},
		];
	});

	const startX = trainRect.right - root.left;
	const endX = testRect.left - root.left;
	const endY = testRect.top - root.top + testRect.height / 2;
	const distance = Math.max(40, endX - startX);
	trainPath = `M ${startX} ${trainY} C ${startX + distance * 0.55} ${trainY}, ${endX - distance * 0.55} ${endY}, ${endX} ${endY}`;
}

onMount(() => {
	TeachableMachineState.localizeDefaultClasses();
	for (const item of TeachableMachineState.classes) {
		batchCounts[item.id] ??= suggestedBatch(item);
	}
	if (SerialState.port) void TeachableMachineState.connectDevice();
});

$effect(() => {
	const element = workflow;
	if (!element) return;

	const observer = new ResizeObserver(updateConnections);
	const scroller = element.querySelector("[data-class-list]");
	observer.observe(element);
	scroller?.addEventListener("scroll", updateConnections);
	void tick().then(updateConnections);

	return () => {
		observer.disconnect();
		scroller?.removeEventListener("scroll", updateConnections);
	};
});

$effect(() => {
	const layout = TeachableMachineState.classes
		.map((item) => `${item.id}:${item.samples.length}`)
		.join("|");
	for (const item of TeachableMachineState.classes) {
		batchCounts[item.id] ??= suggestedBatch(item);
	}
	advanced;
	void layout;
	void tick().then(updateConnections);
});

onDestroy(() => {
	void TeachableMachineState.disposeDevice();
});
</script>

<Windowed
	title={$_("TEACHABLE_MACHINE_TITLE")}
	onclose={() => TeachableMachineState.disposeDevice()}
>
	<div class="relative flex h-[min(820px,90vh)] w-[min(1480px,96vw)] flex-col overflow-auto rounded-b-xl bg-bg-tint text-on-bg">
		<div class="flex flex-col gap-2 px-8 pt-5">
			{#if TeachableMachineState.loadError}
				<StatusBanner compact kind="warning" title={$_("TEACHABLE_MACHINE_LOAD_FAILED")} />
			{/if}
			{#if TeachableMachineState.deviceError}
				<StatusBanner kind="error" title={TeachableMachineState.deviceError}>
					{#snippet actions()}
						{#if !TeachableMachineState.connected}
							<Button mode="secondary" icon={faRotateRight} name={$_("TRY_AGAIN")} disabled={TeachableMachineState.deviceBusy} onclick={connect} />
						{:else}
							<Button mode="secondary" icon={faXmark} name={$_("CLOSE")} onclick={() => TeachableMachineState.deviceError = null} />
						{/if}
					{/snippet}
				</StatusBanner>
			{/if}
			{#if TeachableMachineState.deviceBusy}
				{@const [title, message] = deviceMessages[TeachableMachineState.deviceStatus]}
				<StatusBanner kind="loading" title={$_(title)} message={$_(message)} />
			{:else if !TeachableMachineState.connected}
				{#if !TeachableMachineState.deviceError}
					<StatusBanner kind="info" title={$_("TEACHABLE_MACHINE_CONNECT_TITLE")} message={$_("TEACHABLE_MACHINE_NOT_CONNECTED_DESC")}>
						{#snippet actions()}
							<Button mode="accent" bold icon={faUsb} name={$_("CHOOSE_ROBOT")} onclick={connect} />
						{/snippet}
					</StatusBanner>
				{/if}
			{:else}
				<StatusBanner
					kind={TeachableMachineState.recordingClassId || TeachableMachineState.training ? "loading" : "info"}
					title={$_("TEACHABLE_MACHINE_NEXT_STEP")}
					message={$_(TeachableMachineState.nextStep.key, { values: TeachableMachineState.nextStep.values })}
				/>
			{/if}
		</div>

		<div
			class="relative isolate grid min-h-0 flex-1 grid-cols-[minmax(320px,1.15fr)_minmax(300px,.9fr)_minmax(280px,.8fr)] grid-rows-[minmax(0,1fr)] items-center gap-[clamp(40px,5vw,100px)] overflow-hidden px-8 py-5 max-[1050px]:min-w-[1000px]"
			bind:this={workflow}
		>
			<svg class="pointer-events-none absolute inset-0 -z-10 size-full overflow-visible" aria-hidden="true">
				{#each recordPaths as path (path.id)}
					<path class="fill-none stroke-accent stroke-[3] opacity-60" stroke-linecap="round" d={path.d}></path>
				{/each}
				{#if trainPath}
					<path class="fill-none stroke-accent stroke-[3] opacity-60" stroke-linecap="round" d={trainPath}></path>
				{/if}
			</svg>

			<section class="relative z-10 flex max-h-full min-h-0 min-w-0 flex-col items-stretch gap-4 overflow-hidden rounded-2xl border border-secondary bg-bg p-4">
				<div class="flex items-center gap-3">
					<StepNumber number={1} state={recorded ? "done" : "active"} />
					<div><h2 class="m-0 text-xl!">{$_("TEACHABLE_MACHINE_RECORD_TITLE")}</h2><p class="mt-0.5 text-xs text-on-secondary-muted">{$_("TEACHABLE_MACHINE_RECORD_DESC")}</p></div>
				</div>

				<TipCard title={$_("TEACHABLE_MACHINE_TIP_RECORD_TITLE")} text={$_("TEACHABLE_MACHINE_TIP_RECORD_TEXT")} />

				<div class="flex min-h-0 flex-1 flex-col gap-3 overflow-auto p-0.5 pr-2" data-class-list>
					{#each TeachableMachineState.classes as item (item.id)}
						<article
							class="flex shrink-0 flex-col items-start gap-2.5 rounded-xl border bg-bg-tint p-3 {item.isBackground ? 'border-accent' : 'border-secondary'}"
							data-class-id={item.id}
						>
							<div class="flex w-full items-center gap-2">
								<div class="min-w-0 flex-1 font-bold">
								{#if item.isBackground}
									<div class="flex h-9 items-center">{item.name}</div>
								{:else}
									<TextInput
										bind:value={() => item.name, (name) => TeachableMachineState.renameClass(item.id, String(name))}
										mode="background"
										rounded={true}
									/>
								{/if}
								</div>
								{#if item.isBackground}
									<span class="text-[10px] font-extrabold uppercase tracking-wider text-accent">{$_("TEACHABLE_MACHINE_REQUIRED")}</span>
								{:else}
									<button class="grid size-7 cursor-pointer place-items-center border-0 bg-transparent text-red-500" aria-label={$_("TEACHABLE_MACHINE_DELETE_CLASS", { values: { name: item.name } })} onclick={() => TeachableMachineState.deleteClass(item.id)}>
										<Fa icon={faTrash} />
									</button>
								{/if}
							</div>

							<div class="flex w-full items-center gap-2 text-[11px] text-on-secondary-muted">
								<span>{$_("TEACHABLE_MACHINE_SAMPLE_COUNT", { values: { current: item.samples.length, minimum: TeachableMachineState.minimumSamples(item) } })}</span>
								<div class="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
									<i class="block h-full rounded-full bg-accent transition-[width] duration-300" style:width={`${Math.min(100, (item.samples.length / TeachableMachineState.minimumSamples(item)) * 100)}%`}></i>
								</div>
							</div>

							{#if item.isBackground}
								<p class="m-0 text-xs text-on-secondary-muted">{$_("TEACHABLE_MACHINE_BACKGROUND_HINT")}</p>
							{/if}

							{#if item.samples.length}
								<div class="flex w-full gap-2 overflow-x-auto pb-1" aria-label={$_("TEACHABLE_MACHINE_CLASS_SAMPLES", { values: { name: item.name } })}>
									{#each item.samples as sample, index (sample.id)}
										<div class="relative shrink-0">
											<Spectrogram logMel={sample.logMel} label={$_("TEACHABLE_MACHINE_SAMPLE_SPECTROGRAM", { values: { name: item.name, number: index + 1 } })} />
											<button class="absolute right-0.5 top-0.5 grid size-[18px] cursor-pointer place-items-center rounded-full border-0 bg-black/80 text-[9px] text-white" aria-label={$_("TEACHABLE_MACHINE_DELETE_SAMPLE", { values: { number: index + 1 } })} onclick={() => TeachableMachineState.deleteSample(item.id, sample.id)}>
												<Fa icon={faXmark} />
											</button>
										</div>
									{/each}
								</div>
							{/if}

							{#if TeachableMachineState.recordingClassId === item.id}
								<RecordingProgress
									total={TeachableMachineState.recordingTotal}
									current={TeachableMachineState.recordingCurrent}
									progress={TeachableMachineState.recordingProgress}
									received={TeachableMachineState.recordingReceived}
									message={TeachableMachineState.recordingMessage}
								/>
							{:else}
								<div class="relative flex w-full items-center gap-2">
									<Button
										name={$_("TEACHABLE_MACHINE_RECORD")}
										icon={faMicrophone}
										mode="primary"
										inline={true}
										grow={true}
										disabled={!TeachableMachineState.connected || TeachableMachineState.recordingClassId !== null}
										onclick={() => record(item)}
									/>
									<Button
										icon={faGear}
										ariaLabel={$_("TEACHABLE_MACHINE_RECORDING_SETTINGS")}
										mode="secondary"
										inline={true}
										onclick={() => toggleBatchSettings(item.id)}
									/>
									{#if batchSettingsClassId === item.id}
										<div class="absolute bottom-10 right-0 z-20 flex items-center gap-2 rounded-xl bg-bg px-3 py-2 text-xs text-on-secondary-muted shadow-card">
											<span>{$_("TEACHABLE_MACHINE_SAMPLES_PER_RECORDING")}</span>
											<span class="w-16">
												<TextInput
													type="number"
													min={1}
													max={12}
													bind:value={batchCounts[item.id]}
													mode="background"
													rounded={true}
												/>
											</span>
										</div>
									{/if}
								</div>
							{/if}
						</article>
					{/each}
				</div>

				<Button name={$_("TEACHABLE_MACHINE_ADD_CLASS")} icon={faPlus} mode="secondary" onclick={addClass} />
			</section>

			<section class="relative z-10 flex max-h-full min-w-0 flex-col items-stretch gap-4 overflow-y-auto rounded-2xl border border-secondary bg-bg p-4" data-stage="train">
				<div class="flex items-center gap-3">
					<StepNumber number={2} state={!TeachableMachineState.canTrain ? "locked" : TeachableMachineState.model ? "done" : "active"} />
					<div><h2 class="m-0 text-xl!">{$_("TEACHABLE_MACHINE_TRAIN_TITLE")}</h2><p class="mt-0.5 text-xs text-on-secondary-muted">{$_("TEACHABLE_MACHINE_TRAIN_DESC")}</p></div>
				</div>

				<Locked locked={!TeachableMachineState.canTrain} reason={$_("TEACHABLE_MACHINE_MINIMUM_SAMPLES")}>
					<div class="flex flex-col gap-4">
						<TipCard title={$_("TEACHABLE_MACHINE_TIP_TRAIN_TITLE")} text={$_("TEACHABLE_MACHINE_TIP_TRAIN_TEXT")} />

						<Button
							name={TeachableMachineState.training ? $_("TEACHABLE_MACHINE_TRAINING") : TeachableMachineState.model ? $_("TEACHABLE_MACHINE_TRAIN_AGAIN") : $_("TEACHABLE_MACHINE_TRAIN_MODEL")}
							icon={faPlay}
							mode="accent"
							bold={true}
							disabled={!TeachableMachineState.canTrain || TeachableMachineState.training || TeachableMachineState.recordingClassId !== null}
							onclick={() => TeachableMachineState.train()}
						/>

						{#if TeachableMachineState.training}
							<div class="flex flex-col gap-1 text-xs">
								<span>{$_("TEACHABLE_MACHINE_TRAINING_PROGRESS", { values: { epoch: lastLoss?.epoch ?? 0, total: TeachableMachineState.settings.epochs } })}</span>
								<ProgressBar progress={((lastLoss?.epoch ?? 0) / TeachableMachineState.settings.epochs) * 100} />
							</div>
						{/if}

						<div class="rounded-xl bg-bg-tint p-3">
							<div class="flex justify-between gap-2 text-xs">
								<strong>{$_("TEACHABLE_MACHINE_TRAINING_LOSS")}</strong>
								{#if lastLoss}<span class="text-on-secondary-muted">{$_("TEACHABLE_MACHINE_EPOCH_LOSS", { values: { epoch: lastLoss.epoch, loss: lastLoss.loss.toFixed(4) } })}</span>{/if}
							</div>
							<p class="m-0 mt-0.5 text-[11px] text-on-secondary-muted">{$_("TEACHABLE_MACHINE_TRAINING_LOSS_DESC")}</p>
							<LineChart
								values={TeachableMachineState.lossHistory.map((point) => point.loss)}
								label={$_("TEACHABLE_MACHINE_TRAINING_LOSS_GRAPH")}
								placeholder={$_("TEACHABLE_MACHINE_LOSS_PLACEHOLDER")}
							/>
						</div>

						{#if TeachableMachineState.model}
							<div class="flex flex-col gap-1 rounded-xl bg-success/15 px-3 py-2 text-xs">
								<strong>{$_("TEACHABLE_MACHINE_FINAL_ACCURACY", { values: { accuracy: (TeachableMachineState.model.finalAccuracy * 100).toFixed(1) } })}</strong>
								<span>{$_("TEACHABLE_MACHINE_FINAL_ACCURACY_DESC")}</span>
								<span>{$_("TEACHABLE_MACHINE_TRAINED_SAMPLE_SUMMARY", { values: { recorded: TeachableMachineState.model.realSamples, augmented: TeachableMachineState.model.generatedSamples } })}</span>
							</div>
						{/if}

						<Disclosure title={$_("TEACHABLE_MACHINE_ADVANCED_SETTINGS")} bind:open={advanced}>
							<div class="flex flex-col gap-3 text-sm">
								<Field label={$_("TEACHABLE_MACHINE_EPOCHS")} hint={$_("TEACHABLE_MACHINE_EPOCHS_HINT")}>
									<TextInput type="number" min={1} max={1000} bind:value={TeachableMachineState.settings.epochs} mode="secondary" rounded={true} />
								</Field>
								<Field label={$_("TEACHABLE_MACHINE_LEARNING_RATE")} hint={$_("TEACHABLE_MACHINE_LEARNING_RATE_HINT")}>
									<TextInput type="number" min={0.000001} max={1} step={0.001} bind:value={TeachableMachineState.settings.learningRate} mode="secondary" rounded={true} />
								</Field>
								<Field label={$_("TEACHABLE_MACHINE_BATCH_SIZE")} hint={$_("TEACHABLE_MACHINE_BATCH_SIZE_HINT")}>
									<TextInput type="number" min={1} max={256} bind:value={TeachableMachineState.settings.batchSize} mode="secondary" rounded={true} />
								</Field>
								<Field label={$_("TEACHABLE_MACHINE_L2_REGULARIZATION")} hint={$_("TEACHABLE_MACHINE_L2_REGULARIZATION_HINT")}>
									<TextInput type="number" min={0} max={1} step={0.0001} bind:value={TeachableMachineState.settings.l2} mode="secondary" rounded={true} />
								</Field>
								<Field label={$_("TEACHABLE_MACHINE_VARIATIONS_PER_SAMPLE")} hint={$_("TEACHABLE_MACHINE_VARIATIONS_PER_SAMPLE_HINT")}>
									<TextInput type="number" min={0} max={12} bind:value={TeachableMachineState.settings.variationsPerSample} mode="secondary" rounded={true} />
								</Field>
								<Field label={$_("TEACHABLE_MACHINE_LAYER_BACKGROUND_NOISE")} hint={$_("TEACHABLE_MACHINE_LAYER_BACKGROUND_NOISE_HINT")}>
									<Switch name="" mode="secondary" bind:checked={TeachableMachineState.settings.noiseLayering} />
								</Field>
							</div>
						</Disclosure>
					</div>
				</Locked>
			</section>

			<section class="relative z-10 flex max-h-full min-w-0 flex-col items-stretch gap-4 overflow-y-auto rounded-2xl border border-secondary bg-bg p-4" data-stage="test">
				<div class="flex items-center gap-3">
					<StepNumber number={3} state={!TeachableMachineState.model ? "locked" : "active"} />
					<div><h2 class="m-0 text-xl!">{$_("TEACHABLE_MACHINE_TEST_TITLE")}</h2><p class="mt-0.5 text-xs text-on-secondary-muted">{$_("TEACHABLE_MACHINE_TEST_DESC")}</p></div>
				</div>

				<Locked locked={!TeachableMachineState.model} reason={$_("TEACHABLE_MACHINE_TRAIN_TO_TEST")}>
					<div class="flex flex-col gap-4">
						<TipCard icon={faEarListen} title={$_("TEACHABLE_MACHINE_TIP_TEST_TITLE")} text={$_("TEACHABLE_MACHINE_TIP_TEST_TEXT")} />

						<Button
							name={TeachableMachineState.listening ? $_("TEACHABLE_MACHINE_STOP_LISTENING") : $_("TEACHABLE_MACHINE_START_LISTENING")}
							icon={TeachableMachineState.listening ? faCircleStop : faMicrophone}
							mode={TeachableMachineState.listening ? "secondary" : "accent"}
							bold={true}
							disabled={!TeachableMachineState.model || !TeachableMachineState.connected || TeachableMachineState.recordingClassId !== null}
							onclick={() => TeachableMachineState.listening ? TeachableMachineState.stopListening() : TeachableMachineState.startListening()}
						/>

						<div class="flex max-h-80 flex-col gap-4 overflow-auto">
							{#each TeachableMachineState.classes as item, index (item.id)}
								<div>
									<div class="mb-1.5 flex justify-between gap-2 text-xs"><strong>{item.name}</strong><span class="tabular-nums text-on-secondary-muted">{Math.round((TeachableMachineState.activations[index] ?? 0) * 100)}%</span></div>
									<div class="h-[18px] overflow-hidden rounded-full bg-bg-tint">
										<i class="block h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-100" style:width={`${(TeachableMachineState.activations[index] ?? 0) * 100}%`}></i>
									</div>
								</div>
							{/each}
						</div>

						{#if TeachableMachineState.model}
							<p class="m-0 text-xs text-on-secondary-muted">{$_("TEACHABLE_MACHINE_USE_HINT")}</p>
						{/if}
					</div>
				</Locked>
			</section>
		</div>
	</div>
</Windowed>
