"use client";

import { SubscriptionPlan } from "@prisma/client";
import { createContext, useContext, useState, ReactNode } from "react";

interface SubscriptionContextType {
  subscriptionPlan: SubscriptionPlan | null;
  setSubscriptionPlan: (plan: SubscriptionPlan | null) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan | null>(null);

  return (
    <SubscriptionContext.Provider value={{ subscriptionPlan, setSubscriptionPlan }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}; 