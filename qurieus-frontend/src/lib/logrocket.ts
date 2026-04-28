import LogRocket from "logrocket";

// Initialize LogRocket
export const initLogRocket = () => {
  const appId = process.env.NEXT_PUBLIC_LOGROCKET_APP_ID;
  
  if (!appId) {
    return;
  }

  try {
    LogRocket.init(appId);
    
    // LogRocket Redux middleware will be added in the store configuration
    // This ensures all Redux actions and state changes are automatically tracked
    
    // Integrate with Sentry for session linking
    if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_SENTRY_DSN) {
      LogRocket.getSessionURL(sessionURL => {
        // Add session URL to global scope for Sentry to pick up
        if (typeof window !== "undefined") {
          (window as any).__LOGROCKET_SESSION_URL__ = sessionURL;
        }
      });
    }
    
  } catch (error) {
  }
};

// Helper to identify user in LogRocket
export const identifyUser = (userId: string, userInfo?: { name?: string; email?: string }) => {
  try {
    LogRocket.identify(userId, userInfo);
  } catch (error) {
  }
};

// Enhanced identity management that works with both visitor and user IDs
export const identifyIdentity = (visitorId: string, userId?: string, userInfo?: { name?: string; email?: string }) => {
  try {
    if (userId) {
      // User is authenticated - use user ID as primary identity
      const identityInfo: { name?: string; email?: string } = {
        name: userInfo?.name || 'Authenticated User'
      };
      
      // Only add email if it exists
      if (userInfo?.email) {
        identityInfo.email = userInfo.email;
      }
      
      // Force LogRocket to use user ID as the primary identity
      LogRocket.identify(userId, identityInfo);
      
      // Also set visitor ID as a custom property for tracking
      if (typeof window !== "undefined") {
        // Store visitor ID in a way that LogRocket can access
        (window as any).__LOGROCKET_VISITOR_ID__ = visitorId;
      }
    } else {
      // Anonymous visitor - use visitor ID as identity
      LogRocket.identify(visitorId, {
        name: 'Anonymous Visitor'
      });
    }
  } catch (error) {
  }
};

// Get current LogRocket session URL (useful for debugging)
export const getCurrentSessionURL = (): Promise<string | null> => {
  return new Promise((resolve) => {
    try {
      LogRocket.getSessionURL((sessionURL) => {
        resolve(sessionURL);
      });
    } catch (error) {
      resolve(null);
    }
  });
};

// Helper to track events in LogRocket
export const trackEvent = (eventName: string, properties?: any) => {
  try {
    LogRocket.track(eventName, properties);
  } catch (error) {
  }
};

// Helper to log different levels in LogRocket
export const logRocketLog = (message: string, meta?: any) => {
  try {
    LogRocket.log(message, meta);
  } catch (error) {
  }
};

export const logRocketInfo = (message: string, meta?: any) => {
  try {
    LogRocket.info(message, meta);
  } catch (error) {
  }
};

export const logRocketWarn = (message: string, meta?: any) => {
  try {
    LogRocket.warn(message, meta);
  } catch (error) {
  }
};

export const logRocketError = (message: string, meta?: any) => {
  try {
    LogRocket.error(message, meta);
  } catch (error) {
  }
}; 