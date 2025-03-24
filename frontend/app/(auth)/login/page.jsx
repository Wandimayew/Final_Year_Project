"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import schoolLogo from "@/public/schoolLogo.svg";
import Image from "next/image";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useAuth } from "@/lib/api/userManagementService/user";

const Login = ({ setLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const router = useRouter();
  const { login, isLoading, error } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    await login(credentials, {
      onSuccess: () => router.push("/dashboard"),
      onError: (err) => console.error("Login error:", err),
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 to-blue-600 p-8">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full">
        <div
          onClick={() => setLogin(false)}
          className="w-24 mx-auto mb-6 cursor-pointer"
        >
          <Image
            src={schoolLogo}
            alt="School Logo"
            width={96}
            height={96}
            className="rounded-full"
          />
        </div>
        <h2 className="text-center text-3xl font-semibold text-gray-800 mb-6">
          Welcome Back!
        </h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="text-sm font-medium text-gray-700 block"
            >
              Username or Email
            </label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter your username or email"
              value={credentials.username}
              onChange={handleInputChange}
              className="mt-2 block w-full px-4 py-3 text-gray-800 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 transition-all duration-200 hover:ring-2 hover:ring-blue-300"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700 block"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="mt-2 block w-full px-4 py-3 text-gray-800 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 transition-all duration-200 hover:ring-2 hover:ring-blue-300"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-blue-600"
                disabled={isLoading}
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible className="h-5 w-5" />
                ) : (
                  <AiOutlineEye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm text-gray-600">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                disabled={isLoading}
              />
              <span className="ml-2">Remember me</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          {error && (
            <Typography color="error" sx={{ textAlign: "center" }}>
              {error.message || "Login failed. Please check your credentials."}
            </Typography>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-full hover:bg-blue-700 transition-all duration-300 ease-in-out disabled:bg-blue-400"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
