<script lang="ts">
import SelectContext from "$components/ui/SelectContext.svelte";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import Fa from "svelte-fa";

interface Props {
	options: [string, any][];
	full?: boolean;
	mode?: "primary" | "secondary";
	value: any;
}
let {
	options,
	value = $bindable(),
	full = false,
	mode = "primary",
}: Props = $props();

let open = $state(false);

function getName(value: any) {
	return options.find(([_, data]) => data === value)?.[0] || "";
}

async function onclick() {
	open = !open;
}

function select(newValue: string) {
	open = false;
	value = newValue;
}
</script>

<div class="select" class:full class:secondary={mode === 'secondary'}>
    <button type="button" {onclick} class:open class="preview">
        <div class="name">{getName(value)}</div>
        <div class="icon"><Fa icon={faCaretDown} /></div>
    </button>
    <SelectContext {mode} {open} {options} onselect={select} />
</div>

<style>
	.select {
		position: relative;
		width: 150px;
	}
	.full {
		width: 100%;
	}
    .preview {
        width: 100%;
    }
    .preview {
        position: relative;
        background: var(--primary-dark-tint);
        color: var(--on-primary);
        border: none;
        padding: 10px 15px;
        border-radius: 20px;
    }
	.secondary .preview {
		background: var(--secondary);
		color: var(--on-secondary);
	}
    .icon {
        position: absolute;
        right: 15px;
        top: 50%;
        translate: 0 -50%;
    }
    .open {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
    }
</style>
