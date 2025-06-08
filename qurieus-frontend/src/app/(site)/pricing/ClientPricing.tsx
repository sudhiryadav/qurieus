"use client";
import React, { useState } from "react";
import Pricing from "@/components/Pricing";
import AuthModal from "@/components/Auth/AuthModal";

type ClientPricingProps = {
  plans: any[];
  handleSubscription: (planId: string) => Promise<{ success: boolean; subscription?: any; error?: string }>;
  isAuthenticated: boolean;
};

export default function ClientPricing({ plans, handleSubscription, isAuthenticated }: ClientPricingProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <>
      <Pricing 
        plans={plans} 
        handleSubscription={handleSubscription} 
        isAuthenticated={isAuthenticated}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />
      <AuthModal isOpen={isAuthModalOpen} mode="signup" onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
} 