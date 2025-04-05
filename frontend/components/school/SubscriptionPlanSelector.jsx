"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useUpdateSchoolSubscription } from "@/lib/api/tenantService/schoolsubscription";
import { useSubscriptionPlans } from "@/lib/api/tenantService/subscriptionplan";
import { CheckIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

export default function SubscriptionPlanSelector() {
  const [schoolId, setSchoolId] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [status, setStatus] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { getSchoolId } = useAuthStore();
  const router = useRouter();
  const { data: plans = [], isLoading, error } = useSubscriptionPlans();
  const { mutateAsync: updateSubscription } = useUpdateSchoolSubscription();

  useEffect(() => {
    const id = getSchoolId();
    setSchoolId(id);
    setIsHydrated(true);
    if (!id) router.push("/login");
  }, [getSchoolId, router]);

  const getPlanColor = (name) => {
    const colors = {
      Wandi: "indigo", // Adjusted for your "Wandi" plan
      Basic: "blue",
      Pro: "purple",
      Premium: "indigo",
    };
    return colors[name.split(" ")[0]] || "gray";
  };

  const memoizedPlans = useMemo(() => {
    return plans.map((plan) => {
      let features;
      if (Array.isArray(plan.features)) {
        features = plan.features;
      } else if (plan.features && typeof plan.features === "object") {
        // Convert object to array of key-value pairs, matching your data
        features = Object.entries(plan.features).map(
          ([key, value]) =>
            `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`
        );
      } else {
        features = plan.features ? [plan.features] : ["No features specified"];
      }

      return {
        id: plan.plan_id,
        name: plan.name || "Unnamed Plan",
        price: plan.price || 0,
        duration: plan.billing_cycle || "month", // Updated to match your API
        features,
        color: getPlanColor(plan.name),
      };
    });
  }, [plans]);

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowConfirmation(true);
  };

  const confirmSelection = async () => {
    setIsSelecting(true);
    setStatus(null);

    try {
      await updateSubscription({
        schoolId,
        subscriptionId: null,
        subscriptionData: {
          planId: selectedPlan.id,
          status: "pending",
          selectedAt: new Date().toISOString(),
        },
      });
      setStatus({
        type: "success",
        message: `Successfully selected ${selectedPlan.name}! Please proceed to payment.`,
      });
      setTimeout(() => {
        router.push(`/payment?planId=${selectedPlan.id}&schoolId=${schoolId}`);
      }, 2000);
    } catch (err) {
      setStatus({
        type: "error",
        message: "Failed to select plan. Please try again.",
      });
      setShowConfirmation(false);
    } finally {
      setIsSelecting(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-500"></div>
      </div>
    );
  }

  if (!schoolId) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Choose Your Subscription Plan
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            School ID: {schoolId} | Select a plan that best fits your needs
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <p className="text-red-700">
              Failed to load plans. Please refresh or contact support.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {memoizedPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 ${
                  selectedPlan?.id === plan.id ? "ring-4 ring-indigo-500" : ""
                }`}
              >
                <div className={`bg-${plan.color}-600 text-white p-6`}>
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <p className="mt-2 text-4xl font-extrabold">
                    ${plan.price}
                    <span className="text-base font-normal">
                      /{plan.duration}
                    </span>
                  </p>
                </div>
                <div className="p-6">
                  <ul className="space-y-4">
                    {Array.isArray(plan.features) &&
                    plan.features.length > 0 ? (
                      plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <CheckIcon
                            className={`h-6 w-6 text-${plan.color}-500 flex-shrink-0`}
                          />
                          <span className="ml-3 text-gray-600">{feature}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-600">No features specified</li>
                    )}
                  </ul>
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isSelecting}
                    className={`mt-6 w-full bg-${
                      plan.color
                    }-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-${
                      plan.color
                    }-700 focus:outline-none focus:ring-4 focus:ring-${
                      plan.color
                    }-300 transition-colors duration-200 ${
                      isSelecting ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isSelecting && selectedPlan?.id === plan.id
                      ? "Processing..."
                      : "Choose Plan"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showConfirmation && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Confirm Your Selection
              </h3>
              <p className="text-gray-600 mb-6">
                You’ve selected the{" "}
                <span className="font-semibold">{selectedPlan?.name}</span> plan
                for ${selectedPlan?.price}/{selectedPlan?.duration}. Proceed to
                payment?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSelection}
                  disabled={isSelecting}
                  className="bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 flex items-center"
                >
                  {isSelecting ? "Processing..." : "Confirm"}
                  {!isSelecting && (
                    <ChevronRightIcon className="h-5 w-5 ml-2" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {status && (
          <div
            className={`mt-8 p-4 rounded-lg text-center ${
              status.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
}
