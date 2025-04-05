"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSubscriptionPlans } from "@/lib/api/tenantService/subscriptionplan";
import { useAuthStore } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ChevronLeftIcon,
  PlusIcon,
  CheckIcon,
} from "@heroicons/react/20/solid";

const SubscriptionPlansList = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Memoize auth data to prevent re-renders
  const authData = useMemo(() => {
    return useAuthStore.getState();
  }, []);

  const { token } = authData;
  const roles = authData.user?.roles || [];
  const isSuperAdmin = roles.includes("ROLE_SUPERADMIN");

  // Fetch subscription plans
  const { data: plans = [], isLoading, error } = useSubscriptionPlans();

  // Hydration and auth check
  useEffect(() => {
    setIsMounted(true);
    if (!token && isMounted) {
      toast.error("Please login to view subscription plans");
      setTimeout(() => router.push("/login"), 2000);
    }
    return () => {
      setIsMounted(false);
    };
  }, [token, router, isMounted]);

  // Memoize transformed plans for rendering
  const memoizedPlans = useMemo(() => {
    return plans.map((plan) => ({
      id: plan.plan_id,
      name: plan.name || "Unnamed Plan",
      price: plan.price || 0,
      billing_cycle: plan.billing_cycle || "month",
      features:
        plan.features && typeof plan.features === "object"
          ? Object.entries(plan.features).map(
              ([key, value]) => `${key}: ${value}`
            )
          : ["No features specified"],
      isActive: plan.active || false, // Assuming 'active' field exists; adjust if it's 'isActive'
    }));
  }, [plans]);

  if (!isMounted || !token) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
          <div className="flex items-center mb-4 sm:mb-0">
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <ChevronLeftIcon className="w-5 h-5 mr-2" />
              Back to Dashboard
            </button>
            <h1 className="ml-4 text-3xl font-bold text-gray-900">
              Subscription Plans
            </h1>
          </div>
          {isSuperAdmin && (
            <button
              onClick={() => router.push("/subscription/create")}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add New Plan
            </button>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg mb-8">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-red-400 mr-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-red-700">
                {error.message || "Failed to load plans. Please try again."}
              </p>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {memoizedPlans.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-600">
                No subscription plans found.{" "}
                {isSuperAdmin && "Click 'Add New Plan' to create one."}
              </div>
            ) : (
              memoizedPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer"
                  onClick={() =>
                    router.push(`/subscription/details/${plan.id}`)
                  }
                >
                  {/* Card Header */}
                  <div className="bg-indigo-600 text-white p-6">
                    <h2 className="text-xl font-semibold">{plan.name}</h2>
                    <p className="mt-2 text-3xl font-bold">
                      ${plan.price}
                      <span className="text-sm font-normal">
                        {" "}
                        /{plan.billing_cycle}
                      </span>
                    </p>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <CheckIcon className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-1" />
                          <span className="ml-2 text-gray-600 text-sm">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        plan.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {plan.isActive ? "Active" : "Inactive"}
                    </span>
                    <button
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click from triggering
                        router.push(`/subscription/details/${plan.id}`);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Toast Notifications */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </div>
  );
};

export default SubscriptionPlansList;
