<script lang="ts">
    import leaphyLogo from "$assets/leaphy-logo-color.svg";
    import english from "$assets/translations/en.svg"
    import dutch from "$assets/translations/nl.svg"
    import { popups, type PopupState } from "$state/popup.svelte";
    import { getContext } from "svelte";
    import { locale } from "svelte-i18n";
    import type { Writable } from "svelte/store";

    const popupState = getContext<Writable<PopupState>>('state')
    function select(language: string) {
        locale.set(language)
        localStorage.setItem('language', language)
        popups.close($popupState.id)
    }
</script>

<div class="content">
    <img class="logo" src={leaphyLogo} alt="Leaphy">
    <div class="languages">
        <button class="language" onclick={() => select('en')}>
            <img class="icon" src={english} alt="English">
            <div class="name">English</div>
        </button>
        <button class="language" onclick={() => select('nl')}>
            <img class="icon" src={dutch} alt="Nederlands">
            <div class="name">Nederlands</div>
        </button>
    </div>
</div>

<style>
    .content {
        display: flex;
        flex-direction: column;
        width: 450px;
        gap: 50px;
        padding: 50px 80px;
    }

    .logo {
        height: 30px;
    }

    .languages {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .language {
        display: flex;
        align-items: center;
        border: 1px solid var(--primary-dark-tint);
        border-radius: 15px;
        gap: 10px;
        padding: 6px;
        cursor: pointer;
        background: none;
        font-size: 1em;
        color: var(--on-background);
    }

    .icon {
        width: 50px;
        border-radius: 10px;
    }

    .name {
        display: flex;
        justify-content: center;
        align-items: center;
        flex: 1;
    }
</style>
