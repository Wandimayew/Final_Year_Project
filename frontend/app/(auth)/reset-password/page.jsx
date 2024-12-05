"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation"; // Import useSearchParams
import { useRouter } from "next/navigation";
import axios from "axios";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState(null);
  const router = useRouter();

  // Using useSearchParams to get query params
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token"); // Get token from URL
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [searchParams]); // Make sure to rerun when searchParams change

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setMessage("Token is missing.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8082/api/auth/reset-password", {
        token,
        newPassword,
      });
      setMessage(response.data);
      console.log("reseting password response : ",response.data);
      
      router.push("/login");
    } catch (error) {
      setMessage("Error resetting password. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">New Password</label>
            <input
              type="password"
              placeholder="Enter Your new Password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Reset Password
          </button>
        </form>
        {message && <p className="mt-4 text-center text-green-500">{message}</p>}
      </div>
    </div>
  );
}
