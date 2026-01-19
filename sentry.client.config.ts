/**
 * Sentry Client Configuration
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Set tracesSampleRate to 1.0 to capture 100% of the transactions for performance monitoring.
  tracesSampleRate: 1.0,
  
  // Set `tracePropagationTargets` to control which URLs should be traced
  tracePropagationTargets: [
    'localhost',
    /^https:\/\/yourserver\.com\/api/,
  ],
  
  // Session Replay
  replaysSessionSampleRate: 0.1, // Sample 10% of sessions
  replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions with errors
  
  // Organization and Project
  org: 'pretos-media-group',
  project: 'javascript-nextjs',
  
  beforeSend(event, hint) {
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },
});

