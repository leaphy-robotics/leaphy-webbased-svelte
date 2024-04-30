<script lang="ts">
    import Button from "$components/ui/Button.svelte";
    import ProgressBar from "$components/ui/ProgressBar.svelte";
    import { Prompt, port, robot } from "$state/workspace.svelte"
    import { getContext, onMount } from "svelte";
    import { type PopupState, popups } from "$state/popup.svelte"
    import { type Writable } from "svelte/store";

    interface Props {
      source: string
    }
    let popupState = getContext<Writable<PopupState>>("state")
    let { source }: Props = $props()
    let progress = $state(0)
    let currentState = $state("Connecting...")
    let error = $state<string|null>(null)
    let done = $state(false)

    class UploadError extends Error {
        constructor(public name: string, public description: string) {
            super()
        }
    }

    async function compile() {
        currentState = "Compiling..."
        const res = await fetch('https://testleaphyeasybloqs.com:8443/compile/cpp', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                source_code: source,
                board: $robot.fqbn,
                libraries: $robot.libraries
            })
        })
        if (!res.ok) {
            const { detail } = await res.json()
            throw new UploadError("Compile Error", detail)
        }

        return await res.json()
    }

    async function upload(res: Record<string, string>) {
        currentState = "Uploading..."
        port.reserve()
        await $robot.programmer.upload($port, res)
        port.release()
    }

    onMount(async () => {
        try {
            if (!$port) await port.connect(Prompt.MAYBE)
            progress += 100/3

            const res = await compile()
            progress += 100/3

            await upload(res)

            progress = 100
            currentState = "Robot update complete"
            done = true
        } catch (e) {
            if (e instanceof UploadError) {
                done = true
                currentState = e.name
                error = e.description
            }
        }
    })

    function close() {
        popups.close($popupState.id)
    }
</script>

<div class="content" class:error={!!error}>
    <h2 class="state">{currentState}</h2>
    {#if error}
        <code class="error-result">{error}</code>
    {/if}
    {#if done}
        <Button name={"Go back to editor"} mode={"primary"} onclick={close} />
    {:else}
        <ProgressBar {progress} />
    {/if}
</div>

<style>
    h2 {
        margin: 0;
    }
    
    .content {
        display: flex;
        flex-direction: column;
        padding: 20px;
        gap: 20px;
        justify-content: center;
        align-items: center;
        min-width: 400px;
        max-width: 80vw;
        min-height: 200px;
        max-height: 80vh;
    }

    .state {
        font-weight: bold;
    }

    .error h2 {
        color: red;
    }
    .error-result {
        background: var(--secondary);
        border-radius: 5px;
        padding: 10px;
        color: red;
    }
</style>
