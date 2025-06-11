"use client";

import { Check } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import AuthModal from "@/components/Auth/AuthModal";
import { PaddleCheckout, PaddleCheckoutRef } from "@/components/PaddleCheckout";
import { SubscriptionPlanWithPaddle } from "@/app/(site)/pricing/page";
import { CheckoutEventError, CheckoutEventsData } from "@paddle/paddle-js";
import axios from "@/lib/axios";

export default function Pricing() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");
  const [selectedPlan, setSelectedPlan] =
    useState<SubscriptionPlanWithPaddle | null>(null);
  const paddleRef = useRef<PaddleCheckoutRef>(null);
  const [plans, setPlans] = useState<SubscriptionPlanWithPaddle[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);

  useEffect(() => {
    //Get the plans
    const fetchPlans = async () => {
      const { data } = await axios.get("/api/subscription/plans");
      setPlans(data);
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    // Get current subscription
    const fetchCurrentSubscription = async () => {
      if (session) {
        const { data } = await axios.get("/api/subscription/check");
        setCurrentPlanId(data.currentPlanId);
      }
    };
    fetchCurrentSubscription();
  }, [session]);

  const startSubscriptionProcess = () => {
    if (selectedPlan?.paddleConfig?.priceId && paddleRef.current) {
      paddleRef.current.openCheckout(selectedPlan.paddleConfig.priceId);
    } else {
      toast.error(
        "Subscription configuration is incomplete. Please contact support.",
      );
    }
  };

  const handlePaddleComplete = async (data: CheckoutEventsData | undefined): Promise<void> => {
    console.log("Paddle complete", data);
    // Call the subscription creation API
    try {
      await axios.post("/api/subscription/create", {
        paddleSubscriptionId: data?.id,
        paddleCustomerId: data?.customer.id,
        planId: selectedPlan?.id,
        status: "active",
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      });
      toast.success("Subscription created successfully");
    } catch (error) {
      toast.error("Failed to create subscription");
    }
  };
  const handlePaddleClose = (data: CheckoutEventsData | undefined) => {
    console.log("Paddle close", data);
  };
  const handlePaddleError = (data: CheckoutEventError | undefined) => {
    console.log("Paddle error", data);
  };
  const handlePaddleFailed = (data: CheckoutEventsData | undefined) => {
    console.log("Paddle failed", data);
  };

  const handleSubscribe = async (plan: SubscriptionPlanWithPaddle) => {
    setLoading(plan.id);
    setError(null);
    setSelectedPlan(plan);
    try {
      if (!session) {
        setAuthMode("signup");
        setAuthModalOpen(true);
        return;
      }
      if (plan.paddleConfig?.priceId && paddleRef.current) {
        paddleRef.current.openCheckout(plan.paddleConfig.priceId);
        return;
      }
    } catch (error) {
      toast.error("An error occurred while processing your request");
    } finally {
      setLoading(null);
    }
  };

  // Separate enterprise plan
  const nonEnterprisePlans = plans?.filter(
    (plan) => plan.name.toLowerCase() !== "enterprise",
  );
  const enterprisePlan = plans?.find(
    (plan) => plan.name.toLowerCase() === "enterprise",
  );

  const getButtonText = (plan: SubscriptionPlanWithPaddle) => {
    if (!session) return "Sign in to subscribe";
    if (loading === plan.id) return "Processing...";
    if (plan.id === currentPlanId) return "Subscribed";
    if (currentPlanId) return "Upgrade";
    return "Get started today";
  };

  const isButtonDisabled = (plan: SubscriptionPlanWithPaddle) => {
    return loading === plan.id || plan.id === currentPlanId;
  };

  return (
    <section
      id="about"
      className="bg-gray-1 pb-8 pt-8 dark:bg-dark-2 lg:pb-[70px] lg:pt-16"
    >
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onSuccess={startSubscriptionProcess}
      />
      {selectedPlan && (
        <PaddleCheckout
          ref={paddleRef}
          mode="overlay"
          onComplete={handlePaddleComplete}
          onClose={handlePaddleClose}
          onError={handlePaddleError}
          onFailed={handlePaddleFailed}
        />
      )}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mx-auto mt-4 max-w-2xl text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        <div className="isolate mx-auto grid max-w-md grid-cols-1 gap-8 md:max-w-2xl md:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-4">
          {nonEnterprisePlans?.map((plan: SubscriptionPlanWithPaddle) => (
            <div
              key={plan.name}
              className={`flex flex-col justify-between rounded-3xl bg-white p-6 shadow-md ring-1 ring-gray-200 transition-transform duration-300 hover:scale-105 hover:transform hover:shadow-lg dark:bg-dark-3 dark:ring-dark-3 sm:p-8`}
            >
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3
                    className={`text-lg font-semibold leading-8 text-gray-900 dark:text-white`}
                  >
                    {plan.name}
                    <span className="ml-4 mt-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
                      {plan.description}
                    </span>
                  </h3>
                  {plan.name === "Standard" && (
                    <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-600">
                      Popular
                    </span>
                  )}
                </div>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                    <span className="pr-1 text-sm font-semibold leading-6 text-gray-600 dark:text-gray-300">
                      {plan.currency}
                    </span>
                    {plan.price}
                  </span>
                  <span className="text-sm font-semibold leading-6 text-gray-600 dark:text-gray-300">
                    / month
                  </span>
                </p>
                <ul
                  role="list"
                  className="mt-8 space-y-3 text-sm leading-6 text-gray-600 dark:text-gray-300"
                >
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
                      <Check
                        className="h-6 w-5 flex-none text-indigo-600 dark:text-indigo-400"
                        aria-hidden="true"
                      />
                      <span>
                        <b>Ideal For:</b> {plan.idealFor}
                      </span>
                    </li>
                  )}
                  {plan.keyLimits && (
                    <li className="flex gap-x-3">
                      <Check
                        className="h-6 w-5 flex-none text-indigo-600 dark:text-indigo-400"
                        aria-hidden="true"
                      />
                      <span>
                        <b>Key Limits:</b> {plan.keyLimits}
                      </span>
                    </li>
                  )}
                  {typeof plan.maxDocs !== "undefined" &&
                    plan.maxDocs !== null && (
                      <li className="flex gap-x-3">
                        <Check
                          className="h-6 w-5 flex-none text-indigo-600 dark:text-indigo-400"
                          aria-hidden="true"
                        />
                        <span>
                          <b>Max Docs:</b> {plan.maxDocs}
                        </span>
                      </li>
                    )}
                  {typeof plan.maxStorageMB !== "undefined" &&
                    plan.maxStorageMB !== null && (
                      <li className="flex gap-x-3">
                        <Check
                          className="h-6 w-5 flex-none text-indigo-600 dark:text-indigo-400"
                          aria-hidden="true"
                        />
                        <span>
                          <b>Max Storage:</b> {plan.maxStorageMB} MB
                        </span>
                      </li>
                    )}
                  {typeof plan.maxQueriesPerDay !== "undefined" &&
                    plan.maxQueriesPerDay !== null && (
                      <li className="flex gap-x-3">
                        <Check
                          className="h-6 w-5 flex-none text-indigo-600 dark:text-indigo-400"
                          aria-hidden="true"
                        />
                        <span>
                          <b>Max Queries/Day:</b> {plan.maxQueriesPerDay}
                        </span>
                      </li>
                    )}
                </ul>
              </div>
              <button
                onClick={() => handleSubscribe(plan)}
                disabled={isButtonDisabled(plan)}
                className={`mt-8 block w-full rounded-md bg-indigo-50 px-3 py-2 text-center text-sm font-semibold leading-6 text-indigo-600 hover:bg-indigo-100
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-700
                  dark:text-white dark:hover:bg-indigo-600`}
              >
                {getButtonText(plan)}
              </button>
            </div>
          ))}
        </div>
        {/* Enterprise Plan Section */}
        {enterprisePlan && (
          <div className="mt-16 flex flex-col items-center rounded-3xl bg-gradient-to-r from-indigo-600 to-indigo-800 p-8 text-white shadow-lg">
            <h3 className="mb-2 text-2xl font-bold">{enterprisePlan.name}</h3>
            <p className="mb-4 text-lg">
              {enterprisePlan.description ||
                "Custom solutions for large organizations."}
            </p>
            <ul className="mb-6 space-y-2 text-base">
              {enterprisePlan.features.map((feature: string) => (
                <li key={feature} className="flex items-center gap-x-3">
                  <Check
                    className="h-6 w-5 flex-none text-white"
                    aria-hidden="true"
                  />
                  {feature}
                </li>
              ))}
              {enterprisePlan.idealFor && (
                <li className="flex items-center gap-x-3">
                  <Check
                    className="h-6 w-5 flex-none text-white"
                    aria-hidden="true"
                  />
                  <span>
                    <b>Ideal For:</b> {enterprisePlan.idealFor}
                  </span>
                </li>
              )}
              {enterprisePlan.keyLimits && (
                <li className="flex items-center gap-x-3">
                  <Check
                    className="h-6 w-5 flex-none text-white"
                    aria-hidden="true"
                  />
                  <span>
                    <b>Key Limits:</b> {enterprisePlan.keyLimits}
                  </span>
                </li>
              )}
            </ul>
            <button
              onClick={() => router.push("/contact")}
              className="rounded-md bg-white px-6 py-2 font-semibold text-indigo-700 transition-colors hover:bg-indigo-50"
            >
              Contact Us
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
