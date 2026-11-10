<script lang="ts" module>
export type StatusKind = "info" | "loading" | "success" | "warning" | "error";
</script>

<script lang="ts">
import {
	faCircleCheck,
	faCircleExclamation,
	faCircleInfo,
	faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import type { Snippet } from "svelte";
import Fa from "svelte-fa";
import Spinner from "$components/ui/Spinner.svelte";


interface Props {
	kind: StatusKind;
	title: string;
	message?: string;
	compact?: boolean;
	actions?: Snippet;
}
const { kind, title, message, compact = false, actions }: Props = $props();

const kindClasses: Record<StatusKind, string> = {
	info: "bg-primary text-on-primary",
	loading: "bg-primary text-on-primary",
	success: "bg-success text-white",
	warning: "bg-warning text-black",
	error: "bg-danger text-white",
};

const icons = {
	info: faCircleInfo,
	success: faCircleCheck,
	warning: faTriangleExclamation,
	error: faCircleExclamation,
};
</script>

<div
	class="flex items-center justify-between gap-4 text-left {kindClasses[kind]} {compact ? 'rounded-xl px-3 py-2 text-sm' : 'rounded-2xl px-4 py-2.5'}"
	role={kind === "error" ? "alert" : "status"}
	aria-live={kind === "error" ? "assertive" : "polite"}
>
	<div class="flex min-w-0 items-center gap-3">
		<span class="shrink-0 {compact ? 'text-base' : 'text-lg'}">
			{#if kind === "loading"}
				<Spinner />
			{:else}
				<Fa icon={icons[kind]} />
			{/if}
		</span>
		<div class="flex min-w-0 flex-col gap-0.5">
			<div class="font-bold">{title}</div>
			{#if message}<div class="text-sm opacity-90">{message}</div>{/if}
		</div>
	</div>
	{#if actions}
		<div class="flex shrink-0 gap-2">{@render actions()}</div>
	{/if}
</div>
