import * as Sentry from "@sentry/svelte";

function initSentry() {
	if (!import.meta.env.PROD) return;

	Sentry.init({
		dsn: import.meta.env.VITE_SENTRY_DSN,
		integrations: [
			Sentry.browserTracingIntegration(),
			Sentry.replayIntegration(),
		],
		// Performance Monitoring
		tracesSampleRate: Number.parseFloat(
			import.meta.env.VITE_SENTRY_SAMPLE_RATE,
		),
		// Session Replay
		replaysSessionSampleRate: 0.0, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
		replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
	});
}

export default initSentry;
