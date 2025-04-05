"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createApiService } from "@/lib/api";

import { communicationService } from "./announcement";
// export const communicationService = createApiService(
//   process.env.NEXT_PUBLIC_API_URL_FOR_COMMUNICATION || "http://localhost:8080/communication/api"
// );

const notificationTemplateApi = {
  getNotificationTemplateById: async (schoolId, templateId) => {
    const { data } = await communicationService.get(`/${schoolId}/getNotificationTemplateById/${templateId}`);
    return data;
  },
  getAllNotificationTemplates: async (schoolId) => {
    const { data } = await communicationService.get(`/${schoolId}/getAllNotificationTemplate`);
    return data;
  },
  createNotificationTemplate: async (schoolId, notificationTemplateRequest) => {
    const { data } = await communicationService.post(`/${schoolId}/createNotificationTemplate`, notificationTemplateRequest);
    return data;
  },
  updateNotificationTemplate: async (schoolId, templateId, notificationTemplateRequest) => {
    const { data } = await communicationService.put(`/${schoolId}/updateNotificationTemplate/${templateId}`, notificationTemplateRequest);
    return data;
  },
  deleteNotificationTemplate: async (schoolId, templateId) => {
    const { data } = await communicationService.delete(`/${schoolId}/deleteNotificationTemplate/${templateId}`);
    return data;
  },
};

export function useNotificationTemplate(schoolId, templateId) {
  return useQuery({
    queryKey: ["notificationTemplates", schoolId, templateId],
    queryFn: () => notificationTemplateApi.getNotificationTemplateById(schoolId, templateId),
    enabled: !!schoolId && !!templateId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) => console.error(`Failed to fetch notification template ${templateId}:`, error.message),
  });
}

export function useAllNotificationTemplates(schoolId) {
  return useQuery({
    queryKey: ["notificationTemplates", schoolId, "all"],
    queryFn: () => notificationTemplateApi.getAllNotificationTemplates(schoolId),
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) => console.error(`Failed to fetch all notification templates for school ${schoolId}:`, error.message),
  });
}

export function useCreateNotificationTemplate(schoolId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationTemplateRequest) => notificationTemplateApi.createNotificationTemplate(schoolId, notificationTemplateRequest),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notificationTemplates", schoolId] });
      queryClient.setQueryData(["notificationTemplates", schoolId, data.data?.id], data.data);
    },
    onError: (error) => console.error("Notification template creation failed:", error.message),
  });
}

export function useUpdateNotificationTemplate(schoolId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ templateId, notificationTemplateRequest }) => notificationTemplateApi.updateNotificationTemplate(schoolId, templateId, notificationTemplateRequest),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notificationTemplates", schoolId] });
      queryClient.setQueryData(["notificationTemplates", schoolId, data.data?.id], data.data);
    },
    onError: (error) => console.error("Notification template update failed:", error.message),
  });
}

export function useDeleteNotificationTemplate(schoolId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templateId) => notificationTemplateApi.deleteNotificationTemplate(schoolId, templateId),
    onSuccess: (_, templateId) => {
      queryClient.invalidateQueries({ queryKey: ["notificationTemplates", schoolId] });
      queryClient.removeQueries({ queryKey: ["notificationTemplates", schoolId, templateId] });
    },
    onError: (error) => console.error("Notification template deletion failed:", error.message),
  });
}