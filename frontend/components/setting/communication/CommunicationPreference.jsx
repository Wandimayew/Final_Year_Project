"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth";
import {
  useCommunicationPreferenceByUser,
  useUpdateCommunicationPreference,
} from "@/lib/api/communicationService/communicationpreference";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

const CommunicationPreference = () => {
  const queryClient = useQueryClient();

  // Local state to hold auth data, updated via subscription
  const [authState, setAuthState] = useState(() => {
    const state = useAuthStore.getState();
    return {
      user: state.user,
      token: state.token,
      isAuthenticated: state.isAuthenticated(),
      loading: state.loading,
    };
  });

  // Subscribe to auth store changes explicitly
  useEffect(() => {
    const unsubscribe = useAuthStore.subscribe(
      (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated(),
        loading: state.loading,
      }),
      (newState) => {
        setAuthState(newState);
      }
    );
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const { user, token, isAuthenticated, loading: authLoading } = authState;

  const schoolId = user?.schoolId;
  const userId = user?.userId;

  const {
    data: preferenceData,
    isLoading: queryLoading,
    isError,
    error,
  } = useCommunicationPreferenceByUser(schoolId, {
    enabled: !!schoolId && isAuthenticated && !authLoading,
  });

  const preference = preferenceData?.data;

  const updatePreferenceMutation = useUpdateCommunicationPreference(schoolId);

  const handleToggle = useCallback(
    async (field) => {
      if (!preference || !token || !schoolId || !userId) return;

      const previousPreference = { ...preference };
      const newValue = !preference[field];
      const updatedPreference = { ...preference, [field]: newValue };

      updatePreferenceMutation.mutate(
        { userId, communicationPreferenceRequest: updatedPreference },
        {
          onMutate: async () => {
            await queryClient.cancelQueries([
              "communicationPreferences",
              schoolId,
              "user",
            ]);
            const previousData = queryClient.getQueryData([
              "communicationPreferences",
              schoolId,
              "user",
            ]);
            queryClient.setQueryData(
              ["communicationPreferences", schoolId, "user"],
              (old = { data: {} }) => ({
                ...old,
                data: updatedPreference,
              })
            );
            return { previousData };
          },
          onSuccess: () => {
            console.log(`${field} updated successfully`);
            toast.success(`${field} preference updated!`, {
              position: "top-right",
            });
          },
          onError: (err, variables, context) => {
            console.error(`Error updating ${field}:`, err);
            toast.error("Failed to save changes. Reverting...", {
              position: "top-right",
            });
            queryClient.setQueryData(
              ["communicationPreferences", schoolId, "user"],
              context.previousData
            );
            setTimeout(() => toast.dismiss(), 3000);
          },
          onSettled: () => {
            queryClient.invalidateQueries([
              "communicationPreferences",
              schoolId,
              "user",
            ]);
          },
        }
      );
    },
    [
      preference,
      token,
      schoolId,
      userId,
      updatePreferenceMutation,
      queryClient,
    ]
  );

  const loading = authLoading || queryLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200">
        <div className="text-blue-600 font-medium text-xl animate-pulse">
          Loading Preferences...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200">
        <div className="text-red-600 font-medium text-lg">
          Authentication required to view preferences.
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200">
        <div className="text-red-600 font-medium text-lg">
          {error?.response?.data?.message ||
            error?.message ||
            "Failed to load communication preferences."}
        </div>
      </div>
    );
  }

  if (!preference) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200">
        <div className="text-gray-600 font-medium text-lg">
          No preferences found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 leading-tight mb-8">
          Communication Settings
        </h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-6">
            <div className="border-b border-gray-300 pb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Preferences for User: {preference.userId}
              </h2>
              <p className="text-sm text-gray-600">
                School: {preference.schoolId}
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="emailEnabled"
                  className="text-sm font-medium text-blue-600"
                >
                  Email Notifications
                </label>
                <div
                  className="relative inline-flex items-center cursor-pointer"
                  onClick={() => handleToggle("emailEnabled")}
                >
                  <input
                    type="checkbox"
                    id="emailEnabled"
                    checked={preference.emailEnabled}
                    readOnly
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-500 transition-colors duration-200"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-5"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="pushEnabled"
                  className="text-sm font-medium text-blue-600"
                >
                  Push Notifications
                </label>
                <div
                  className="relative inline-flex items-center cursor-pointer"
                  onClick={() => handleToggle("pushEnabled")}
                >
                  <input
                    type="checkbox"
                    id="pushEnabled"
                    checked={preference.pushEnabled}
                    readOnly
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-500 transition-colors duration-200"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-5"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="smsEnabled"
                  className="text-sm font-medium text-blue-600"
                >
                  SMS Notifications
                </label>
                <div
                  className="relative inline-flex items-center cursor-pointer"
                  onClick={() => handleToggle("smsEnabled")}
                >
                  <input
                    type="checkbox"
                    id="smsEnabled"
                    checked={preference.smsEnabled}
                    readOnly
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-500 transition-colors duration-200"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-5"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="inAppEnabled"
                  className="text-sm font-medium text-blue-600"
                >
                  In-App Notifications
                </label>
                <div
                  className="relative inline-flex items-center cursor-pointer"
                  onClick={() => handleToggle("inAppEnabled")}
                >
                  <input
                    type="checkbox"
                    id="inAppEnabled"
                    checked={preference.inAppEnabled}
                    readOnly
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-500 transition-colors duration-200"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-5"></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-gray-300 pt-4">
              <span className="text-sm font-medium text-blue-600">Status:</span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  preference.active
                    ? "bg-green-200 text-green-900"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                {preference.active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CommunicationPreference;