"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  useSubscriptionPlan,
  useSchoolsByPlanId,
  useDeleteSubscriptionPlan,
} from "@/lib/api/tenantService/subscriptionplan";
import { useAuthStore } from "@/lib/auth";
import { useRouter, useParams } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ChevronLeftIcon, CheckIcon } from "@heroicons/react/20/solid"; // Added CheckIcon

const PlanDetails = () => {
  const router = useRouter();
  const { id } = useParams();
  const [isMounted, setIsMounted] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  console.log("plan id is : ", id);

  const authData = useMemo(() => useAuthStore.getState(), []);
  const { token } = authData;
  const roles = authData.user?.roles || [];
  const isSuperAdmin = roles.includes("ROLE_SUPERADMIN");

  const {
    data: plan,
    isLoading: isPlanLoading,
    error: planError,
  } = useSubscriptionPlan(id, {
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const {
    data: schools = [],
    isLoading: isSchoolsLoading,
    error: schoolsError,
  } = useSchoolsByPlanId(id, {
    enabled: !!plan,
  });

  const { mutate: deletePlan, isLoading: isDeleting } =
    useDeleteSubscriptionPlan();

  useEffect(() => {
    setIsMounted(true);
    if (!token && isMounted) {
      toast.error("Please login to view plan details");
      setTimeout(() => router.push("/login"), 2000);
    }
  }, [token, router, isMounted]);

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    deletePlan(id, {
      onSuccess: () => {
        toast.success(`Plan "${plan.name}" deleted successfully`);
        setIsDeleteModalOpen(false);
        setTimeout(() => router.push("/subscription"), 1500);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete plan");
        setIsDeleteModalOpen(false);
      },
    });
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
  };

  if (!isMounted || !token) return null;

  console.log("schools data:", schools);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/subscription")}
            className="inline-flex items-center px-4 py-2 bg-white text-indigo-600 text-sm font-medium rounded-lg shadow-sm hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
          >
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Back to Plans
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Plan Details</h1>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {isPlanLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-500 mb-4"></div>
              <p className="text-lg text-gray-600">Loading plan details...</p>
            </div>
          ) : planError ? (
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
                  {planError.message || "Failed to load plan details."}
                </p>
              </div>
            </div>
          ) : !plan ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-xl font-medium">Plan not found</p>
            </div>
          ) : (
            <>
              {/* Card Header */}
              <div className="bg-indigo-600 text-white p-6">
                <h2 className="text-2xl font-semibold">{plan.name}</h2>
                <p className="mt-2 text-3xl font-bold">
                  ${plan.price}
                  <span className="text-base font-normal">
                    {" "}
                    /{plan.billing_cycle}
                  </span>
                </p>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-8">
                {/* Plan Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase">
                      Status
                    </h3>
                    <span
                      className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        plan.active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {plan.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase">
                      Created By
                    </h3>
                    <p className="mt-2 text-gray-900">
                      {plan.created_by || "Unknown"}
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Features
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {Object.keys(plan.features).length === 0 ? (
                      <p className="text-gray-600">No features specified</p>
                    ) : (
                      <ul className="space-y-3">
                        {Object.entries(plan.features).map(([key, value]) => (
                          <li key={key} className="flex items-start">
                            <CheckIcon className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-1" />
                            <span className="ml-2 text-gray-700">
                              <span className="font-medium capitalize">
                                {key}:
                              </span>{" "}
                              {value}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Subscribed Schools */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Subscribed Schools
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {isSchoolsLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-indigo-500 mr-2"></div>
                        <p className="text-gray-600">Loading schools...</p>
                      </div>
                    ) : schoolsError ? (
                      <p className="text-red-600">
                        Failed to load schools: {schoolsError.message}
                      </p>
                    ) : schools.length === 0 ? (
                      <p className="text-gray-600">
                        No schools subscribed to this plan.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-gray-100">
                            <tr className="text-sm font-semibold text-gray-600 uppercase">
                              <th className="py-3 px-4">School Name</th>
                              <th className="py-3 px-4">Start Date</th>
                              <th className="py-3 px-4">End Date</th>
                              <th className="py-3 px-4">Status</th>
                            </tr>
                          </thead>
                          <tbody className="text-gray-700">
                            {schools.schools.map((schoolSub) => (
                              <tr
                                key={schoolSub.subscription_id}
                                className="border-t border-gray-200 hover:bg-gray-100 transition-colors duration-200"
                              >
                                <td className="py-3 px-4">
                                  {schoolSub.school?.name || "Unknown School"}
                                </td>
                                <td className="py-3 px-4">
                                  {new Date(
                                    schoolSub.start_date
                                  ).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-4">
                                  {new Date(
                                    schoolSub.end_date
                                  ).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      schoolSub.isActive
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {schoolSub.isActive ? "Active" : "Inactive"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {isSuperAdmin && (
                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => router.push(`/subscription/edit/${id}`)}
                      className="flex-1 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
                    >
                      Edit Plan
                    </button>
                    <button
                      onClick={handleDeleteClick}
                      disabled={isDeleting}
                      className={`flex-1 px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 ${
                        isDeleting ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isDeleting ? "Deleting..." : "Delete Plan"}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Confirm Deletion
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "
                <span className="font-medium">{plan.name}</span>"? This action
                is permanent and cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className={`px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 ${
                    isDeleting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
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

export default PlanDetails;
