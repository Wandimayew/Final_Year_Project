"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createApiService } from "@/lib/api";
import { communicationService } from "./announcement";

// export const communicationService = createApiService(
//   process.env.NEXT_PUBLIC_API_URL_FOR_COMMUNICATION || "http://localhost:8080/communication/api"
// );

const emailApi = {
  composeEmail: async (schoolId, emailRequest, attachments, send) => {
    const formData = new FormData();
    formData.append("recipientId", emailRequest.recipientId || "");
    formData.append("subject", emailRequest.subject || "");
    formData.append("body", emailRequest.body || "");
    formData.append("templateId", emailRequest.templateId || ""); // Will be null if empty
    if (attachments) {
      attachments.forEach((file) => formData.append("attachments", file));
    }
    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
    const { data } = await communicationService.post(
      `/${schoolId}/compose`,
      formData,
      {
        params: { send },
      }
    );
    return data;
  },
  getEmailsByFolder: async (
    schoolId,
    folder,
    { page = 0, size = 10, sort = "sentAt,desc" }
  ) => {
    const { data } = await communicationService.get(
      `/${schoolId}/getEmailsByFolder/${folder}?page=${page}&size=${size}&sort=${sort}`
    );
    return data;
  },
  getEmailsById: async (schoolId, emailId) => {
    const { data } = await communicationService.get(
      `/${schoolId}/getEmailsById/detail/${emailId}`
    );
    return data;
  },
  updateEmailStatus: async (schoolId, emailId, status) => {
    const { data } = await communicationService.put(
      `/${schoolId}/updateEmailStatus/${emailId}/status`,
      { status }
    );
    return data;
  },
  markEmailAsRead: async (schoolId, emailId) => {
    const { data } = await communicationService.put(
      `/${schoolId}/markEmailAsRead/${emailId}/read`
    );
    return data;
  },
  deleteEmail: async (schoolId, emailId) => {
    const { data } = await communicationService.delete(
      `/${schoolId}/deleteEmail/${emailId}`
    );
    return data;
  },
};

export function useComposeEmail(schoolId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ emailRequest, attachments, send }) =>
      emailApi.composeEmail(schoolId, emailRequest, attachments, send),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["emails", schoolId] });
    },
    onError: (error) =>
      console.error("Email composition failed:", error.message),
  });
}

export function useEmailsByFolder(
  schoolId,
  folder,
  pagination = { page: 0, size: 10, sort: "sentAt,desc" }
) {
  console.log("useEmailsByFolder called with:", {
    schoolId,
    folder,
    pagination,
  });
  return useQuery({
    queryKey: ["emails", schoolId, folder, pagination],
    queryFn: () => {
      console.log("Fetching emails for:", { schoolId, folder });
      return emailApi.getEmailsByFolder(schoolId, folder, pagination);
    },
    enabled: !!schoolId && !!folder,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) =>
      console.error(
        `Failed to fetch emails for folder ${folder} in school ${schoolId}:`,
        error.message
      ),
  });
}

export function useEmailById(schoolId, emailId) {
  return useQuery({
    queryKey: ["emails", schoolId, emailId],
    queryFn: () => emailApi.getEmailsById(schoolId, emailId),
    enabled: !!schoolId && !!emailId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) =>
      console.error(
        `Failed to fetch email ${emailId} for school ${schoolId}:`,
        error.message
      ),
  });
}

export function useUpdateEmailStatus(schoolId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ emailId, status }) =>
      emailApi.updateEmailStatus(schoolId, emailId, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["emails", schoolId] });
      queryClient.setQueryData(["emails", schoolId, data.data?.id], data.data);
    },
    onError: (error) =>
      console.error("Email status update failed:", error.message),
  });
}

export function useMarkEmailAsRead(schoolId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (emailId) => emailApi.markEmailAsRead(schoolId, emailId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["emails", schoolId] });
      queryClient.setQueryData(["emails", schoolId, data.data?.id], data.data);
    },
    onError: (error) =>
      console.error("Marking email as read failed:", error.message),
  });
}

export function useDeleteEmail(schoolId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (emailId) => emailApi.deleteEmail(schoolId, emailId),
    onSuccess: (_, emailId) => {
      queryClient.invalidateQueries({ queryKey: ["emails", schoolId] });
      queryClient.removeQueries({ queryKey: ["emails", schoolId, emailId] });
    },
    onError: (error) => console.error("Email deletion failed:", error.message),
  });
}
