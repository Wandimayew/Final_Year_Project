"use client";

import React, { useState, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

const API_BASE_URL = "http://localhost:8086/communication/api";

// Fetch unread notifications
const fetchUnreadNotifications = async ({ schoolId, userId, token }) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/${schoolId}/notifications/unread`,
      {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      }
    );
    if (
      response.status === 204 ||
      !response.data.data ||
      response.data.data.length === 0
    ) {
      console.log("No unread notifications found");
      return [];
    }
    console.log("API Response Data:", response.data.data);
    return response.data.data.map((notif) => {
      if (!notif.notificationId) {
        console.warn("Notification missing notificationId:", notif);
      }
      return {
        id: notif.notificationId,
        message: notif.message,
        status: notif.status,
      };
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status !== 204) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
    return [];
  }
};

// Mark notification as read
const markNotificationAsRead = async ({ notificationId, schoolId, token }) => {
  console.log("Marking notification as read, ID:", notificationId);
  const response = await axios.post(
    `${API_BASE_URL}/${schoolId}/notifications/mark-read/${notificationId}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    }
  );
  return response.data;
};

const NotificationBell = ({ schoolId, userId }) => {
  const { auth, loading: authLoading } = useAuth();
  const [stompClient, setStompClient] = useState(null);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const {
    data: notifications = [],
    isLoading,
    isError,
    error: queryError,
  } = useQuery({
    queryKey: ["notifications", schoolId, userId],
    queryFn: () =>
      fetchUnreadNotifications({ schoolId, userId, token: auth?.token }),
    enabled: !authLoading && !!auth?.token && !!schoolId && !!userId,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    onSuccess: (data) => {
      console.log("Fetched Notifications:", data);
    },
    onError: (err) => {
      console.error("Query Error:", err);
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: ({ notificationId, schoolId }) =>
      markNotificationAsRead({ notificationId, schoolId, token: auth.token }),
    onMutate: async ({ notificationId }) => {
      await queryClient.cancelQueries(["notifications", schoolId, userId]);
      const previousNotifications = queryClient.getQueryData([
        "notifications",
        schoolId,
        userId,
      ]);
      queryClient.setQueryData(["notifications", schoolId, userId], (old) =>
        old
          ? old.filter(
              (notif) => (notif.id || notif.notificationId) !== notificationId
            )
          : []
      );
      return { previousNotifications };
    },
    onError: (err, { notificationId }, context) => {
      queryClient.setQueryData(
        ["notifications", schoolId, userId],
        context.previousNotifications
      );
      setError("Failed to mark notification as read after retries.");
      console.error("Error marking as read:", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["notifications", schoolId, userId]);
    },
    retry: 2,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (authLoading || !auth?.token || !userId) return;

    const socket = new SockJS(
      `http://localhost:8086/notifications?token=${auth.token}`
    );
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log("WebSocket connected successfully");
        client.subscribe(`/topic/notifications/${userId}`, (message) => {
          const notification = JSON.parse(message.body);
          console.log("Received WebSocket Notification:", notification);
          if (!notification.notificationId) {
            console.warn(
              "WebSocket notification missing notificationId:",
              notification
            );
          }
          queryClient.setQueryData(
            ["notifications", schoolId, userId],
            (old = []) => [
              {
                id: notification.notificationId,
                message: notification.message,
                status: notification.status,
              },
              ...old,
            ]
          );
        });
      },
      onStompError: (error) => {
        console.error("WebSocket STOMP error:", error);
        setError("Failed to connect to notifications service.");
      },
      onDisconnect: () => {
        console.log("WebSocket disconnected");
      },
    });

    client.activate();
    setStompClient(client);

    return () => {
      if (client?.active) client.deactivate();
    };
  }, [authLoading, auth?.token, userId, schoolId, queryClient]);

  const handleMarkAsRead = (notificationId) => {
    if (!notificationId) {
      console.error("Notification ID is undefined, cannot mark as read");
      setError("Invalid notification ID");
      return;
    }
    console.log("Handling mark as read for ID:", notificationId);
    markAsReadMutation.mutate({ notificationId, schoolId });
  };

  console.log("Rendering notifications:", notifications);

  return (
    <div>
      {error && <p className="p-4 text-red-500 text-sm">{error}</p>}
      {isLoading ? (
        <p className="p-4 text-gray-400 text-sm">Loading notifications...</p>
      ) : isError ? (
        <p className="p-4 text-red-500 text-sm">
          {queryError?.response?.data?.message ||
            "Failed to load notifications after retries."}
        </p>
      ) : notifications.length === 0 ? (
        <p className="p-4 text-gray-500 text-sm">No new notifications</p>
      ) : (
        notifications.map((notif) => {
          console.log("Rendering notification:", notif);
          const id = notif.id || notif.notificationId; // Fallback to notificationId
          return (
            <div
              key={id}
              className="p-4 border-b border-gray-100 hover:bg-gray-50"
            >
              <div
                className="text-sm text-gray-800"
                dangerouslySetInnerHTML={{ __html: notif.message }}
              />
              <button
                onClick={() => handleMarkAsRead(id)}
                disabled={
                  markAsReadMutation.isLoading &&
                  markAsReadMutation.variables?.notificationId === id
                }
                className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:bg-gray-400"
              >
                {markAsReadMutation.isLoading &&
                markAsReadMutation.variables?.notificationId === id
                  ? "Marking..."
                  : "Mark as Read"}
              </button>
            </div>
          );
        })
      )}
    </div>
  );
};

export default NotificationBell;
