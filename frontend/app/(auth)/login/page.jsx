"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import schoolLogo from "@/public/schoolLogo.svg";
import Image from "next/image";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { User, Lock, LogIn } from "lucide-react"; // Added LogIn icon
import axios from "axios";

const Login = ({ setLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // Added username state
  const [error, setError] = useState(""); // Added for error feedback
  const router = useRouter();

  const handlePasswordVisibilityToggle = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    // Log explicitly to ensure this function is called
    console.log("handleLogin triggered with:", { username, password });

    try {
      console.log("Attempting login with:", username, password);

      const response = await axios.post(
        "http://localhost:8082/api/auth/login",
        { username, password },
        { headers: { "Content-Type": "application/json" } } // Ensure proper headers
      );

      console.log("API Response:", response); // Log the full response

      if (response.status === 200) {
        const user = {
          name: response.data.username || "Unknown",
          email: response.data.email || "",
          role: Array.isArray(response.data.roles) ? response.data.roles[0] : response.data.role || "Unknown",
          userId: response.data.userId,
          schoolId: response.data.schoolId,
        };

        const token = response.data.token;
        const data = { token, user };

        localStorage.setItem("auth-store", JSON.stringify(data));
        console.log("Stored auth data:", data); // Log stored data

        // Delay navigation slightly to ensure logs are visible
        setTimeout(() => {
          router.push("/dashboard");
        }, 100); // 100ms delay
      } else {
        console.log("Unexpected status code:", response.status);
        setError("Unexpected response from server. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error.message); // Log specific error message
      console.error("Full error details:", error); // Log full error object
      if (error.response) {
        // Server responded with a status other than 2xx
        console.log("Error response data:", error.response.data);
        setError(`Login failed: ${error.response.data.message || "Server error"}`);
      } else if (error.request) {
        // Request made but no response received
        console.log("No response received:", error.request);
        setError("No response from server. Check your network or server status.");
      } else {
        // Error setting up the request
        console.log("Request setup error:", error.message);
        setError("Login failed. Please check your credentials and try again.");
      }
    }
  };

  return (
    <div className="bg-white p-8 mt-6 rounded-lg shadow-lg flex flex-col items-center space-y-6 max-w-sm w-full">
      <div onClick={() => setLogin(false)} className="w-24 cursor-pointer">
        <Image
          src={schoolLogo}
          alt="logo"
          width={96}
          height={96}
          className="rounded-lg"
        />
      </div>

      <form onSubmit={handleLogin} className="w-full space-y-6">
        {/* Username or Email Input */}
        <div>
          <div className="relative mt-4">
            <input
              type="text"
              id="email"
              placeholder="Enter your username or email"
              value={username}
              onChange={(e) => setUsername(e.target.value)} // Added onChange handler
              className="block w-full pl-10 pr-4 py-2 text-gray-600 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300"
              required
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <div className="relative mt-4">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="block w-full pl-10 pr-10 py-2 text-gray-600 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300"
              required
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <button
              type="button"
              onClick={handlePasswordVisibilityToggle}
              className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500"
            >
              {showPassword ? <AiOutlineEyeInvisible className="h-5 w-5" /> : <AiOutlineEye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div className="flex items-center justify-between">
          <label className="flex items-center text-sm text-gray-600">
            <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
            <span className="ml-2">Remember me</span>
          </label>
          <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
            Forgot password?
          </a>
        </div>

        {/* Login Button with Icon */}
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-all"
        >
          <LogIn className="h-5 w-5" />
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;

