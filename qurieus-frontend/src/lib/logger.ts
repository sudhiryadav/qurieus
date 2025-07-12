import * as Sentry from "@sentry/nextjs";
import LogRocket from "logrocket";
import axios from "axios";
import { initLogRocket, trackEvent, logRocketLog, logRocketInfo, logRocketWarn, logRocketError } from "./logrocket";

// Initialize LogRocket if app ID is available
if (typeof window !== "undefined") {
  initLogRocket();
}

export type LogLevel = "info" | "warn" | "error" | "log";

export interface LoggerOptions {
  logToSentry?: boolean;
  logToLogRocket?: boolean;
  logToBackend?: boolean;
  userId?: string;
  visitorId?: string;
}

const defaultOptions: LoggerOptions = {
  logToSentry: true,
  logToLogRocket: false, // Enable if LogRocket is initialized
  logToBackend: false,   // Only true for client-side logs, not for /api/logs itself
};

// Helper function to get visitor ID from localStorage
const getVisitorId = () => {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("qurieus_visitor_id");
  if (!id) {
    id = "v_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("qurieus_visitor_id", id);
  }
  return id;
};

// Helper function to get current identity context
const getIdentityContext = () => {
  if (typeof window === "undefined") return { visitorId: "", userId: undefined };
  
  const visitorId = getVisitorId();
  const userId = localStorage.getItem("qurieus_user_id");
  
  return {
    visitorId,
    userId: userId || undefined,
  };
};

// Helper function to enhance metadata with user/visitor IDs
const enhanceMeta = (meta?: any, options: LoggerOptions = {}) => {
  const enhancedMeta = { ...meta };
  
  // Get current identity context
  const identityContext = getIdentityContext();
  
  // Add visitor ID if not provided but available in browser
  if (!options.visitorId && typeof window !== "undefined") {
    enhancedMeta.visitorId = identityContext.visitorId;
  } else if (options.visitorId) {
    enhancedMeta.visitorId = options.visitorId;
  }
  
  // Add user ID if provided or available from identity context
  if (options.userId) {
    enhancedMeta.userId = options.userId;
  } else if (identityContext.userId) {
    enhancedMeta.userId = identityContext.userId;
  }
  
  // Add timestamp
  enhancedMeta.timestamp = new Date().toISOString();
  
  return enhancedMeta;
};

