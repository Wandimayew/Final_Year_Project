"use client";

import { useState } from "react";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false); // State to track success

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://10.194.61.72:8080/auth/api/forgot-password",
        { email }
      );
      setMessage(
        "A password reset link has been sent to your email. Please check your inbox. and you can close this page."
      );
      setIsSuccess(true); // Mark as success
      console.log("Response message:", response.data);
    } catch (error) {
      setMessage("Error sending reset link. Please try again.");
      setIsSuccess(false); // Mark as failure
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        {!isSuccess && (
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
                  disabled={isSuccess} // Disable input if success
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
                disabled={isSuccess} // Disable button if success
              >
                Send Reset Link
              </button>
            </form>
          </>
        )}

        {/* Conditional message */}
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