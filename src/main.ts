import "@xterm/xterm/css/xterm.css";
import "./app.css";
import { mount } from "svelte";
import { addMessages, init } from "svelte-i18n";
import "$domain/robots";
import App from "./App.svelte";
import enTranslations from "./assets/translations/en.json";
import nlTranslations from "./assets/translations/nl.json";
import initMatomo from "./lib/matomo";
import initSentry from "./lib/sentry";

initSentry();

addMessages("en", enTranslations);
addMessages("nl", nlTranslations);

init({
	fallbackLocale: "en",
	initialLocale: localStorage.getItem("language"),
});

initMatomo();

const app = mount(App, {
	target: document.getElementById("app"),
});

export default app;
