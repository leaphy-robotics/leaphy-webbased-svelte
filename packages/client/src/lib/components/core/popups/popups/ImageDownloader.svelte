<script lang="ts">
import type { PopupState } from "$state/popup.svelte";
import { getContext, onMount } from "svelte";
import { _ } from "svelte-i18n";
import Windowed from "../Windowed.svelte";
import Process from "./Process.svelte";
//Note: this is a downloader for system images, not visual pictures.

interface Props {
	url: string;
}

const popupState = getContext<PopupState>("state");
let { url }: Props = $props();

async function downloadImage() {
	try {
		let response = await fetch(url);
		if (response.status !== 200) {
			popupState.close("FIRMWARE_DOWNLOAD_FAILED_RESPONSE");
		} else {
			let img_bytes = await response.bytes();
			popupState.close(img_bytes);
		}
	} catch {
		popupState.close("FIRMWARE_DOWNLOAD_FAILED_OTHER");
	}
	return;
}

onMount(downloadImage);
</script>

<Windowed title={$_("FIRMWARE_DOWNLOAD_TITLE") }>
    <div>{$_("FIRMWARE_DOWNLOAD_MESSAGE")}</div>
    <Process/>
</Windowed>