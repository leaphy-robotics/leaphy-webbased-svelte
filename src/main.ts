import "./app.css";
import App from "./App.svelte";
import { mount } from "svelte";
import { addMessages, init, locale } from "svelte-i18n"
import enTranslations from "./assets/translations/en.json"
import nlTranslations from "./assets/translations/nl.json"

addMessages('en', enTranslations)
addMessages('nl', nlTranslations)

init({
  fallbackLocale: 'en',
  initialLocale: localStorage.getItem('language')
})

const app = mount(App, {
  target: document.getElementById("app")!,
});

export default app;
