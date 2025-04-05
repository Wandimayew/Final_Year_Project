// app/notifications/page.js
"use client"; // Mark as client component since it uses hooks

import React, { useEffect, useState } from "react";
import NotificationBell from "@/components/notification/NotificationBell";
import { useAuth } from "@/hooks/useAuth";
export const dynamic = "force-dynamic";

const NotificationPage = () => {
  const { auth, loading: authLoading } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      console.log("Auth is still loading...");
      return;
    }

    if (!auth || !auth.token) {
      console.log("No auth or token found.");
      setError("Authentication required to view notifications.");
      setLoading(false);
      return;
    }

    const { schoolId, userId } = auth.user || {};
    if (!schoolId || !userId) {
      console.log("Missing schoolId or userId in auth.user:", auth?.user);
      setError("Incomplete user data.");
      setLoading(false);
      return;
    }

    setLoading(false);
  }, [authLoading, auth]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  const { schoolId, userId } = auth.user;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Notifications</h1>
        <NotificationBell schoolId={schoolId} userId={userId} />
      </div>
    </div>
  );
};

export default NotificationPage;
