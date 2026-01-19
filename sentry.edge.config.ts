/**
 * Sentry Edge Configuration
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Set tracesSampleRate to 1.0 to capture 100% of the transactions for performance monitoring.
  tracesSampleRate: 1.0,
  
  // Organization and Project
  org: 'pretos-media-group',
  project: 'javascript-nextjs',
});

