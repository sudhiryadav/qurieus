"use client";

import { showToast } from "@/components/Common/Toast";
import { useSubscription } from "@/contexts/SubscriptionContext";
import axiosInstance from "@/lib/axios";
import { differenceInCalendarDays } from "date-fns";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import SubscriptionPage from "./subscription/page";
import { showUpgradeToast } from "@/components/Common/UpgradeToast";

export default function UserLayoutContent({
  children,
  isAdmin,
}: {
  children: React.ReactNode;
  isAdmin?: boolean;
}) {
  const { data: session, status: sessionStatus } = useSession();
  const { subscriptionPlan, setSubscriptionPlan } = useSubscription();
  const [isSubscriptionChecked, setIsSubscriptionChecked] = useState(false);

  useEffect(() => {
    const checkSubscription = async () => {
      // Skip subscription/trial checks for agents and admins (no limitations)
      if (!session?.user || session?.user?.role === "AGENT" || session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN") {
        setIsSubscriptionChecked(true);
        return;
      }
      
      try {
        const response = await axiosInstance.get("/api/user/subscription");
        setSubscriptionPlan(response.data?.plan ?? null);
        
        // Check for trial expiration and show toast (with daily limit)
        if (response.data?.plan?.name === "Free Trial") {
          if (response.data?.status === "active") {
            const trialEnd = new Date(response.data.currentPeriodEnd);
            const now = new Date();
            // Use calendar days so "7-day trial" shows "7 days" on signup day (differenceInDays counts full 24h periods)
            const diffDays = Math.max(0, differenceInCalendarDays(trialEnd, now));
            
            // Show banner if trial expires in 7 days or less
            if (diffDays <= 7 && diffDays > 0) {
              // Check if we've already shown the toast today
              const today = new Date().toDateString();
              const lastShownDate = localStorage.getItem('trial-toast-last-shown');
              const lastShownDays = localStorage.getItem('trial-toast-last-days');
              
              // Show toast only if:
              // 1. We haven't shown it today, OR
              // 2. The days remaining has changed (e.g., from 3 days to 1 day)
              if (lastShownDate !== today || lastShownDays !== diffDays.toString()) {
                const getMessage = () => {
                  if (diffDays <= 1) {
                    return "Your trial expires tomorrow! Upgrade now to keep your documents and insights.";
                  }
                  if (diffDays <= 3) {
                    return `Your trial expires in ${diffDays} days. Don't lose access to your documents!`;
                  }
                  return `Your trial expires in ${diffDays} days. Consider upgrading to continue using Qurieus.`;
                };
                
                showUpgradeToast(getMessage(), diffDays);
                
                // Store that we've shown the toast today
                localStorage.setItem('trial-toast-last-shown', today);
                localStorage.setItem('trial-toast-last-days', diffDays.toString());
              }
            }
          } else if (response.data?.status === "expired") {
            // For expired trials, show toast only once per day
            const today = new Date().toDateString();
            const lastShownDate = localStorage.getItem('trial-expired-toast-last-shown');
            
            if (lastShownDate !== today) {
              showUpgradeToast("Your trial has expired! Upgrade now to restore access to your documents.", 0);
              localStorage.setItem('trial-expired-toast-last-shown', today);
            }
          }
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
        showToast.error("Error checking subscription status.");
      } finally {
        setIsSubscriptionChecked(true);
      }
    };
    
    // Don't check while session is loading or if already checked
    if (sessionStatus === "loading" || isSubscriptionChecked) return;
    
    checkSubscription();
  }, [session, sessionStatus, setSubscriptionPlan, isSubscriptionChecked]);

  // Skip subscription page for admins and agents (no trial limitations)
  const isAgent = session?.user?.role === "AGENT";
  const isAdminUser = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";
  
  // Show loading state while checking subscription
  if (sessionStatus === "loading" || !isSubscriptionChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // Handle unauthenticated users
  if (sessionStatus === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to access this page.</p>
        </div>
      </div>
    );
  }
  
  // Only show subscription page if we've confirmed the user needs it (admins/agents bypass)
  if (!subscriptionPlan && !isAdmin && !isAgent && !isAdminUser) {
    return <SubscriptionPage />;
  }

  return (
    <>
      {children}
    </>
  );
} 