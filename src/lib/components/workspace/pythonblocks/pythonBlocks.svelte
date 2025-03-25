<script lang="ts">
    import Dropper from "$components/ui/Dropper.svelte";
    import {loadToolbox,setLocale,setupWorkspace } from "$domain/blockly/blockly";
    import { dark, light } from "$domain/blockly/theme";
    import { Theme, theme } from "$state/app.svelte";
    import {
        canRedo,
        canUndo,
        restore,
        willRestore,
        workspace,
    } from "$state/blockly.svelte";
    import { code, robot } from "$state/workspace.svelte";
    import { micropython } from "@leaphy-robotics/leaphy-blocks";
    import { Events, WorkspaceSvg, serialization } from "blockly";
    import { onMount } from "svelte";
    import { locale } from "svelte-i18n";
    import { get } from "svelte/store";
    
    let backgroundX = $state(0);
    
    function getTheme(theme: Theme) {
        return theme === Theme.DARK ? dark : light;
    }
    
    function updateSizing() {
        const toolbox = ($workspace as WorkspaceSvg).getToolbox();
        backgroundX =
            window.innerWidth / 2 +
            (toolbox.getFlyout().isVisible() ? toolbox.getFlyout().getWidth() : 0) / 2 +
            40;
    }
    
    let element: HTMLDivElement;
    onMount(() => {
        workspace.set(
            setupWorkspace(
                $robot,
                element,
                getTheme($theme),
                get(willRestore) ? get(restore) : undefined,
            ),
        );
        updateSizing();
        $workspace.addChangeListener((event) => {
            canUndo.set(get(workspace).getUndoStack().length > 0);
            canRedo.set(get(workspace).getRedoStack().length > 0);
    
            code.set(micropython.workspaceToCode($workspace, $robot.id));
            updateSizing();
    
            if (event.type === Events.TOOLBOX_ITEM_SELECT) {
                ($workspace as WorkspaceSvg).resize();
            }
        });
    
        robot.subscribe(() => {
            ($workspace as WorkspaceSvg).updateToolbox(loadToolbox($robot));
            ($workspace as WorkspaceSvg).getToolbox().selectItemByPosition(0);
            ($workspace as WorkspaceSvg).getToolbox().refreshTheme();
        });
    });
    
    locale.subscribe((locale) => {
        setLocale($robot, locale);
    
        if ($workspace && element) {
            const content = serialization.workspaces.save($workspace);
            $workspace.dispose();
    
            workspace.update(() =>
                setupWorkspace($robot, element, getTheme($theme), content),
            );
            $workspace.addChangeListener(() => {
                let pythonCode = "from leaphymicropython.utils.pins import set_pwm\n\n";
                pythonCode += micropython.workspaceToCode($workspace, $robot.id);
                code.set(pythonCode);
            });
        }
    });
    
    theme.subscribe((theme) => {
        if (!$workspace || !($workspace instanceof WorkspaceSvg)) return;
    
        $workspace.setTheme(getTheme(theme));
        $workspace.refreshTheme();
    });
    </script>
    
    <div class="environment">
        {#if $robot.background}
            <img class="background" src="{$robot.background}" alt="{$robot.name}" style:left={`${backgroundX}px`}>
        {/if}
        <div class="blockly" bind:this={element}></div>
        <Dropper />
    </div>
    
    <style>
        .blockly {
            height: var(--full-height);
        }
    
        .environment {
            position: relative;
        }
    
        .background {
            position: absolute;
            width: 100%;
            max-width: 600px;
            max-height: 600px;
            top: 50%;
            translate: -50% -50%;
            z-index: -1;
        }
    </style>