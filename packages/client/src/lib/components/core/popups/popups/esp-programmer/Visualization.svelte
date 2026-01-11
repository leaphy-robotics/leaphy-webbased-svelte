<script lang="ts">
    import visualization from "$assets/esp-reset/visualization.svg?raw";
	import { onMount, onDestroy } from "svelte";

    interface Props {
        program: "RESET_TWICE" | "RESET";
    }
    const { program }: Props = $props();

    let contentWrapper = $state<HTMLDivElement>();
    let blinkInterval: ReturnType<typeof setInterval> | null = null;

    onDestroy(() => {
        if (blinkInterval) {
            clearInterval(blinkInterval);
        }
    });

    onMount(() => {
        const indicatorEffect = contentWrapper.querySelector("#indicator-effect") as SVGElement;
        const resetCircle = contentWrapper.querySelector("#reset-circle") as SVGElement;
        const ledBuiltin = contentWrapper.querySelector("#led-builtin") as SVGElement;

        if (!indicatorEffect || !resetCircle) return;

        function animateResetPress(element: SVGElement, visibleDuration: number): Promise<void> {
            return new Promise((resolve) => {
                const fadeInDuration = 150;
                const fadeOutDuration = 150;
                
                // Fade in
                element.style.transition = `opacity ${fadeInDuration}ms ease-out`;
                element.style.opacity = "1";
                setTimeout(() => {
                    // Stay visible
                    setTimeout(() => {
                        // Fade out
                        element.style.transition = `opacity ${fadeOutDuration}ms ease-in`;
                        element.style.opacity = "0";
                        setTimeout(resolve, fadeOutDuration);
                    }, visibleDuration);
                }, fadeInDuration);
            });
        }

        function animateLEDPulse(element: SVGElement, fadeInDuration: number, fadeOutDuration: number): Promise<void> {
            return new Promise((resolve) => {
                // Fade in
                element.style.transition = `opacity ${fadeInDuration}ms ease-in-out`;
                element.style.opacity = "1";
                setTimeout(() => {
                    // Fade out
                    element.style.transition = `opacity ${fadeOutDuration}ms ease-in-out`;
                    element.style.opacity = "0";
                    setTimeout(resolve, fadeOutDuration);
                }, fadeInDuration);
            });
        }

        async function runResetTwiceAnimation() {
            // Reset both elements to initial state
            indicatorEffect.style.opacity = "0";
            resetCircle.style.opacity = "0";
            indicatorEffect.style.transition = "";
            resetCircle.style.transition = "";

            // First reset press (stays visible for 400ms to make it clear)
            await animateResetPress(resetCircle, 400);
            
            // Wait 500ms before second press
            await new Promise(resolve => setTimeout(resolve, 250));
            
            // Second reset press (stays visible for 400ms to make it clear)
            await animateResetPress(resetCircle, 400);

            // Wait a bit before LED animation starts
            await new Promise(resolve => setTimeout(resolve, 200));

            // LED pulses 3 times (fade in 1s, fade out 1s each)
            for (let i = 0; i < 3; i++) {
                await animateLEDPulse(indicatorEffect, 1000, 1000);
            }

            // Wait before repeating
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Repeat the animation
            runResetTwiceAnimation();
        }

        async function runResetAnimation() {
            if (!ledBuiltin) return;

            // Reset elements to initial state
            resetCircle.style.opacity = "0";
            ledBuiltin.style.opacity = "0";
            resetCircle.style.transition = "";
            ledBuiltin.style.transition = "";

            // Flash reset circle once
            await animateResetPress(resetCircle, 400);

            // Wait a bit before LED starts blinking
            await new Promise(resolve => setTimeout(resolve, 200));

            // LED blinks 3 times (on-off, on-off, on-off)
            let isOn = false;
            let blinkCount = 0;
            const totalBlinks = 3; // 3 full blinks = 6 state changes (3 on, 3 off)

            blinkInterval = setInterval(() => {
                isOn = !isOn;
                ledBuiltin.style.transition = "none";
                ledBuiltin.style.opacity = isOn ? "1" : "0";
                
                // Count when LED turns off (complete blink)
                if (!isOn) {
                    blinkCount++;
                    // After 3 full blinks, clear interval and repeat animation
                    if (blinkCount >= totalBlinks) {
                        if (blinkInterval) {
                            clearInterval(blinkInterval);
                            blinkInterval = null;
                        }
                        // Wait a bit before repeating
                        setTimeout(() => {
                            runResetAnimation();
                        }, 500);
                    }
                }
            }, 1000);
        }

        // Start the appropriate animation based on program type
        if (program === "RESET") {
            runResetAnimation();
        } else {
            runResetTwiceAnimation();
        }
    })
</script>

<div class="visualization" bind:this={contentWrapper}>
    {@html visualization}
</div>

<style>
    .visualization {
        width: 100%;
    }

    .visualization :global(svg) {
        width: 100%;
        height: 100%;
    }
</style>
