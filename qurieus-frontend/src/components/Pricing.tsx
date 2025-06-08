'use client';

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  isActive: boolean;
  maxDocs?: number | null;
  maxStorageMB?: number | null;
  maxQueriesPerDay?: number | null;
  idealFor?: string;
  keyLimits?: string;
};

type PricingProps = {
  plans?: SubscriptionPlan[];
  handleSubscription?: (planId: string) => Promise<{ success: boolean; subscription?: any; error?: string }>;
  isAuthenticated?: boolean;
};

export default function Pricing({ plans, handleSubscription, isAuthenticated }: PricingProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    setLoading(planId);
    setError(null);
    
    try {
      if (!isAuthenticated) {
        router.push(`/login?callbackUrl=/pricing`);
        return;
      }

      const result = await handleSubscription?.(planId);
      
      if (result?.success && result?.subscription) {
        window.location.href = result.subscription.short_url;
      } else {
        setError(result?.error || "Failed to create subscription");
      }
    } catch (error) {
      setError("An error occurred while processing your request");
      console.error("Error:", error);
    } finally {
      setLoading(null);
    }
  };

  // Separate enterprise plan
  const nonEnterprisePlans = plans?.filter((plan) => plan.name.toLowerCase() !== "enterprise");
  const enterprisePlan = plans?.find((plan) => plan.name.toLowerCase() === "enterprise");

  return (
    <section
      id="about"
      className="bg-gray-1 pb-8 dark:bg-dark-2 lg:pb-[70px] lg:pt-[120px]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mx-auto mt-4 max-w-2xl text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        <div className="isolate mx-auto mt-12 grid max-w-md grid-cols-1 gap-8 md:max-w-2xl md:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-4">
          {nonEnterprisePlans?.map((plan: SubscriptionPlan) => (
            <div
              key={plan.name}
              className={`flex flex-col justify-between rounded-3xl bg-white dark:bg-dark-3 p-6 shadow-md ring-1 ring-gray-200 dark:ring-dark-3 transition-transform duration-300 hover:shadow-lg hover:transform hover:scale-105 sm:p-8`}
            >
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3
                    className={`text-lg font-semibold leading-8 text-gray-900 dark:text-white`}
                  >
                    {plan.name}
                    <span className="mt-4 ml-4 text-sm leading-6 text-gray-600 dark:text-gray-300">{plan.description}</span>
                  </h3>
                  {plan.name === 'Standard' && (
                    <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-600">
                      Popular
                    </span>
                  )}
                </div>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {plan.currency} {plan.price}
                  </span>
                  <span className="text-sm font-semibold leading-6 text-gray-600 dark:text-gray-300">/ month</span>
                </p>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {plan.features.map((feature: string) => (
                    <li key={feature} className="flex gap-x-3">
                      <Check
                        className="h-6 w-5 flex-none text-indigo-600 dark:text-indigo-400"
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                  {plan.idealFor && (
                    <li className="flex gap-x-3">
                      <Check className="h-6 w-5 flex-none text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                      <span><b>Ideal For:</b> {plan.idealFor}</span>
                    </li>
                  )}
                  {plan.keyLimits && (
                    <li className="flex gap-x-3">
                      <Check className="h-6 w-5 flex-none text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                      <span><b>Key Limits:</b> {plan.keyLimits}</span>
                    </li>
                  )}
                  {typeof plan.maxDocs !== 'undefined' && plan.maxDocs !== null && (
                    <li className="flex gap-x-3">
                      <Check className="h-6 w-5 flex-none text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                      <span><b>Max Docs:</b> {plan.maxDocs}</span>
                    </li>
                  )}
                  {typeof plan.maxStorageMB !== 'undefined' && plan.maxStorageMB !== null && (
                    <li className="flex gap-x-3">
                      <Check className="h-6 w-5 flex-none text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                      <span><b>Max Storage:</b> {plan.maxStorageMB} MB</span>
                    </li>
                  )}
                  {typeof plan.maxQueriesPerDay !== 'undefined' && plan.maxQueriesPerDay !== null && (
                    <li className="flex gap-x-3">
                      <Check className="h-6 w-5 flex-none text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                      <span><b>Max Queries/Day:</b> {plan.maxQueriesPerDay}</span>
                    </li>
                  )}
                </ul>
              </div>
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading === plan.id}
                className={`mt-8 block w-full rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                  bg-indigo-50 text-indigo-600 hover:bg-indigo-100 focus-visible:outline-indigo-600 dark:bg-indigo-700 dark:text-white dark:hover:bg-indigo-600
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === plan.id ? (
                  "Processing..."
                ) : isAuthenticated ? (
                  "Get started today"
                ) : (
                  "Sign in to subscribe"
                )}
              </button>
            </div>
          ))}
        </div>
        {/* Enterprise Plan Section */}
        {enterprisePlan && (
          <div className="mt-16 rounded-3xl bg-gradient-to-r from-indigo-600 to-indigo-800 p-8 text-white shadow-lg flex flex-col items-center">
            <h3 className="text-2xl font-bold mb-2">{enterprisePlan.name}</h3>
            <p className="mb-4 text-lg">{enterprisePlan.description || "Custom solutions for large organizations."}</p>
            <ul className="mb-6 space-y-2 text-base">
              {enterprisePlan.features.map((feature: string) => (
                <li key={feature} className="flex gap-x-3 items-center">
                  <Check className="h-6 w-5 flex-none text-white" aria-hidden="true" />
                  {feature}
                </li>
              ))}
              {enterprisePlan.idealFor && (
                <li className="flex gap-x-3 items-center">
                  <Check className="h-6 w-5 flex-none text-white" aria-hidden="true" />
                  <span><b>Ideal For:</b> {enterprisePlan.idealFor}</span>
                </li>
              )}
              {enterprisePlan.keyLimits && (
                <li className="flex gap-x-3 items-center">
                  <Check className="h-6 w-5 flex-none text-white" aria-hidden="true" />
                  <span><b>Key Limits:</b> {enterprisePlan.keyLimits}</span>
                </li>
              )}
            </ul>
            <button
              onClick={() => router.push('/contact')}
              className="rounded-md bg-white px-6 py-2 text-indigo-700 font-semibold hover:bg-indigo-50 transition-colors"
            >
              Contact Us
            </button>
          </div>
        )}
      </div>
    </section>
  );
} 