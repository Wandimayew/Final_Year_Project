"use client";

import React, { useState, useMemo } from "react";
import { useSubscriptionPlans, useUpdateSubscriptionPlan } from "@/lib/api/tenantService/subscriptionplan"; // Adjust path if needed
import { CheckIcon, PencilIcon } from "@heroicons/react/20/solid";

export default function Package() {
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [editedFeatures, setEditedFeatures] = useState({});
  const [status, setStatus] = useState(null);

  // Fetch all subscription plans
  const { data: plans = [], isLoading, error } = useSubscriptionPlans();
  const { mutateAsync: updatePlan, isLoading: isUpdating } = useUpdateSubscriptionPlan();

  // Memoize plans to avoid unnecessary re-renders
  const memoizedPlans = useMemo(() => {
    return plans.map((plan) => {
      let features;
      if (Array.isArray(plan.features)) {
        features = plan.features;
      } else if (plan.features && typeof plan.features === "object") {
        features = Object.entries(plan.features).map(
          ([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`
        );
      } else {
        features = plan.features ? [plan.features] : ["No features specified"];
      }
      return {
        id: plan.plan_id,
        name: plan.name || "Unnamed Plan",
        price: plan.price || 0,
        billing_cycle: plan.billing_cycle || "month",
        features,
        rawFeatures: plan.features, // Store original object for editing
      };
    });
  }, [plans]);

  // Handle edit button click
  const handleEditClick = (plan) => {
    setEditingPlanId(plan.id);
    setEditedFeatures(plan.rawFeatures || { users: "", storage: "", Exam: "" });
  };

  // Handle feature input change
  const handleFeatureChange = (key, value) => {
    setEditedFeatures((prev) => ({ ...prev, [key]: value }));
  };

  // Handle save edits
  const handleSave = async (planId) => {
    try {
      await updatePlan({
        planId,
        data: { features: editedFeatures },
      });
      setStatus({ type: "success", message: "Features updated successfully!" });
      setEditingPlanId(null);
      setTimeout(() => setStatus(null), 2000);
    } catch (err) {
      setStatus({ type: "error", message: "Failed to update features." });
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    setEditingPlanId(null);
    setEditedFeatures({});
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Subscription Packages
          </h1>
          <p className="mt-3 text-xl text-gray-600">
            View and edit package features
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg mb-6">
            <p className="text-red-700">{error.message || "Failed to load plans. Please try again."}</p>
          </div>
        )}

        {/* Plans Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {memoizedPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                {/* Plan Header */}
                <div className="bg-indigo-600 text-white p-6">
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <p className="mt-2 text-3xl font-extrabold">
                    ${plan.price}
                    <span className="text-base font-normal">/{plan.billing_cycle}</span>
                  </p>
                </div>

                {/* Features Section */}
                <div className="p-6">
                  {editingPlanId === plan.id ? (
                    <div className="space-y-4">
                      {["users", "storage", "Exam"].map((key) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 capitalize">
                            {key}
                          </label>
                          <input
                            type="text"
                            value={editedFeatures[key] || ""}
                            onChange={(e) => handleFeatureChange(key, e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            disabled={isUpdating}
                          />
                        </div>
                      ))}
                      <div className="flex justify-end space-x-4">
                        <button
                          onClick={handleCancel}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800"
                          disabled={isUpdating}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSave(plan.id)}
                          className="bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:bg-gray-400"
                          disabled={isUpdating}
                        >
                          {isUpdating ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <ul className="space-y-4 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <CheckIcon className="h-6 w-6 text-indigo-500 flex-shrink-0" />
                            <span className="ml-3 text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => handleEditClick(plan)}
                        className="w-full bg-indigo-100 text-indigo-700 py-2 px-4 rounded-lg font-semibold hover:bg-indigo-200 focus:outline-none focus:ring-4 focus:ring-indigo-300 flex items-center justify-center"
                      >
                        <PencilIcon className="h-5 w-5 mr-2" />
                        Edit Features
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Status Message */}
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