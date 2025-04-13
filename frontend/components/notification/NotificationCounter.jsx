"use client";

import { useEffect, useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuthStore } from "@/lib/auth";
import { useUnreadNotifications } from "@/lib/api/communicationService/notification";

const NotificationCounter = ({ schoolId, userId }) => {
  const queryClient = useQueryClient();
  const [stompClient, setStompClient] = useState(null);
  const [connectionError, setConnectionError] = useState(null);

  const authState = useMemo(() => {
    const state = useAuthStore.getState();
    return {
      token: state.token,
      loading: state.loading,
    };
  }, []);

  const { token: initialToken, loading: authLoading } = authState;
  const [accessToken, setAccessToken] = useState(initialToken);

  const { data: notifications = [] } = useUnreadNotifications(schoolId, userId, {
    enabled: !authLoading && !!accessToken && !!schoolId && !!userId,
    staleTime: 10000,
  });

  console.log("NotificationCounter notifications:", notifications);

  const connectWebSocket = (tokenToUse) => {
    if (typeof window === "undefined" || !tokenToUse || !userId) return;

    const socketUrl = `http://localhost:8084/notifications?access_token=${tokenToUse}`;
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
            console.error("Failed to parse notification:", err);
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
    if (authLoading || !accessToken || !userId || !schoolId) return;

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
  }, [accessToken, userId, schoolId, queryClient, authLoading]);

  if (authLoading || !accessToken || !notifications.length) return null;

  return (
    <div className="relative">
      {connectionError && (
        <p className="text-red-500 text-xs mt-1">{connectionError}</p>
      )}
      <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-semibold rounded-full min-h-[20px] min-w-[20px] px-1 flex items-center justify-center leading-none">
        {notifications.length}
      </span>
    </div>
  );
};

export default NotificationCounter;