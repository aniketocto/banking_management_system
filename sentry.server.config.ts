import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://94820322a9c31aea84d2c48226644e07@o4507205100371968.ingest.us.sentry.io/4507205102075904",

  // We recommend adjusting this value in production, or using `tracesSampler`
  // for finer control
  tracesSampleRate: 1.0,
});
