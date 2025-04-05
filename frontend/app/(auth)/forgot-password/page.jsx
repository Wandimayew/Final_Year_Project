"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/api/userManagementService/user"; // Adjust path
export const dynamic = "force-dynamic";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const { forgotPassword, isLoading, error, isSuccess } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await forgotPassword(email);
  };

  const message = isSuccess
    ? "A password reset link has been sent to your email. Please check your inbox and you can close this page."
    : error
    ? "Error sending reset link. Please try again."
    : "";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        {!isSuccess ? (
          <>
            <h2 className="text-2xl font-bold text-center mb-6">
              Forgot Password
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your Email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center"
                disabled={isLoading}
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
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        ) : null}

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
    </div>
  );
}
