"use client";

import React, { useState, useEffect } from "react";
import {
  useLoginActivity,
  useApprovePasswordReset,
  useAdminActivity,
} from "@/lib/api/userManagementService/user";
import { useAuthStore } from "@/lib/auth";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

const activityTypeColors = {
  LOGIN: "border-green-500 bg-green-50",
  LOGOUT: "border-red-500 bg-red-50",
  UPDATE: "border-blue-500 bg-blue-50",
  PASSWORD_RESET_INITIATED: "border-yellow-500 bg-yellow-50",
  PASSWORD_RESET_APPROVED: "border-purple-500 bg-purple-50",
  DEFAULT: "border-gray-300 bg-gray-50",
};

const activityTypes = [
  "ALL", // Add an "ALL" option to show all activities
  "LOGIN",
  "LOGOUT",
  "UPDATE",
  "PASSWORD_RESET_INITIATED",
  "PASSWORD_RESET_APPROVED",
];

const UserActivity = ({
  schoolId: overrideSchoolId,
  globalView = false,
} = {}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("timestamp-desc");
  const [page, setPage] = useState(1);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activityTypeFilter, setActivityTypeFilter] = useState("ALL"); // New state for type filter
  const itemsPerPage = 5;

  const { getRoles, getSchoolId } = useAuthStore();
  const roles = getRoles() || [];
  const defaultSchoolId = getSchoolId();
  const schoolId = overrideSchoolId || defaultSchoolId;

  const isSuperAdmin = roles.includes("ROLE_SUPERADMIN");
  const isAdmin = roles.includes("ROLE_ADMIN") && !isSuperAdmin;

  const canViewGlobal = globalView && isSuperAdmin;
  const canViewSchool = !globalView && isAdmin && !!schoolId;
  const hasAccess = canViewGlobal || canViewSchool;

  const schoolActivityQuery = useLoginActivity(schoolId, {
    enabled: canViewSchool,
  });
  const globalActivityQuery = useAdminActivity({
    enabled: canViewGlobal,
  });

  const { data, isLoading, error, refetch } = globalView
    ? globalActivityQuery
    : schoolActivityQuery;

  // Normalize activities to always be an array
  const activities = Array.isArray(data) ? data : [];
  const noActivityMessage = data && !Array.isArray(data) ? data.message : null;

  const approvePasswordResetMutation = useApprovePasswordReset();

  console.log("activities : ", activities);

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.ipAddress.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      activityTypeFilter === "ALL" ||
      activity.activityType === activityTypeFilter;
    return matchesSearch && matchesType;
  });

  const sortedActivities = [...filteredActivities].sort((a, b) => {
    if (sortBy === "timestamp-desc")
      return new Date(b.timestamp) - new Date(a.timestamp);
    if (sortBy === "timestamp-asc")
      return new Date(a.timestamp) - new Date(b.timestamp);
    if (sortBy === "userId") return a.userId.localeCompare(b.userId);
    return 0;
  });

  const paginatedActivities = sortedActivities.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  const totalPages = Math.ceil(sortedActivities.length / itemsPerPage);

  const handleApproveClick = (activity) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const handleConfirmReset = (userId,newPassword) => {
    if (selectedActivity) {
      approvePasswordResetMutation.mutate(
        { userId, newPassword },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            refetch();
          },
          onError: (error) =>
            console.error("Failed to approve password reset:", error.message),
        }
      );
    }
  };

  if (!hasAccess) {
    return (
      <div className="text-center mt-16">
        <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
        <p className="mt-2 text-gray-600">
          {globalView
            ? "Global admin activity is restricted to Superadmins only."
            : "School-specific activity is restricted to Admins only and requires a valid school ID."}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            {globalView
              ? "Global Admin Activity"
              : `School User Activity - School: `}
            {!globalView && <span className="text-blue-600">{schoolId}</span>}
          </h1>
          <button
            onClick={refetch}
            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
            aria-label="Refresh activity list"
          >
            <ArrowPathIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Search, Sort, and Type Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by User ID or IP"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="timestamp-desc">Timestamp (Newest)</option>
            <option value="timestamp-asc">Timestamp (Oldest)</option>
            <option value="userId">User ID</option>
          </select>
          <select
            value={activityTypeFilter}
            onChange={(e) => {
              setActivityTypeFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {activityTypes.map((type) => (
              <option key={type} value={type}>
                {type === "ALL" ? "All Types" : type}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <svg
              className="animate-spin h-10 w-10 text-blue-500"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
              />
            </svg>
          </div>
        ) : error ? (
          <p className="text-center text-red-600 py-6">
            Failed to load activity: {error.message}
          </p>
        ) : noActivityMessage ? (
          <p className="text-center text-gray-500 py-8">{noActivityMessage}</p>
        ) : paginatedActivities.length > 0 ? (
          <ul className="space-y-4">
            {paginatedActivities.map((activity) => {
              const colorClass =
                activityTypeColors[activity.activityType] ||
                activityTypeColors.DEFAULT;
              return (
                <li
                  key={activity.id}
                  className={`p-4 rounded-lg shadow-sm hover:bg-opacity-80 transition-colors border-l-4 ${colorClass}`}
                >
                  <h3 className="text-lg font-medium text-gray-800">
                    {activity.userId}
                    {!globalView && ` (${activity.schoolId})`}
                  </h3>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-semibold">Type:</span>{" "}
                      {activity.activityType}
                    </p>
                    <p>
                      <span className="font-semibold">Details:</span>{" "}
                      {activity.details}
                    </p>
                    <p>
                      <span className="font-semibold">IP:</span>{" "}
                      {activity.ipAddress}
                    </p>
                    <p className="truncate" title={activity.deviceInfo}>
                      <span className="font-semibold">Device:</span>{" "}
                      {activity.deviceInfo}
                    </p>
                    <p>
                      <span className="font-semibold">Time:</span>{" "}
                      {new Date(activity.timestamp).toLocaleString("en-US", {
                        timeZone: "UTC", // Use a fixed timezone
                      })}
                    </p>
                    {activity.activityType === "PASSWORD_RESET_INITIATED" && (
                      <button
                        onClick={() => handleApproveClick(activity)}
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-center text-gray-500 py-8">
            No recent activity found.
          </p>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="inline-flex rounded-md shadow-sm">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-4 py-2 border border-gray-300 ${
                    page === p
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  } ${p === 1 ? "rounded-l-md" : ""} ${
                    p === totalPages ? "rounded-r-md" : ""
                  }`}
                >
                  {p}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>

      {isModalOpen && selectedActivity && (
        <PasswordResetModal
          activity={selectedActivity}
          onConfirm={handleConfirmReset}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

// PasswordResetModal remains unchanged
const PasswordResetModal = ({ activity, onConfirm, onClose }) => {
  const [newPassword, setNewPassword] = useState("");

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Approve Password Reset
        </h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <span className="font-semibold">User ID:</span> {activity.userId}
          </p>
          <p>
            <span className="font-semibold">Email:</span>{" "}
            {activity.details?.email || "N/A"}
          </p>
          <p>
            <span className="font-semibold">IP:</span> {activity.ipAddress}
          </p>
          <p>
            <span className="font-semibold">Device:</span> {activity.deviceInfo}
          </p>
          <p>
            <span className="font-semibold">Requested:</span>{" "}
            {new Date(activity.timestamp).toLocaleString("en-US", {
              timeZone: "UTC",
            })}
          </p>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter new password"
          />
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(activity.userId,newPassword)}
            disabled={!newPassword}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserActivity;
