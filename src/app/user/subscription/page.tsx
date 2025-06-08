'use client';

import Pricing from "@/components/Pricing";
import { useState } from "react";
import AuthModal from "@/components/Auth/AuthModal";

export default function SubscriptionPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  const handleOpenAuthModal = (mode: 'signin' | 'signup' = 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark dark:text-white">Choose Your Plan</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Select a plan that best fits your needs
        </p>
      </div>

      <Pricing
        onOpenAuthModal={() => handleOpenAuthModal('signup')}
      />
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
      />
    </div>
  );
} 