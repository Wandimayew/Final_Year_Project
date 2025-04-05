"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";

// Mock API function (replace with your actual API call)
const fetchSchoolSubscription = async (schoolId) => {
  // Simulated API response returning only the active/current subscription
  return {
    subscription_id: 1,
    plan: { name: "Wandi", price: 999.98, billing_cycle: "monthly" },
    start_date: "2025-01-01",
    end_date: "2025-01-31",
    status: "pending", // "unpaid", "pending", "paid"
    payment_due: "2025-03-31",
    is_expired: false, // Add logic to determine expiration
  };
};

const MySubscription = () => {
  const router = useRouter();
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        setIsLoading(true);
        const schoolId = "mock-school-id"; // Replace with actual school ID from auth/context
        const data = await fetchSchoolSubscription(schoolId);

        // Determine status based on expiration and approval
        const currentDate = new Date();
        const endDate = new Date(data.end_date);
        const paymentDueDate = new Date(data.payment_due);
        let displayStatus = data.status;

        if (
          data.is_expired ||
          (endDate < currentDate && data.status !== "paid")
        ) {
          displayStatus = "unpaid";
        } else if (data.status === "pending") {
          displayStatus = "pending";
        } else if (data.status === "paid") {
          displayStatus = "paid";
        }

        setSubscription({ ...data, displayStatus });
      } catch (error) {
        toast.error("Failed to load subscription");
      } finally {
        setIsLoading(false);
      }
    };
    loadSubscription();
  }, []);

  const getStatusStyles = (status) => {
    switch (status.toLowerCase()) {
      case "unpaid":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center px-4 py-2 bg-white text-indigo-600 text-sm font-medium rounded-lg shadow-sm hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
          >
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">My Subscription</h1>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-indigo-600 text-white p-6">
            <h2 className="text-2xl font-semibold">Current Subscription</h2>
            <p className="mt-1 text-sm">
              View your active subscription details
            </p>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-500 mb-4"></div>
                <p className="text-lg text-gray-600">Loading subscription...</p>
              </div>
            ) : !subscription ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-xl font-medium">No active subscription</p>
                <p className="mt-2 text-sm">
                  Contact your administrator to subscribe to a plan.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Subscription Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase">
                      Plan Name
                    </h3>
                    <p className="mt-2 text-lg text-gray-900 font-medium">
                      {subscription.plan.name}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase">
                      Price
                    </h3>
                    <p className="mt-2 text-lg text-gray-900 font-medium">
                      ${subscription.plan.price} /
                      {subscription.plan.billing_cycle}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase">
                      Start Date
                    </h3>
                    <p className="mt-2 text-lg text-gray-900 font-medium">
                      {new Date(subscription.start_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase">
                      End Date
                    </h3>
                    <p className="mt-2 text-lg text-gray-900 font-medium">
                      {new Date(subscription.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase">
                      Payment Due
                    </h3>
                    <p className="mt-2 text-lg text-gray-900 font-medium">
                      {new Date(subscription.payment_due).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase">
                      Status
                    </h3>
                    <span
                      className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusStyles(
                        subscription.displayStatus
                      )}`}
                    >
                      {subscription.displayStatus === "unpaid"
                        ? "Unpaid"
                        : subscription.displayStatus}
                    </span>
                  </div>
                </div>

                {/* Additional Info */}
                {subscription.displayStatus === "pending" && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      Your payment is pending approval by an administrator.
                    </p>
                  </div>
                )}
                {subscription.displayStatus === "unpaid" && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                    <p className="text-sm text-red-700">
                      Your subscription has expired or payment is overdue.
                      Please contact support to renew.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
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

export default MySubscription;
