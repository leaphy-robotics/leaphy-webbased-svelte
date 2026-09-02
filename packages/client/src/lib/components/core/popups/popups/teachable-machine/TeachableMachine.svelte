<script lang="ts">
import {
	faCircleStop,
	faGear,
	faMicrophone,
	faPlay,
	faPlus,
	faTrash,
	faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { onDestroy, onMount, tick } from "svelte";
import Fa from "svelte-fa";
import { _ } from "svelte-i18n";
import Windowed from "$components/core/popups/Windowed.svelte";
import Button from "$components/ui/Button.svelte";
import Switch from "$components/ui/Switch.svelte";
import TextInput from "$components/ui/TextInput.svelte";
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

const lossPath = $derived.by(() => {
	const points = TeachableMachineState.lossHistory;
	if (!points.length) return "";
	const width = 330;
	const height = 170;
	const padding = 12;
	const losses = points.map((point) => point.loss);
	const min = Math.min(...losses);
	const max = Math.max(...losses);
	const span = Math.max(0.000001, max - min);
	return points
		.map((point, index) => {
			const x =
				padding +
				(index / Math.max(1, points.length - 1)) * (width - padding * 2);
			const y =
				height - padding - ((point.loss - min) / span) * (height - padding * 2);
			return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
		})
		.join(" ");
});

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
	if (!SerialState.port) await SerialState.connect(Prompt.MAYBE);
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
	{#if !TeachableMachineState.connected}
		<div class="flex w-full items-center justify-between bg-primary px-2.5 py-1.5 pl-2.5 text-on-primary">
			<div>
				<div class="text-lg font-bold">{$_("NOT_CONNECTED")}</div>
				<div class="text-sm opacity-80">{$_("TEACHABLE_MACHINE_NOT_CONNECTED_DESC")}</div>
			</div>
			<Button mode="accent" name={$_("CHOOSE_ROBOT")} onclick={connect} />
		</div>
	{/if}
	<div class="relative flex w-[min(1480px,96vw)] flex-col overflow-auto rounded-b-xl bg-bg-tint text-on-bg {TeachableMachineState.connected ? 'h-[min(780px,88vh)]' : 'h-[min(720px,calc(88vh-58px))]'}">
		{#if TeachableMachineState.deviceError}
			<div class="absolute left-1/2 top-3 z-30 max-w-[700px] -translate-x-1/2 rounded-xl bg-red-600 px-4 py-2 text-sm text-white shadow-card" role="alert">
				{TeachableMachineState.deviceError}
			</div>
		{/if}

		<div
			class="relative isolate grid min-h-0 flex-1 grid-cols-[minmax(360px,1.15fr)_minmax(330px,.9fr)_minmax(310px,.8fr)] items-center gap-[clamp(55px,6vw,100px)] overflow-hidden px-8 py-6 max-[1050px]:min-w-[1160px]"
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

			<section class="relative z-10 flex max-h-full min-w-0 flex-col items-stretch gap-4 overflow-hidden rounded-2xl border border-secondary bg-bg p-4">
				<div class="flex items-center gap-3">
					<span class="grid size-9 shrink-0 place-items-center rounded-full bg-primary font-extrabold text-on-primary">1</span>
					<div><h2 class="m-0 text-xl">{$_("TEACHABLE_MACHINE_RECORD_TITLE")}</h2><p class="mt-0.5 text-xs text-on-secondary-muted">{$_("TEACHABLE_MACHINE_RECORD_DESC")}</p></div>
				</div>

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

			<section class="relative z-10 flex min-w-0 flex-col items-stretch gap-4 rounded-2xl border border-secondary bg-bg p-4" data-stage="train">
				<div class="flex items-center gap-3">
					<span class="grid size-9 shrink-0 place-items-center rounded-full bg-primary font-extrabold text-on-primary">2</span>
					<div><h2 class="m-0 text-xl">{$_("TEACHABLE_MACHINE_TRAIN_TITLE")}</h2><p class="mt-0.5 text-xs text-on-secondary-muted">{$_("TEACHABLE_MACHINE_TRAIN_DESC")}</p></div>
				</div>

				<Button
					name={TeachableMachineState.training ? $_("TEACHABLE_MACHINE_TRAINING") : $_("TEACHABLE_MACHINE_TRAIN_MODEL")}
					icon={faPlay}
					mode="accent"
					bold={true}
					disabled={!TeachableMachineState.canTrain || TeachableMachineState.training || TeachableMachineState.recordingClassId !== null}
					onclick={() => TeachableMachineState.train()}
				/>

				{#if !TeachableMachineState.canTrain}
					<p class="-mt-2 text-xs leading-5 text-on-secondary-muted">{$_("TEACHABLE_MACHINE_MINIMUM_SAMPLES")}</p>
				{/if}

				<div class="relative rounded-xl bg-bg-tint p-3">
					<div class="flex justify-between gap-2 text-xs">
						<strong>{$_("TEACHABLE_MACHINE_TRAINING_LOSS")}</strong>
						{#if lastLoss}<span class="text-on-secondary-muted">{$_("TEACHABLE_MACHINE_EPOCH_LOSS", { values: { epoch: lastLoss.epoch, loss: lastLoss.loss.toFixed(4) } })}</span>{/if}
					</div>
					<svg class="mt-1 block w-full" viewBox="0 0 330 170" role="img" aria-label={$_("TEACHABLE_MACHINE_TRAINING_LOSS_GRAPH")}>
						<line class="stroke-secondary stroke-1" x1="12" y1="158" x2="318" y2="158"></line>
						<line class="stroke-secondary stroke-1" x1="12" y1="12" x2="12" y2="158"></line>
						{#if lossPath}<path class="fill-none stroke-accent stroke-[3]" stroke-linecap="round" stroke-linejoin="round" d={lossPath}></path>{/if}
					</svg>
					{#if !TeachableMachineState.lossHistory.length}
						<span class="absolute inset-x-0 top-1/2 text-center text-xs text-on-secondary-muted">{$_("TEACHABLE_MACHINE_LOSS_PLACEHOLDER")}</span>
					{/if}
				</div>

				{#if TeachableMachineState.model}
					<div class="flex flex-col gap-1 rounded-xl bg-accent/15 px-3 py-2 text-xs">
						<strong>{$_("TEACHABLE_MACHINE_FINAL_ACCURACY", { values: { accuracy: (TeachableMachineState.model.finalAccuracy * 100).toFixed(1) } })}</strong>
						<span>{$_("TEACHABLE_MACHINE_TRAINED_SAMPLE_SUMMARY", { values: { recorded: TeachableMachineState.model.realSamples, augmented: TeachableMachineState.model.generatedSamples } })}</span>
					</div>
				{/if}

				<details class="border-t border-secondary pt-3" bind:open={advanced}>
					<summary class="cursor-pointer text-xs font-bold text-on-secondary-muted">{$_("TEACHABLE_MACHINE_ADVANCED_SETTINGS")}</summary>
					<div class="mt-3 grid grid-cols-2 gap-2.5">
						<label class="flex flex-col gap-1 text-[11px] text-on-secondary-muted">{$_("TEACHABLE_MACHINE_EPOCHS")} <TextInput type="number" min={1} max={1000} bind:value={TeachableMachineState.settings.epochs} mode="secondary" rounded={true} /></label>
						<label class="flex flex-col gap-1 text-[11px] text-on-secondary-muted">{$_("TEACHABLE_MACHINE_LEARNING_RATE")} <TextInput type="number" min={0.000001} max={1} step={0.001} bind:value={TeachableMachineState.settings.learningRate} mode="secondary" rounded={true} /></label>
						<label class="flex flex-col gap-1 text-[11px] text-on-secondary-muted">{$_("TEACHABLE_MACHINE_BATCH_SIZE")} <TextInput type="number" min={1} max={256} bind:value={TeachableMachineState.settings.batchSize} mode="secondary" rounded={true} /></label>
						<label class="flex flex-col gap-1 text-[11px] text-on-secondary-muted">{$_("TEACHABLE_MACHINE_L2_REGULARIZATION")} <TextInput type="number" min={0} max={1} step={0.0001} bind:value={TeachableMachineState.settings.l2} mode="secondary" rounded={true} /></label>
						<label class="flex flex-col gap-1 text-[11px] text-on-secondary-muted">{$_("TEACHABLE_MACHINE_VARIATIONS_PER_SAMPLE")} <TextInput type="number" min={0} max={12} bind:value={TeachableMachineState.settings.variationsPerSample} mode="secondary" rounded={true} /></label>
						<div class="col-span-2"><Switch name={$_("TEACHABLE_MACHINE_LAYER_BACKGROUND_NOISE")} mode="secondary" bind:checked={TeachableMachineState.settings.noiseLayering} /></div>
					</div>
				</details>
			</section>

			<section class="relative z-10 flex min-w-0 flex-col items-stretch gap-4 rounded-2xl border border-secondary bg-bg p-4" data-stage="test">
				<div class="flex items-center gap-3">
					<span class="grid size-9 shrink-0 place-items-center rounded-full bg-primary font-extrabold text-on-primary">3</span>
					<div><h2 class="m-0 text-xl">{$_("TEACHABLE_MACHINE_TEST_TITLE")}</h2><p class="mt-0.5 text-xs text-on-secondary-muted">{$_("TEACHABLE_MACHINE_TEST_DESC")}</p></div>
				</div>

				<Button
					name={TeachableMachineState.listening ? $_("TEACHABLE_MACHINE_STOP_LISTENING") : $_("TEACHABLE_MACHINE_START_LISTENING")}
					icon={TeachableMachineState.listening ? faCircleStop : faMicrophone}
					mode={TeachableMachineState.listening ? "secondary" : "accent"}
					bold={true}
					disabled={!TeachableMachineState.model || !TeachableMachineState.connected || TeachableMachineState.recordingClassId !== null}
					onclick={() => TeachableMachineState.listening ? TeachableMachineState.stopListening() : TeachableMachineState.startListening()}
				/>

				{#if !TeachableMachineState.model}
					<div class="grid min-h-52 place-content-center justify-items-center text-center text-4xl text-on-secondary-muted">
						<Fa icon={faPlay} />
						<p class="text-xs">{$_("TEACHABLE_MACHINE_TRAIN_TO_TEST")}</p>
					</div>
				{:else}
					<div class="mt-2 flex max-h-80 flex-col gap-4 overflow-auto">
						{#each TeachableMachineState.classes as item, index (item.id)}
							<div>
								<div class="mb-1.5 flex justify-between gap-2 text-xs"><strong>{item.name}</strong><span class="tabular-nums text-on-secondary-muted">{Math.round((TeachableMachineState.activations[index] ?? 0) * 100)}%</span></div>
								<div class="h-[18px] overflow-hidden rounded-full bg-bg-tint">
									<i class="block h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-100" style:width={`${(TeachableMachineState.activations[index] ?? 0) * 100}%`}></i>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</section>
		</div>
	</div>
</Windowed>
