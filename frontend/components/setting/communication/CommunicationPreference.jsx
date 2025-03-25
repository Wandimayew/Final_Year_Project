"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";

const CommunicationPreference = () => {
  const [preference, setPreference] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { auth, loading: authLoading } = useAuth();

  useEffect(() => {
    // Wait for auth to resolve
    if (authLoading) {
      console.log("Auth is still loading...");
      return;
    }

    // Check if authenticated
    if (!auth || !auth.token) {
      console.log("No auth or token found.");
      setError("Authentication required to view preferences.");
      setLoading(false); // Ensure loading stops
      return;
    }

    const { token } = auth;
    const { schoolId, userId } = auth.user || {}; // Safely destructure with fallback

    if (!schoolId || !userId) {
      console.log("Missing schoolId or userId in auth.user:", auth.user);
      setError("Incomplete user data.");
      setLoading(false);
      return;
    }

    const fetchPreferences = async () => {
      try {
        console.log(
          "Fetching preferences for schoolId:",
          schoolId,
          "userId:",
          userId
        );
        const response = await axios.get(
          `http://10.194.61.74:8080/communication/api/${schoolId}/getCommunicationPreferenceByUserId`, // Dynamic endpoint
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        console.log("Preference response:", response.data);
        setPreference(response.data.data); // Assuming response.data.data contains the preference
        setLoading(false);
      } catch (err) {
        console.error("Error fetching communication preferences:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load communication preferences."
        );
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [authLoading, auth]); // Depend on authLoading and auth

  const handleToggle = async (field) => {
    if (!preference || !auth || !auth.token) return;

    const previousPreference = { ...preference };
    const newValue = !preference[field];
    const updatedPreference = { ...preference, [field]: newValue };

    setPreference(updatedPreference); // Optimistic update

    const { token } = auth;
    const { schoolId, userId } = auth.user;

    try {
      console.log(`Updating ${field} for userId: ${userId}`);
      await axios.put(
        `http://10.194.61.74:8080/communication/api/${schoolId}/updateCommunicationPreference/${userId}`,
        updatedPreference,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      console.log(`${field} updated successfully`);
    } catch (err) {
      console.error(`Error updating ${field}:`, err);
      setError("Failed to save changes. Reverting...");
      setPreference(previousPreference);
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200">
        <div className="text-blue-600 font-medium text-xl animate-pulse">
          Loading Preferences...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200">
        <div className="text-red-600 font-medium text-lg">{error}</div>
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
