"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "@/lib/auth";
import { useUpdateUser, useUser } from "@/lib/api/userManagementService/user";
import { useRouter } from "next/navigation";
import { FiUser, FiEye, FiEyeOff } from "react-icons/fi";
import toast from "react-hot-toast"; // Assuming react-hot-toast is your global toast library

const UserProfile = () => {
  const { getSchoolId, token } = useAuthStore();
  const router = useRouter();
  const [schoolId, setSchoolId] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null); // For success message

  const authData = useMemo(() => useAuthStore.getState(), []);
  const userId = authData.user?.userId;

  // Fetch user data
  const {
    data: user,
    isLoading: isUserLoading,
    error: userError,
  } = useUser(schoolId, userId);

  // State for editable fields
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  // Update user mutation
  const {
    mutateAsync: updateUser,
    isPending: isUpdating,
    error: updateError,
  } = useUpdateUser();

  useEffect(() => {
    const id = getSchoolId();
    console.log(
      "UserProfile - schoolId:",
      id,
      "userId:",
      userId,
      "token:",
      token
    );
    console.log("Stored auth data:", authData);

    setSchoolId(id);
    setIsHydrated(true);

    if (!id || !userId) {
      console.log("Redirecting to /login - missing schoolId or userId");
      router.push("/login");
    }
  }, [getSchoolId, router]);

  // Sync form fields with fetched user data
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
    }
  }, [user]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setPasswordError(null);
    setSuccessMessage(null);

    // Validate passwords
    if (newPassword || confirmPassword) {
      if (!currentPassword) {
        setPasswordError("Current password is required to update password.");
        toast.error("Current password is required.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError("New password and confirmation do not match.");
        toast.error("Passwords do not match.");
        return;
      }
    }

    // Use a plain object instead of FormData since no file is included
    const updateData = {};
    if (username && username !== user?.username) {
      updateData.username = username;
    }
    if (newPassword) {
      updateData.currentPassword = currentPassword;
      updateData.newPassword = newPassword;
    }

    try {
      await updateUser({
        schoolId,
        id: userId,
        data: updateData,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError(null);
      setSuccessMessage("Profile updated successfully!");
      toast.success("Profile updated successfully!");

      // Update localStorage with new username if changed
      if (username && username !== user?.username) {
        authData.state.user.username = username;
        localStorage.setItem("auth-store", JSON.stringify(authData));
      }
    } catch (error) {
      console.error("Update failed:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to update profile.";
      setPasswordError(errorMsg);
      toast.error(errorMsg);
    }
  };

  if (!isHydrated || isUserLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <svg
          className="animate-spin h-10 w-10 text-blue-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
          ></path>
        </svg>
      </div>
    );
  }

  if (!schoolId || !userId) return null; // Let router.push handle redirect

  if (userError) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <p className="text-center text-red-600 text-lg">
          Failed to load profile: {userError.message}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto bg-white shadow-lg rounded-xl p-6 relative">
        {/* Progress Overlay */}
        {isUpdating && (
          <div className="absolute inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center rounded-xl">
            <svg
              className="animate-spin h-12 w-12 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
              ></path>
            </svg>
          </div>
        )}

        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          User Profile
        </h1>

        {/* Profile Display */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-24 h-24 mb-4">
            {user?.image ? (
              <img
                src={user.image}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-2 border-gray-300"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                <FiUser size={40} className="text-gray-500" />
              </div>
            )}
          </div>
          <div className="text-center">
            <p className="text-gray-700 font-medium">
              <span className="font-bold">Username:</span>{" "}
              {user.username || "N/A"}
            </p>
            <p className="text-gray-700 font-medium">
              <span className="font-bold">Email:</span> {user.email || "N/A"}
            </p>
            <p className="text-gray-700 font-medium">
              <span className="font-bold">ID:</span> {user.userId || "N/A"}
            </p>
            <p className="text-gray-700 font-medium">
              <span className="font-bold">School ID:</span>{" "}
              {user.schoolId || "N/A"}
            </p>
          </div>
        </div>

        {/* Update Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Update Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter new username"
              disabled={isUpdating}
            />
          </div>
          <div className="relative">
            <label className="block text-gray-700 font-medium mb-2">
              Current Password
            </label>
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter current password"
              disabled={isUpdating}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
            >
              {showCurrentPassword ? (
                <FiEyeOff size={20} />
              ) : (
                <FiEye size={20} />
              )}
            </button>
          </div>
          <div className="relative">
            <label className="block text-gray-700 font-medium mb-2">
              New Password
            </label>
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter new password"
              disabled={isUpdating}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
            >
              {showNewPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>
          <div className="relative">
            <label className="block text-gray-700 font-medium mb-2">
              Confirm New Password
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm new password"
              disabled={isUpdating}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? (
                <FiEyeOff size={20} />
              ) : (
                <FiEye size={20} />
              )}
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center"
            disabled={isUpdating}
          >
            {isUpdating ? (
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                ></path>
              </svg>
            ) : null}
            {isUpdating ? "Updating..." : "Update Profile"}
          </button>
        </form>

        {/* Success Message */}
        {successMessage && (
          <p className="mt-4 text-center text-green-500">{successMessage}</p>
        )}

        {/* Error Messages */}
        {(updateError || passwordError) && (
          <p className="mt-4 text-center text-red-500">
            {updateError?.message || passwordError}
          </p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
