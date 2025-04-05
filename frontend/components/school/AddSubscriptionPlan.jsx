"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useCreateSubscriptionPlan } from "@/lib/api/tenantService/subscriptionplan";
import { useAuthStore } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ChevronLeftIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";

const AddSubscriptionPlan = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Memoize auth data to prevent re-renders
  const authData = useMemo(() => {
    const state = useAuthStore.getState();
    return {
      token: state.token,
      username: state.user?.username, // Assuming username is available in auth store
    };
  }, []);

  const { token, username } = authData;

  // Form state with dynamic features
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    billing_cycle: "monthly",
    features: [{ key: "", value: "" }],
  });

  // Error state
  const [errors, setErrors] = useState({});

  // Hook for creating plan
  const createPlanMutation = useCreateSubscriptionPlan();

  // Hydration and auth check
  useEffect(() => {
    setIsMounted(true);
    if (!token && isMounted) {
      toast.error("Please login to continue");
      setTimeout(() => router.push("/login"), 2000);
    }
  }, [token, router, isMounted]);

  // Handle input changes for basic fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle feature field changes
  const handleFeatureChange = (index, field, value) => {
    setFormData((prev) => {
      const newFeatures = [...prev.features];
      newFeatures[index] = {
        ...newFeatures[index],
        [field]: value,
      };
      return { ...prev, features: newFeatures };
    });
  };

  // Add new feature field
  const addFeatureField = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, { key: "", value: "" }],
    }));
  };

  // Remove feature field
  const removeFeatureField = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Plan name is required";
    if (
      !formData.price ||
      isNaN(formData.price) ||
      Number(formData.price) <= 0
    ) {
      newErrors.price = "Valid price is required";
    }

    const featureErrors = {};
    formData.features.forEach((feature, index) => {
      if (!feature.key.trim()) {
        featureErrors[`featureKey${index}`] = "Feature name is required";
      }
      if (!feature.value.trim()) {
        featureErrors[`featureValue${index}`] = "Feature value is required";
      }
    });

    setErrors({ ...newErrors, ...featureErrors });
    return Object.keys({ ...newErrors, ...featureErrors }).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    // Convert features array to object for API
    const featuresObject = formData.features.reduce((acc, feature) => {
      acc[feature.key.toLowerCase()] = feature.value; // Lowercase keys for consistency
      return acc;
    }, {});

    const submissionData = {
      ...formData,
      features: featuresObject,
      created_by: username, // Add created_by field
    };

    createPlanMutation.mutate(submissionData, {
      onSuccess: () => {
        toast.success("Subscription plan created successfully!");
        setFormData({
          name: "",
          price: "",
          billing_cycle: "monthly",
          features: [{ key: "", value: "" }],
        });
        setErrors({});
        setTimeout(() => router.push("/subscription"), 1500);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create subscription plan");
        setErrors({ submit: error.message });
      },
    });
  };

  if (!isMounted || !token) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/subscription")}
            className="inline-flex items-center px-4 py-2 bg-white text-indigo-600 text-sm font-medium rounded-lg shadow-sm hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
          >
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Back to Plans
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Add New Plan</h1>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="bg-indigo-600 text-white p-4 rounded-t-lg">
            <h2 className="text-xl font-semibold">Create Subscription Plan</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-4">
            {/* Notice */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 text-blue-400 mr-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-blue-700">
                  Add custom features below. All fields are required.
                </p>
              </div>
            </div>

            {/* Plan Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Plan Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., Premium Plan"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Price ($)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  errors.price ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., 99.99"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            {/* Billing Cycle */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Billing Cycle
              </label>
              <select
                id="billing_cycle"
                name="billing_cycle"
                value={formData.billing_cycle}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            {/* Dynamic Features */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Features
                </label>
                <button
                  type="button"
                  onClick={addFeatureField}
                  className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-lg hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Feature
                </button>
              </div>
              <div className="space-y-4">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Feature name (e.g., users)"
                        value={feature.key}
                        onChange={(e) =>
                          handleFeatureChange(index, "key", e.target.value)
                        }
                        className={`block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                          errors[`featureKey${index}`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors[`featureKey${index}`] && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors[`featureKey${index}`]}
                        </p>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Value (e.g., 1000)"
                        value={feature.value}
                        onChange={(e) =>
                          handleFeatureChange(index, "value", e.target.value)
                        }
                        className={`block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                          errors[`featureValue${index}`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors[`featureValue${index}`] && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors[`featureValue${index}`]}
                        </p>
                      )}
                    </div>
                    {formData.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFeatureField(index)}
                        className="p-2 text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push("/subscription")}
                className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createPlanMutation.isPending}
                className={`px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ${
                  createPlanMutation.isPending
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-indigo-700"
                }`}
              >
                {createPlanMutation.isPending ? "Creating..." : "Create Plan"}
              </button>
            </div>
          </form>
        </div>
      </div>

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
  );
};

export default AddSubscriptionPlan;
