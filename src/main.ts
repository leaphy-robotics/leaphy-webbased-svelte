import LanguageSelector from "$components/core/popups/popups/LanguageSelector.svelte";
import { popups } from "$state/popup.svelte";
import "./app.css";
import App from "./App.svelte";
import { mount } from "svelte";
import { register, init, locale } from "svelte-i18n"

register('en', () => import('./assets/translations/en.json'))
register('nl', () => import('./assets/translations/nl.json'))

init({
  fallbackLocale: 'en',
  initialLocale: localStorage.getItem('language')
})

if (!localStorage.getItem('language')) {
  popups.open({
    component: LanguageSelector,
    data: {},
    allowInteraction: false
  })
}

const app = mount(App, {
  target: document.getElementById("app")!,
});

export default app;
