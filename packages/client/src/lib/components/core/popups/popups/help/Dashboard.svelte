<script lang="ts">
    import { _ } from "svelte-i18n";
    import Windowed from "../../Windowed.svelte";
    import Circuit from "./Circuit.svelte";
    import Container from "./Container.svelte";
    import { faProjectDiagram, faRobot, faBook, faMessage } from "@fortawesome/free-solid-svg-icons";
    import { faList } from "@fortawesome/free-solid-svg-icons";
    import Button from "$components/ui/Button.svelte";
    import Videos from "./Videos.svelte";
    import PopupsState, { type PopupState} from "$state/popup.svelte";
    import { getContext } from "svelte";
    import Solver from "../solver/Solver.svelte";
    import Tutorials from "../tutorials/Tutorials.svelte";

    let popupState = getContext<PopupState>("state");

    function openSolver() {
        PopupsState.open({
            component: Solver,
            data: {},
            allowInteraction: true,
        });
        popupState.close();
    }

    function openTutorials() {
        PopupsState.open({
            component: Tutorials,
            data: {},
            allowInteraction: true,
            allowOverflow: true,
            position: {
                x: (window.innerWidth / 2) - 320,
                y: (window.innerHeight / 2) - 210,
            },
        });
        popupState.close();
    }
    </script>
    
    <Windowed title={$_("HELP_TOOLS")}>
        <div class="content">
            <Container title={$_("CIRCUIT")} icon={faProjectDiagram}>
                <Circuit />
            </Container>
            <div class="vertical-container">
                <Container title={$_("SOLVER")} icon={faRobot}>
                    <div class="description">{$_("SOLVER_DESCRIPTION")}</div>
                    <Button icon={faMessage} mode="primary" name={$_("ASK")} onclick={openSolver} />
                </Container>
                <Container title={$_("TUTORIALS")} icon={faBook}>
                    <div class="description">{$_("TUTORIALS_DESCRIPTION")}</div>
                    <Videos />
                    <Button icon={faList} mode="primary" name={$_("SEE_ALL")} onclick={openTutorials} />
                </Container>
            </div>
        </div>
    </Windowed>
    
    <style>
        .content {
            display: grid;
            grid-template-columns: 1fr 400px;
            gap: 10px;
            padding: 10px;

            background: var(--background-tint);
            width: 80vw;
            max-width: 1000px;
            max-height: 600px;
        }

        .vertical-container {
            display: grid;
            grid-template-rows: auto 1fr;
            gap: 10px;
        }
    </style>
    