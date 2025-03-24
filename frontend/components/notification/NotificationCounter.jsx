// components/notification/NotificationCounter.js
"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";

const API_BASE_URL = "http://localhost:8086/communication/api";

const fetchUnreadNotifications = async ({ schoolId, userId, token }) => {
  const res = await axios.get(
    `${API_BASE_URL}/${schoolId}/notifications/unread`,
    {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    }
  );
  return res.data?.data || [];
};

const NotificationCounter = ({ schoolId, userId }) => {
  const { auth, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [stompClient, setStompClient] = useState(null);

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", schoolId, userId],
    queryFn: () =>
      fetchUnreadNotifications({ schoolId, userId, token: auth?.token }),
    enabled: !authLoading && !!auth?.token && !!schoolId && !!userId,
    staleTime: 10000, // 10s stale time
  });

  useEffect(() => {
    if (!auth?.token || !userId) return;

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
    return () => client.deactivate();
  }, [auth?.token, userId, schoolId]);

  if (!notifications.length) return null;

  return (
    <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-semibold rounded-full min-h-[20px] min-w-[20px] px-1 flex items-center justify-center leading-none">
      {notifications.length}
    </span>
  );
};

export default NotificationCounter;
