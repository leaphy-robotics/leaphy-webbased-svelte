<script lang="ts">
import { getContext } from "svelte";
import { locale } from "svelte-i18n";
import leaphyLogo from "$assets/leaphy-logo-color.svg";
import english from "$assets/translations/en.svg";
import dutch from "$assets/translations/nl.svg";
import ukrainian from "$assets/translations/ua.svg";
import type { PopupState } from "$state/popup.svelte";

const popupState = getContext<PopupState>("state");
function select(language: string) {
	locale.set(language);
	localStorage.setItem("language", language);
	popupState.close();
}
</script>

{#snippet languageButton(src: string, alt: string, label: string, code: string)}
	<button class="flex items-center border border-primary-dark rounded-2xl gap-2.5 p-1.5 cursor-pointer bg-transparent text-base text-on-bg hover:bg-bg-tint transition-colors" onclick={() => select(code)}>
		<img class="w-12 rounded-xl" {src} {alt} />
		<div class="flex justify-center items-center flex-1">{label}</div>
	</button>
{/snippet}

<div class="flex flex-col w-[450px] gap-12 px-20 py-12">
	<img class="h-8" src={leaphyLogo} alt="Leaphy" />
	<div class="flex flex-col gap-5">
		{@render languageButton(english, "English", "English", "en")}
		{@render languageButton(dutch, "Nederlands", "Nederlands", "nl")}
		{@render languageButton(ukrainian, "Ukrainian", "Yкраїнський", "ua")}
	</div>
</div>
