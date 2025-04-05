"use client";

import React, { useState, useEffect } from "react";
import {
  useSubscriptionPlan,
  useUpdateSubscriptionPlan,
} from "@/lib/api/tenantService/subscriptionplan";
import { useAuthStore } from "@/lib/auth";
import { useRouter, useParams } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ChevronLeftIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";

const EditPlan = () => {
  const router = useRouter();
  const { id } = useParams();
  const [isMounted, setIsMounted] = useState(false);

  const { token } = useAuthStore((state) => state);
  const roles = useAuthStore((state) => state.user?.roles) || [];
  const isSuperAdmin = roles.includes("ROLE_SUPERADMIN");

  const { data: plan, isLoading, error } = useSubscriptionPlan(id);
  const { mutate: updatePlan, isLoading: isUpdating } =
    useUpdateSubscriptionPlan();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    billing_cycle: "",
    features: {},
    isActive: true,
  });

  // Feature input state for dynamic feature management
  const [featureKey, setFeatureKey] = useState("");
  const [featureValue, setFeatureValue] = useState("");

  useEffect(() => {
    setIsMounted(true);
    if (!token && isMounted) {
      toast.error("Please login to edit plans");
      setTimeout(() => router.push("/login"), 2000);
    }
    if (!isSuperAdmin && isMounted) {
      toast.error("You don't have permission to edit plans");
      setTimeout(() => router.push("/subscription"), 2000);
    }
  }, [token, isSuperAdmin, router, isMounted]);

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name || "",
        price: plan.price || "",
        billing_cycle: plan.billing_cycle || "",
        features: plan.features || {},
        isActive: plan.active || true, // Adjusted to match API field 'active'
      });
    }
  }, [plan]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddFeature = () => {
    if (featureKey.trim() && featureValue.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: {
          ...prev.features,
          [featureKey.trim().toLowerCase()]: featureValue.trim(),
        },
      }));
      setFeatureKey("");
      setFeatureValue("");
    } else {
      toast.error("Feature key and value cannot be empty");
    }
  };

  const handleRemoveFeature = (key) => {
    setFormData((prev) => {
      const newFeatures = { ...prev.features };
      delete newFeatures[key];
      return { ...prev, features: newFeatures };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.billing_cycle) {
      toast.error("Please fill in all required fields");
      return;
    }

    updatePlan(
      { planId: id, data: formData },
      {
        onSuccess: () => {
          toast.success("Plan updated successfully");
          setTimeout(() => router.push(`/subscription/details/${id}`), 1500);
        },
        onError: (err) => {
          toast.error(err.message || "Failed to update plan");
        },
      }
    );
  };

  if (!isMounted || !token || !isSuperAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push(`/subscription/details/${id}`)}
            className="inline-flex items-center px-4 py-2 bg-white text-indigo-600 text-sm font-medium rounded-lg shadow-sm hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
          >
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Back to Plan Details
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Plan</h1>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-500 mb-4"></div>
              <p className="text-lg text-gray-600">Loading plan details...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 border-l-4 border-red-400 rounded-lg">
              <div className="flex items-center">
                <svg
                  className="h-6 w-6 text-red-400 mr-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-red-700 text-lg">
                  {error.message || "Failed to load plan details"}
                </p>
              </div>
            </div>
          ) : !plan ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-xl font-medium">Plan not found</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Card Header */}
              <div className="bg-indigo-600 text-white p-4 rounded-t-lg">
                <h2 className="text-xl font-semibold">
                  {formData.name || "Edit Plan"}
                </h2>
              </div>

              {/* Form Body */}
              <div className="space-y-6 px-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                {/* Billing Cycle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Billing Cycle
                  </label>
                  <select
                    name="billing_cycle"
                    value={formData.billing_cycle}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  >
                    <option value="">Select billing cycle</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Features
                  </label>
                  <div className="space-y-3 mb-4">
                    {Object.entries(formData.features).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg shadow-sm"
                      >
                        <span className="text-sm text-gray-700">
                          <span className="font-medium capitalize">{key}:</span>{" "}
                          {value}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(key)}
                          className="p-1 text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Feature name (e.g., users)"
                      value={featureKey}
                      onChange={(e) => setFeatureKey(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Feature value (e.g., 1000)"
                      value={featureValue}
                      onChange={(e) => setFeatureValue(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 flex items-center"
                    >
                      <PlusIcon className="h-5 w-5 mr-1" />
                      Add
                    </button>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-3 text-sm font-medium text-gray-700">
                    Active
                  </label>
                </div>
              </div>

              {/* Form Footer */}
              <div className="pt-6 border-t border-gray-200 flex justify-end gap-4 px-4">
                <button
                  type="button"
                  onClick={() => router.push(`/subscription/details/${id}`)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className={`px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ${
                    isUpdating ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
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

export default EditPlan;
