"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createApiService } from "@/lib/api";

import { communicationService } from "./announcement";
// export const communicationService = createApiService(
//   process.env.NEXT_PUBLIC_API_URL_FOR_COMMUNICATION || "http://localhost:8080/communication/api"
// );

const notificationApi = {
  getNotificationById: async (schoolId, notificationId) => {
    const { data } = await communicationService.get(`/${schoolId}/getNotificationById/${notificationId}`);
    return data;
  },
  getAllNotifications: async (schoolId) => {
    const { data } = await communicationService.get(`/${schoolId}/getAllNotification`);
    return data;
  },
  createNotification: async (schoolId, notificationRequest) => {
    const { data } = await communicationService.post(`/${schoolId}/createNotification`, notificationRequest);
    return data;
  },
  updateNotification: async (schoolId, notificationId, notificationRequest) => {
    const { data } = await communicationService.put(`/${schoolId}/updateNotification/${notificationId}`, notificationRequest);
    return data;
  },
  deleteNotification: async (schoolId, notificationId) => {
    const { data } = await communicationService.delete(`/${schoolId}/deleteNotification/${notificationId}`);
    return data;
  },
  getUnreadNotifications: async (schoolId) => {
    const { data } = await communicationService.get(`/${schoolId}/notifications/unread`);
    return data;
  },
  markNotificationAsRead: async (schoolId, notificationId) => {
    const { data } = await communicationService.post(`/${schoolId}/mark-read/notifications/${notificationId}`);
    return data;
  },
};

export function useNotification(schoolId, notificationId) {
  return useQuery({
    queryKey: ["notifications", schoolId, notificationId],
    queryFn: () => notificationApi.getNotificationById(schoolId, notificationId),
    enabled: !!schoolId && !!notificationId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) => console.error(`Failed to fetch notification ${notificationId}:`, error.message),
  });
}

export function useAllNotifications(schoolId) {
  return useQuery({
    queryKey: ["notifications", schoolId, "all"],
    queryFn: () => notificationApi.getAllNotifications(schoolId),
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) => console.error(`Failed to fetch all notifications for school ${schoolId}:`, error.message),
  });
}

export function useCreateNotification(schoolId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationRequest) => notificationApi.createNotification(schoolId, notificationRequest),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notifications", schoolId] });
      queryClient.setQueryData(["notifications", schoolId, data.data?.id], data.data);
    },
    onError: (error) => console.error("Notification creation failed:", error.message),
  });
}

export function useUpdateNotification(schoolId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ notificationId, notificationRequest }) => notificationApi.updateNotification(schoolId, notificationId, notificationRequest),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notifications", schoolId] });
      queryClient.setQueryData(["notifications", schoolId, data.data?.id], data.data);
    },
    onError: (error) => console.error("Notification update failed:", error.message),
  });
}

export function useDeleteNotification(schoolId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId) => notificationApi.deleteNotification(schoolId, notificationId),
    onSuccess: (_, notificationId) => {
      queryClient.invalidateQueries({ queryKey: ["notifications", schoolId] });
      queryClient.removeQueries({ queryKey: ["notifications", schoolId, notificationId] });
    },
    onError: (error) => console.error("Notification deletion failed:", error.message),
  });
}

export function useUnreadNotifications(schoolId) {
  return useQuery({
    queryKey: ["notifications", schoolId, "unread"],
    queryFn: () => notificationApi.getUnreadNotifications(schoolId),
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) => console.error(`Failed to fetch unread notifications for school ${schoolId}:`, error.message),
  });
}

export function useMarkNotificationAsRead(schoolId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId) => notificationApi.markNotificationAsRead(schoolId, notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", schoolId] });
    },
    onError: (error) => console.error("Marking notification as read failed:", error.message),
  });
}