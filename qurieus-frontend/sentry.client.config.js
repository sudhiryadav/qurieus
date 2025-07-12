import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Session Replay
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Enable debug mode in development
  debug: process.env.NODE_ENV === "development",
  
  // Before send function to filter out certain errors
  beforeSend(event, hint) {
    // Don't send errors in development
    if (process.env.NODE_ENV === "development") {
      return null;
    }
    
    // Filter out certain error types if needed
    if (event.exception) {
      const exception = event.exception.values?.[0];
      if (exception?.type === "NetworkError" || exception?.type === "ChunkLoadError") {
        return null;
      }
    }
    
    // Add LogRocket session URL if available
    if (typeof window !== "undefined" && window.__LOGROCKET_SESSION_URL__) {
      event.extra = event.extra || {};
      event.extra.sessionURL = window.__LOGROCKET_SESSION_URL__;
    }
    
    return event;
  },
  
  // Integrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
}); 