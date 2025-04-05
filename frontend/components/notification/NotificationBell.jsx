"use client";
import { useState, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/api/userManagementService/user";

const API_BASE_URL = "http://localhost:8084/communication/api";

const fetchUnreadNotifications = async ({ schoolId, userId, token }) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/${schoolId}/notifications/unread`,
      {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      }
    );
    return response.data.data?.length
      ? response.data.data.map((notif) => ({
          id: notif.notificationId,
          message: notif.message,
          status: notif.status,
        }))
      : [];
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status !== 204)
      throw error;
    return [];
  }
};

const markNotificationAsRead = async ({ notificationId, schoolId, token }) => {
  const response = await axios.post(
    `${API_BASE_URL}/${schoolId}/notifications/mark-read/${notificationId}`,
    {},
    { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
  );
  return response.data;
};

const NotificationBell = ({ schoolId, userId }) => {
  const { auth, loading: authLoading } = useAuth();
  const [stompClient, setStompClient] = useState(null);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  if (!authLoading && !auth?.token) return null;

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
    },
    onSettled: () =>
      queryClient.invalidateQueries(["notifications", schoolId, userId]),
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
      onConnect: () => {
        client.subscribe(`/topic/notifications/${userId}`, (message) => {
          const notification = JSON.parse(message.body);
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
    });
    client.activate();
    setStompClient(client);
    return () => client?.active && client.deactivate();
  }, [authLoading, auth?.token, userId, schoolId, queryClient]);

  const handleMarkAsRead = (notificationId) => {
    if (!notificationId) {
      setError("Invalid notification ID");
      return;
    }
    markAsReadMutation.mutate({ notificationId, schoolId });
  };

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
          const id = notif.id || notif.notificationId;
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
