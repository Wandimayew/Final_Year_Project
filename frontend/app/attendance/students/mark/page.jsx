"use client";

import { useSearchParams } from "next/navigation";
import { useMarkAttendanceWithToken } from "@/lib/api/studentService/attendances";
import { useEffect, useState } from "react";

const MarkAttendance = () => {
  const searchParams = useSearchParams();
  const token = searchParams ? searchParams.get("token") : null;
  const { mutateAsync: markAttendance } = useMarkAttendanceWithToken();
  const [status, setStatus] = useState("idle"); // "idle", "loading", "success", "error"
  const [message, setMessage] = useState("");

  useEffect(() => {
    const markAttendanceWithToken = async () => {
      if (!token) {
        setStatus("error");
        setMessage("No attendance token found in URL");
        return;
      }

      try {
        setStatus("loading");
        await markAttendance(token);
        setStatus("success");
        setMessage("Your attendance has been successfully recorded!");
      } catch (error) {
        setStatus("error");
        setMessage(error.message || "Failed to mark attendance. Please try again.");
        console.error("Attendance error:", error);
      }
    };

    markAttendanceWithToken();
  }, [token, markAttendance]);

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Processing your attendance...</p>
          </div>
        );
      
      case "success":
        return (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Success!</h2>
            <p className="text-center text-gray-600">{message}</p>
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              Token: {token}
            </div>
          </div>
        );
      
      case "error":
        return (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Error</h2>
            <p className="text-center text-gray-600">{message}</p>
            {token && (
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                Token: {token}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Try Again
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 p-6">
          <h1 className="text-2xl font-bold text-white text-center">
            Attendance System
          </h1>
        </div>
        
        <div className="p-6">
          {renderContent()}
          
          <div className="mt-8 pt-4 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              Need help? Contact <a href="mailto:support@school.edu" className="text-blue-600 hover:underline">support@school.edu</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkAttendance;