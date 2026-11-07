import * as Sentry from "@sentry/svelte";

function initSentry() {
	if (!import.meta.env.VITE_SENTRY_DSN) return;

	Sentry.init({
		dsn: import.meta.env.VITE_SENTRY_DSN,
		// Monaco cancels its own pending clipboard writes on WebKit and doesn't handle the rejection
		ignoreErrors: [/^Canceled: Canceled$/],
		integrations: [
			Sentry.browserTracingIntegration(),
			Sentry.replayIntegration({
				maskAllText: false,
			}),
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
