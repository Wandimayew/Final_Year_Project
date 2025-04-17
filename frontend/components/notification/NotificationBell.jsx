"use client";

import { useState, useEffect, useMemo } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/auth";
import {
  useUnreadNotifications,
  useMarkNotificationAsRead,
} from "@/lib/api/communicationService/notification";

const NotificationBell = ({ schoolId, userId }) => {
  const [stompClient, setStompClient] = useState(null);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const authState = useMemo(() => {
    const state = useAuthStore.getState();
    return {
      token: state.token,
      loading: state.loading,
    };
  }, []);

  const { token: initialToken, loading: authLoading } = authState;
  const [accessToken, setAccessToken] = useState(initialToken);

  if (authLoading || !accessToken) return null;

  const {
    data: notifications = [],
    isLoading,
    isError,
  } = useUnreadNotifications(schoolId, userId, {
    enabled: !!accessToken && !!schoolId && !!userId,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });

  console.log("NotificationBell notifications:", notifications);

  const connectWebSocket = (tokenToUse) => {
    if (typeof window === "undefined" || !tokenToUse || !userId) return;

    const socketUrl = `http://192.168.1.98:8080/notifications?access_token=${tokenToUse}`;
    console.log("Initializing SockJS with URL:", socketUrl);
    const socket = new SockJS(socketUrl);

    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      // debug: (str) => console.log("STOMP Debug:", str),
      beforeConnect: () => {
        console.log("Attempting WebSocket connection with token");
      },
      onConnect: (frame) => {
        console.log("WebSocket connected:", frame);
        client.subscribe(`/topic/notifications.${userId}`, (message) => {
          console.log("Received message:", message.body);
          try {
            const notification = JSON.parse(message.body);
            if (!notification.notificationId) {
              console.error("Invalid notification: missing notificationId");
              return;
            }
            queryClient.setQueryData(
              ["notifications", schoolId, userId, "unread"], // Updated queryKey
              (old = []) => {
                if (old.some((n) => n.notificationId === notification.notificationId)) {
                  return old;
                }
                return [
                  {
                    notificationId: notification.notificationId,
                    message: notification.message,
                    status: notification.status,
                  },
                  ...old,
                ];
              }
            );
          } catch (err) {
            console.error(
              "Failed to parse notification:",
              err,
              "Raw body:",
              message.body
            );
          }
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
      },
      onWebSocketError: (error) => {
        console.error("WebSocket error:", error);
      },
      onWebSocketClose: (event) => {
        console.log("WebSocket closed:", event);
      },
      onDisconnect: () => {
        console.log("WebSocket disconnected");
      },
    });

    client.activate();
    setStompClient(client);
  };

  useEffect(() => {
    if (!accessToken || !userId || !schoolId) return;

    connectWebSocket(accessToken);

    const unsubscribe = useAuthStore.subscribe(
      (state) => state.token,
      (newToken, oldToken) => {
        if (newToken && newToken !== oldToken) {
          console.log("Token updated, reconnecting WebSocket");
          setAccessToken(newToken);
          if (stompClient?.active) stompClient.deactivate();
          connectWebSocket(newToken);
        }
      }
    );

    return () => {
      unsubscribe();
      if (stompClient?.active) {
        stompClient.deactivate();
        console.log("WebSocket client deactivated");
      }
    };
  }, [accessToken, userId, schoolId, queryClient]);

  const markAsReadMutation = useMarkNotificationAsRead(schoolId, userId);

  const handleMarkAsRead = (notificationId) => {
    if (!notificationId) {
      setError("Invalid notification ID");
      return;
    }
    markAsReadMutation.mutate(notificationId, {
      onSuccess: () => {
        console.log("Marking notification as read, ID:", notificationId);
        queryClient.setQueryData(
          ["notifications", schoolId, userId, "unread"], // Updated queryKey
          (old = []) => {
            const updated = old.filter((notif) => notif.notificationId !== notificationId);
            console.log("Updated unread notifications:", updated);
            return updated;
          }
        );
      },
      onError: () => setError("Failed to mark notification as read"),
    });
  };

  return (
    <div>
      {error && <p className="p-4 text-red-500 text-sm">{error}</p>}
      {isLoading ? (
        <p className="p-4 text-gray-400 text-sm">Loading notifications...</p>
      ) : isError ? (
        <p className="p-4 text-red-500 text-sm">Failed to load notifications</p>
      ) : notifications.length === 0 ? (
        <p className="p-4 text-gray-500 text-sm">No new notifications</p>
      ) : (
        notifications.map((notif) => (
          <div
            key={notif.notificationId}
            className="p-4 border-b border-gray-100 hover:bg-gray-50"
          >
            <div
              className="text-sm text-gray-800"
              dangerouslySetInnerHTML={{ __html: notif.message }}
            />
            <button
              onClick={() => handleMarkAsRead(notif.notificationId)}
              disabled={
                markAsReadMutation.isLoading &&
                markAsReadMutation.variables === notif.notificationId
              }
              className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {markAsReadMutation.isLoading &&
              markAsReadMutation.variables === notif.notificationId
                ? "Marking..."
                : "Mark as Read"}
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default NotificationBell;