<script lang="ts">
    import type { Robot } from "$domain/robots";
    import appState, { Screen } from "$state/app.svelte";
    import workspaceState from "$state/workspace.svelte";

    interface Props {
        robots: Robot[][];
        secondary: boolean;
    }
    let { robots, secondary }: Props = $props();

    function select(robot: Robot) {
        if ("variants" in robot) return (appState.selected = robot);

        workspaceState.robot = robot;
        workspaceState.mode = robot.modes[0];
        appState.screen = Screen.WORKSPACE;
    }
</script>

<div class="selector" class:secondary>
    {#each robots as row}
        <div class="row">
            {#each row as robot}
                <button
                    class="robot"
                    onclick={() => select(robot)}
                    class:selected={appState.selected?.id === robot.id}
                >
                    <span class="icon">
                        <img class="image" src={robot.icon} alt={robot.name} />
                    </span>
                    <span class="name">{robot.name}</span>
                </button>
            {/each}
        </div>
    {/each}
</div>

<style>
    .selector {
        width: 50vw;
        height: 100%;

        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 50px;
    }
    .secondary {
        background: #fff;
    }

    .row {
        display: flex;
        justify-content: center;
        gap: 24px;
    }

    .robot {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;

        flex: 1;
        max-width: 180px;
        cursor: pointer;

        border: none;
        background: none;
        padding: 0;

        transition: 0.1s ease;
    }
    .robot.selected,
    .robot:hover {
        scale: 1.03;
    }
    .icon {
        display: flex;
        justify-content: center;
        align-items: center;

        box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
        border: solid 1px #f1f1f1;
        background: #fff;
        aspect-ratio: 1/1;
        width: 100%;
        border-radius: 0.375rem;

        transition: 0.1s ease;
    }
    .robot.selected .icon,
    .robot:hover .icon {
        border: 3px solid var(--primary) !important;
    }

    .image {
        max-width: 90%;
        max-height: 90%;
    }
    .name {
        font-size: 1rem;
    }
</style>
