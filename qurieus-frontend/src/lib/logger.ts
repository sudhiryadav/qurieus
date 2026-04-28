export type LogLevel = "info" | "warn" | "error" | "log";

export interface LoggerOptions {
  logToSentry?: boolean;
  logToLogRocket?: boolean;
  logToBackend?: boolean;
  userId?: string;
  visitorId?: string;
}

const getVisitorId = () => {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("qurieus_visitor_id");
  if (!id) {
    id = "v_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("qurieus_visitor_id", id);
  }
  return id;
};

const getIdentityContext = () => {
  if (typeof window === "undefined") return { visitorId: "", userId: undefined };
  
  const visitorId = getVisitorId();
  const userId = localStorage.getItem("qurieus_user_id");
  
  return {
    visitorId,
    userId: userId || undefined,
  };
};

export const logger = {
  log: (_message: string, _meta?: any, _options: LoggerOptions = {}) => {},
  info: (_message: string, _meta?: any, _options: LoggerOptions = {}) => {},
  warn: (_message: string, _meta?: any, _options: LoggerOptions = {}) => {},
  error: (_message: string, _meta?: any, _options: LoggerOptions = {}) => {},
  captureException: (_error: any, _meta?: any, _options: LoggerOptions = {}) => {},
  getVisitorId,
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