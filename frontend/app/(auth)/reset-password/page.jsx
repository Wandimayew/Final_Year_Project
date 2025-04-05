"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/api/userManagementService/user";
export const dynamic = "force-dynamic";

// Child component for Suspense
function ResetPasswordContent() {
  const [newPassword, setNewPassword] = useState("");
  const { resetPassword, isLoading, error, isSuccess } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState(null);

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setMessage("Token is missing.");
      return;
    }
    await resetPassword({ token, newPassword });
  };

  const message = isSuccess
    ? "Password reset successfully. Redirecting to login..."
    : error
    ? "Error resetting password. Please try again."
    : token === null
    ? "Token is missing."
    : "";

  return (
    <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            New Password
          </label>
          <input
            type="password"
            placeholder="Enter Your new Password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={isLoading || isSuccess}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center"
          disabled={isLoading || isSuccess}
        >
          {isLoading ? (
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
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
      {message && (
        <p
          className={`mt-4 text-center ${
            isSuccess ? "text-green-500" : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export default function ResetPassword() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
