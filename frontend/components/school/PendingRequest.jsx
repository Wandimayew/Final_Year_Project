"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ChevronLeftIcon, CheckCircleIcon } from "@heroicons/react/20/solid";
import { useAuthStore } from "@/lib/auth";
import {
  useSchoolSubscriptions,
  useUpdateSchoolSubscription,
} from "@/lib/api/tenantService/schoolsubscription";

const SubscriptionStatus = {
  UNPAID: "unpaid",
  PAID: "paid",
  PENDING: "pending",
};

const statusStyles = {
  [SubscriptionStatus.PENDING]: "bg-yellow-100 text-yellow-800",
  [SubscriptionStatus.PAID]: "bg-green-100 text-green-800",
  [SubscriptionStatus.UNPAID]: "bg-red-100 text-red-800",
};

export const dynamic = 'force-dynamic'; // Prevent static prerendering

export default function SchoolSubscriptionsApproval() {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [approvingId, setApprovingId] = useState(null);

  // Memoize auth data to prevent unnecessary re-renders
  const authData = useMemo(() => {
    const state = useAuthStore.getState();
    return {
      token: state.token,
      isSuperAdmin: state.user?.roles?.includes("ROLE_SUPERADMIN") || [],
    };
  }, []);

  const { token, isSuperAdmin } = authData;

  const {
    data: subscriptions = [],
    isLoading,
    error,
  } = useSchoolSubscriptions(null, {
    enabled: isHydrated && isSuperAdmin,
    select: (data) =>
      data.filter(
        (sub) => sub.status.toLowerCase() === SubscriptionStatus.PENDING
      ),
  });

  const { mutateAsync: updateSubscription, isPending: isUpdating } =
    useUpdateSchoolSubscription();

  // Hydration and auth check (run once on mount)
  useEffect(() => {
    if (!isHydrated) {
      setIsHydrated(true);
      if (!token) {
        toast.error("Please login to continue");
        setTimeout(() => router.push("/login"), 2000);
      } else if (!isSuperAdmin) {
        toast.error("You don't have permission to access this page");
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    }
  }, [isHydrated, token, isSuperAdmin, router]);

  // Handle payment approval
  const handleApprovePayment = async (subscription) => {
    setApprovingId(subscription.id);
    try {
      await updateSubscription({
        schoolId: subscription.schoolId,
        subscriptionId: subscription.id,
        subscriptionData: {
          ...subscription,
          status: SubscriptionStatus.PAID,
          paymentConfirmedAt: new Date().toISOString(),
        },
      });
      toast.success(
        `Payment for ${subscription.schoolName} approved successfully`
      );
    } catch (err) {
      toast.error("Failed to approve payment");
      console.error("Approval error:", err);
    } finally {
      setApprovingId(null);
    }
  };

  if (!isHydrated || !token || !isSuperAdmin) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center px-4 py-2 bg-white text-indigo-600 text-sm font-medium rounded-lg shadow-sm hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
          >
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Subscription Approvals
          </h1>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-indigo-600 text-white p-6">
            <h2 className="text-2xl font-semibold">
              Pending Payment Approvals
            </h2>
            <p className="mt-1 text-sm">
              Review and approve school subscription payments
            </p>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-500 mb-4"></div>
                <p className="text-lg text-gray-600">
                  Loading pending subscriptions...
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 text-lg font-medium">
                  Failed to load subscriptions: {error.message}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Please try again later or contact support.
                </p>
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-xl font-medium">No pending approvals</p>
                <p className="mt-2 text-sm">All payments are up to date.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-100">
                      <tr className="text-sm font-semibold text-gray-600 uppercase">
                        <th className="py-3 px-4">School Name</th>
                        <th className="py-3 px-4">Plan</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Payment Due</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700">
                      {subscriptions.map((sub) => (
                        <tr
                          key={sub.id}
                          className="border-t border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="py-3 px-4">{sub.schoolName}</td>
                          <td className="py-3 px-4">{sub.plan?.name}</td>
                          <td className="py-3 px-4">
                            ${sub.amount?.toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            {new Date(sub.payment_due).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                statusStyles[sub.status]
                              }`}
                            >
                              {sub.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleApprovePayment(sub)}
                              disabled={isUpdating && approvingId === sub.id}
                              className={`inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 ${
                                isUpdating && approvingId === sub.id
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              <CheckCircleIcon className="w-5 h-5 mr-1" />
                              {isUpdating && approvingId === sub.id
                                ? "Approving..."
                                : "Approve"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {subscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className="bg-gray-50 p-4 rounded-lg shadow-sm"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium text-gray-900">
                            {sub.schoolName}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              statusStyles[sub.status]
                            }`}
                          >
                            {sub.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Plan:</span>{" "}
                          {sub.plan?.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Amount:</span> $
                          {sub.amount?.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Payment Due:</span>{" "}
                          {new Date(sub.payment_due).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleApprovePayment(sub)}
                        disabled={isUpdating && approvingId === sub.id}
                        className={`mt-4 w-full inline-flex justify-center items-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 ${
                          isUpdating && approvingId === sub.id
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <CheckCircleIcon className="w-5 h-5 mr-1" />
                        {isUpdating && approvingId === sub.id
                          ? "Approving..."
                          : "Approve Payment"}
                      </button>
                    </div>
                  ))}
                </div>
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
}
