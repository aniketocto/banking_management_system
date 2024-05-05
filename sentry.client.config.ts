import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://94820322a9c31aea84d2c48226644e07@o4507205100371968.ingest.us.sentry.io/4507205102075904",

  // We recommend adjusting this value in production, or using `tracesSampler`
  // for finer control
  tracesSampleRate: 1.0,

  integrations: [Sentry.replayIntegration()],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});
