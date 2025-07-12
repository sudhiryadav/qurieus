import { logger } from "@/lib/logger";
import { getIdentityContext } from "@/utils/visitorId";
import { identifyIdentity } from "@/lib/logrocket";

// Helper to create a logger with identity context for UI components
export const createUILogger = (userId?: string) => {
  const identityContext = getIdentityContext();
  
  // Always identify in LogRocket - use user ID if available, otherwise use visitor ID
  if (typeof window !== "undefined") {
    identifyIdentity(identityContext.visitorId, userId || identityContext.userId, {
      name: userId || identityContext.userId ? 'Authenticated User' : 'Anonymous Visitor'
    });
  }
  
  return {
    info: (message: string, meta?: any) => 
      logger.info(message, meta, { 
        userId: userId || identityContext.userId, 
        visitorId: identityContext.visitorId, 
        logToBackend: true, 
        logToLogRocket: true 
      }),
    warn: (message: string, meta?: any) => 
      logger.warn(message, meta, { 
        userId: userId || identityContext.userId, 
        visitorId: identityContext.visitorId, 
        logToBackend: true, 
        logToLogRocket: true 
      }),
    error: (message: string, meta?: any) => 
      logger.error(message, meta, { 
        userId: userId || identityContext.userId, 
        visitorId: identityContext.visitorId, 
        logToBackend: true, 
        logToLogRocket: true 
      }),
    captureException: (error: any, meta?: any) => 
      logger.captureException(error, meta, { 
        userId: userId || identityContext.userId, 
        visitorId: identityContext.visitorId, 
        logToBackend: true, 
        logToLogRocket: true 
      }),
  };
};

// Helper to log user actions in UI components
export const logUserAction = (
  action: string, 
  details: any = {}, 
  userId?: string
) => {
  const identityContext = getIdentityContext();
  logger.info(`UI Action: ${action}`, {
    ...details,
    action,
    component: details.component || 'unknown',
  }, { 
    userId: userId || identityContext.userId, 
    visitorId: identityContext.visitorId, 
    logToBackend: true 
  });
};

// Helper to log form submissions
export const logFormSubmission = (
  formName: string,
  success: boolean,
  details: any = {},
  userId?: string
) => {
  const identityContext = getIdentityContext();
  const level = success ? 'info' : 'error';
  
  logger[level](`Form Submission: ${formName}`, {
    ...details,
    formName,
    success,
  }, { 
    userId: userId || identityContext.userId, 
    visitorId: identityContext.visitorId, 
    logToBackend: true 
  });
};

// Helper to log navigation/page views
export const logPageView = (
  page: string,
  details: any = {},
  userId?: string
) => {
  const identityContext = getIdentityContext();
  logger.info(`Page View: ${page}`, {
    ...details,
    page,
  }, { 
    userId: userId || identityContext.userId, 
    visitorId: identityContext.visitorId, 
    logToBackend: true 
  });
};

// Helper to log errors in UI components
export const logUIError = (
  error: any,
  context: string,
  details: any = {},
  userId?: string
) => {
  const identityContext = getIdentityContext();
  logger.captureException(error, {
    ...details,
    context,
    errorType: 'ui_error',
  }, { 
    userId: userId || identityContext.userId, 
    visitorId: identityContext.visitorId, 
    logToBackend: true 
  });
}; 