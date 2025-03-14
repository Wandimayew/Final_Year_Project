"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import schoolLogo from "@/public/schoolLogo.svg";
import Image from "next/image";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import axios from "axios";
import Typography from '@mui/material/Typography';


const Login = ({ setLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handlePasswordVisibilityToggle = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      console.log(
        "Logging in with username:",
        username,
        "and password:",
        password
      );
      const response = await axios.post(
        "http://localhost:8082/api/auth/login",
        {
          username,
          password,
        }
      );

      if (response.status === 200) {
        const {
          token,
          username: userName,
          email,
          roles,
          userId,
          schoolId,
        } = response.data;
        const user = { name: userName, email, role: roles, userId, schoolId };
        const authData = { token, user };

        localStorage.setItem("auth-store", JSON.stringify(authData));
        console.log("Login successful:", response.data);
        router.push("/dashboard");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
      console.error("Login error:", error);
    }
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
              placeholder="Enter your username or email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 block w-full px-4 py-3 text-gray-800 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 transition-all duration-200 hover:ring-2 hover:ring-blue-300"
              required
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="mt-2 block w-full px-4 py-3 text-gray-800 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 transition-all duration-200 hover:ring-2 hover:ring-blue-300"
                required
              />
              <button
                type="button"
                onClick={handlePasswordVisibilityToggle}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-blue-600"
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
              />
              <span className="ml-2">Remember me</span>
            </label>
            <a
              href="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </a>
          </div>

          {error && (
            <Typography color="error" sx={{ textAlign: "center" }}>
              {error}
            </Typography>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-full hover:bg-blue-700 transition-all duration-300 ease-in-out"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
