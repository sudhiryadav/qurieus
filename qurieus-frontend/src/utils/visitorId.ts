import React from "react";
import axiosInstance from "@/lib/axios";

// Visitor ID utility for consistent visitor tracking across the application

export const getVisitorId = (): string => {
  if (typeof window === "undefined") return "";
  
  let id = localStorage.getItem("qurieus_visitor_id");
  if (!id) {
    id = "v_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("qurieus_visitor_id", id);
  }
  return id;
};

export const setVisitorId = (id: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("qurieus_visitor_id", id);
};

export const clearVisitorId = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("qurieus_visitor_id");
};

export const generateVisitorId = (): string => {
  return "v_" + Math.random().toString(36).substr(2, 9);
};

// Link visitor ID to user ID when user logs in
export const linkVisitorToUser = async (userId: string): Promise<void> => {
  if (typeof window === "undefined") return;
  
  const visitorId = getVisitorId();
  if (!visitorId) return;

  try {
    // Store the link in localStorage for client-side access
    localStorage.setItem("qurieus_user_id", userId);
    localStorage.setItem("qurieus_visitor_user_link", JSON.stringify({
      visitorId,
      userId,
      linkedAt: new Date().toISOString()
    }));

    // Send to backend to link visitor and user
    await axiosInstance.post("/api/analytics/link-visitor", {
      visitorId,
      userId,
    });
  } catch (error) {
  }
};

// Get the current effective identity (user ID if logged in, visitor ID otherwise)
export const getCurrentIdentity = (): { id: string; type: 'visitor' | 'user' } => {
  if (typeof window === "undefined") return { id: "", type: 'visitor' };
  
  const userId = localStorage.getItem("qurieus_user_id");
  if (userId) {
    return { id: userId, type: 'user' };
  }
  
  const visitorId = getVisitorId();
  return { id: visitorId, type: 'visitor' };
};

// Get both visitor and user IDs for analytics
export const getIdentityContext = (): { visitorId: string; userId?: string } => {
  if (typeof window === "undefined") return { visitorId: "" };
  
  const visitorId = getVisitorId();
  const userId = localStorage.getItem("qurieus_user_id");
  
  return {
    visitorId,
    userId: userId || undefined,
  };
};

// Clear user ID on logout
export const clearUserLink = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("qurieus_user_id");
  localStorage.removeItem("qurieus_visitor_user_link");
};

// Hook for React components to get visitor ID
export const useVisitorId = (): string => {
  const [visitorId, setVisitorIdState] = React.useState<string>("");
  
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const id = getVisitorId();
      setVisitorIdState(id);
    }
  }, []);
  
  return visitorId;
};

// Hook for React components to get current identity
export const useIdentity = () => {
  const [identity, setIdentity] = React.useState<{ id: string; type: 'visitor' | 'user' }>({ id: "", type: 'visitor' });
  
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const currentIdentity = getCurrentIdentity();
      setIdentity(currentIdentity);
    }
  }, []);
  
  return identity;
}; 