export const logger = {
  log: (message: string, meta?: any, options: LoggerOptions = {}) => {
    const opts = { ...defaultOptions, ...options };
    const enhancedMeta = enhanceMeta(meta, opts);
    
    if (opts.logToSentry && process.env.NEXT_PUBLIC_SENTRY_DSN) {
      try {
        Sentry.captureMessage(message, { level: "info", extra: enhancedMeta });
      } catch (error) {
        console.warn("Sentry logging failed:", error);
      }
    }
    if (opts.logToLogRocket && process.env.NEXT_PUBLIC_LOGROCKET_APP_ID) {
      logRocketLog(message, enhancedMeta);
    }
    if (opts.logToBackend) {
      try {
        axios.post("/api/logs", { level: "info", message, meta: enhancedMeta });
      } catch (error) {
        console.warn("Backend logging failed:", error);
      }
    }
    if (process.env.NODE_ENV !== "production") console.log(message, enhancedMeta);
  },
  
  info: (message: string, meta?: any, options: LoggerOptions = {}) => {
    const opts = { ...defaultOptions, ...options };
    const enhancedMeta = enhanceMeta(meta, opts);
    
    if (opts.logToSentry && process.env.NEXT_PUBLIC_SENTRY_DSN) {
      try {
        Sentry.captureMessage(message, { level: "info", extra: enhancedMeta });
      } catch (error) {
        console.warn("Sentry logging failed:", error);
      }
    }
    if (opts.logToLogRocket && process.env.NEXT_PUBLIC_LOGROCKET_APP_ID) {
      logRocketInfo(message, enhancedMeta);
    }
    if (opts.logToBackend) {
      try {
        axios.post("/api/logs", { level: "info", message, meta: enhancedMeta });
      } catch (error) {
        console.warn("Backend logging failed:", error);
      }
    }
    if (process.env.NODE_ENV !== "production") console.info(message, enhancedMeta);
  },
  
  warn: (message: string, meta?: any, options: LoggerOptions = {}) => {
    const opts = { ...defaultOptions, ...options };
    const enhancedMeta = enhanceMeta(meta, opts);
    
    if (opts.logToSentry && process.env.NEXT_PUBLIC_SENTRY_DSN) {
      try {
        Sentry.captureMessage(message, { level: "warning", extra: enhancedMeta });
      } catch (error) {
        console.warn("Sentry logging failed:", error);
      }
    }
    if (opts.logToLogRocket && process.env.NEXT_PUBLIC_LOGROCKET_APP_ID) {
      logRocketWarn(message, enhancedMeta);
    }
    if (opts.logToBackend) {
      try {
        axios.post("/api/logs", { level: "warn", message, meta: enhancedMeta });
      } catch (error) {
        console.warn("Backend logging failed:", error);
      }
    }
    if (process.env.NODE_ENV !== "production") console.warn(message, enhancedMeta);
  },
  
  error: (message: string, meta?: any, options: LoggerOptions = {}) => {
    const opts = { ...defaultOptions, ...options };
    const enhancedMeta = enhanceMeta(meta, opts);
    
    if (opts.logToSentry && process.env.NEXT_PUBLIC_SENTRY_DSN) {
      try {
        Sentry.captureMessage(message, { level: "error", extra: enhancedMeta });
      } catch (error) {
        console.warn("Sentry logging failed:", error);
      }
    }
    if (opts.logToLogRocket && process.env.NEXT_PUBLIC_LOGROCKET_APP_ID) {
      logRocketError(message, enhancedMeta);
    }
    if (opts.logToBackend) {
      try {
        axios.post("/api/logs", { level: "error", message, meta: enhancedMeta });
      } catch (error) {
        console.warn("Backend logging failed:", error);
      }
    }
    if (process.env.NODE_ENV !== "production") console.error(message, enhancedMeta);
  },
  
  captureException: (error: any, meta?: any, options: LoggerOptions = {}) => {
    const opts = { ...defaultOptions, ...options };
    const enhancedMeta = enhanceMeta(meta, opts);
    
    if (opts.logToSentry && process.env.NEXT_PUBLIC_SENTRY_DSN) {
      try {
        Sentry.captureException(error, { extra: enhancedMeta });
      } catch (sentryError) {
        console.warn("Sentry logging failed:", sentryError);
      }
    }
    if (opts.logToLogRocket && process.env.NEXT_PUBLIC_LOGROCKET_APP_ID) {
      logRocketError(error?.message || String(error), enhancedMeta);
    }
    if (opts.logToBackend) {
      try {
        axios.post("/api/logs", { level: "error", message: error?.message || String(error), meta: enhancedMeta });
      } catch (backendError) {
        console.warn("Backend logging failed:", backendError);
      }
    }
    if (process.env.NODE_ENV !== "production") console.error(error, enhancedMeta);
  },
  
  // Helper function to get current visitor ID
  getVisitorId,
  
  // Helper function to create logger with default user/visitor context
  withContext: (userId?: string, visitorId?: string) => ({
    log: (message: string, meta?: any, options: LoggerOptions = {}) => 
      logger.log(message, meta, { ...options, userId, visitorId }),
    info: (message: string, meta?: any, options: LoggerOptions = {}) => 
      logger.info(message, meta, { ...options, userId, visitorId }),
    warn: (message: string, meta?: any, options: LoggerOptions = {}) => 
      logger.warn(message, meta, { ...options, userId, visitorId }),
    error: (message: string, meta?: any, options: LoggerOptions = {}) => 
      logger.error(message, meta, { ...options, userId, visitorId }),
    captureException: (error: any, meta?: any, options: LoggerOptions = {}) => 
      logger.captureException(error, meta, { ...options, userId, visitorId }),
  }),
}; 