import * as Sentry from "@sentry/nextjs";
import LogRocket from "logrocket";
import axios from "axios";

export type LogLevel = "info" | "warn" | "error" | "log";

export interface LoggerOptions {
  logToSentry?: boolean;
  logToLogRocket?: boolean;
  logToBackend?: boolean;
}

const defaultOptions: LoggerOptions = {
  logToSentry: true,
  logToLogRocket: false, // Enable if LogRocket is initialized
  logToBackend: false,   // Only true for client-side logs, not for /api/logs itself
};

export const logger = {
  log: (message: string, meta?: any, options: LoggerOptions = {}) => {
    const opts = { ...defaultOptions, ...options };
    if (opts.logToSentry) Sentry.captureMessage(message, { level: "info", extra: meta });
    if (opts.logToLogRocket) LogRocket.log(message, meta);
    if (opts.logToBackend) axios.post("/api/logs", { level: "info", message, meta });
    if (process.env.NODE_ENV !== "production") console.log(message, meta);
  },
  info: (message: string, meta?: any, options: LoggerOptions = {}) => {
    const opts = { ...defaultOptions, ...options };
    if (opts.logToSentry) Sentry.captureMessage(message, { level: "info", extra: meta });
    if (opts.logToLogRocket) LogRocket.info(message, meta);
    if (opts.logToBackend) axios.post("/api/logs", { level: "info", message, meta });
    if (process.env.NODE_ENV !== "production") console.info(message, meta);
  },
  warn: (message: string, meta?: any, options: LoggerOptions = {}) => {
    const opts = { ...defaultOptions, ...options };
    if (opts.logToSentry) Sentry.captureMessage(message, { level: "warning", extra: meta });
    if (opts.logToLogRocket) LogRocket.warn(message, meta);
    if (opts.logToBackend) axios.post("/api/logs", { level: "warn", message, meta });
    if (process.env.NODE_ENV !== "production") console.warn(message, meta);
  },
  error: (message: string, meta?: any, options: LoggerOptions = {}) => {
    const opts = { ...defaultOptions, ...options };
    if (opts.logToSentry) Sentry.captureMessage(message, { level: "error", extra: meta });
    if (opts.logToLogRocket) LogRocket.error(message, meta);
    if (opts.logToBackend) axios.post("/api/logs", { level: "error", message, meta });
    if (process.env.NODE_ENV !== "production") console.error(message, meta);
  },
  captureException: (error: any, meta?: any, options: LoggerOptions = {}) => {
    const opts = { ...defaultOptions, ...options };
    if (opts.logToSentry) Sentry.captureException(error, { extra: meta });
    if (opts.logToLogRocket) LogRocket.error(error, meta);
    if (opts.logToBackend) axios.post("/api/logs", { level: "error", message: error?.message || String(error), meta });
    if (process.env.NODE_ENV !== "production") console.error(error, meta);
  },
}; 