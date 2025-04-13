"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createApiService } from "@/lib/api";

export const communicationService = createApiService(
  process.env.NEXT_PUBLIC_API_URL_FOR_COMMUNICATION ||
    "http://localhost:8080/communication/api"
);

const announcementApi = {
  getAnnouncementById: async (schoolId, announcementId) => {
    const { data } = await communicationService.get(
      `/${schoolId}/getAnnouncementById/${announcementId}`
    );
    return data;
  },
  getAllAnnouncements: async (schoolId) => {
    const { data } = await communicationService.get(
      `/${schoolId}/getAllAnnouncements`
    );
    return data;
  },
  createAnnouncement: async (schoolId, announcementRequest) => {
    const { data } = await communicationService.post(
      `/${schoolId}/createAnnouncement`,
      announcementRequest
    );
    return data;
  },
  updateAnnouncement: async (schoolId, announcementId, announcementRequest) => {
    const { data } = await communicationService.put(
      `/${schoolId}/updateAnnouncement/${announcementId}`,
      announcementRequest
    );
    return data;
  },
  approveAnnouncement: async (schoolId, announcementId) => {
    const { data } = await communicationService.put(
      `/${schoolId}/approveAnnouncement/${announcementId}/approve`
    );
    return data;
  },
  requestApproveAnnouncement: async (schoolId, announcementId) => {
    const { data } = await communicationService.put(
      `/${schoolId}/requestApprove/${announcementId}/request-approval`
    );
    return data;
  },
  getAllRequestApproval: async (schoolId) => {
    const { data } = await communicationService.get(
      `/${schoolId}/getAllRequestApproval/pending-approval`
    );
    return data;
  },
  getCreatorPendingAnnouncements: async (schoolId) => {
    const { data } = await communicationService.get(
      `/${schoolId}/announcements/creator-pending`
    );
    return data;
  },
  getMyAnnouncements: async (
    schoolId,
    { page = 0, size = 10, sort = "createdAt,desc" }
  ) => {
    const { data } = await communicationService.get(
      `/${schoolId}/announcements/my-announcements?page=${page}&size=${size}&sort=${sort}`
    );
    return data;
  },
  getMyAnnouncementsDraft: async (
    schoolId,
    { page = 0, size = 10, sort = "createdAt,desc" }
  ) => {
    const { data } = await communicationService.get(
      `/${schoolId}/announcements/my-announcements/status-draft?page=${page}&size=${size}&sort=${sort}`
    );
    return data;
  },
  cancelAnnouncement: async (schoolId, announcementId, rejectionReason) => {
    const { data } = await communicationService.put(
      `/${schoolId}/cancelAnnouncement/${announcementId}/cancel`,
      rejectionReason ? { rejectionReason } : {}
    );
    return data;
  },
  updateAnnouncementStatus: async (schoolId, announcementId, status) => {
    const { data } = await communicationService.put(
      `/${schoolId}/updateAnnouncementStatus/${announcementId}/status`,
      null,
      { params: { status } }
    );
    return data;
  },
  deleteAnnouncement: async (schoolId, announcementId) => {
    const { data } = await communicationService.delete(
      `/${schoolId}/deleteAnnouncement/${announcementId}`
    );
    return data;
  },
};

export function useAnnouncement(schoolId, announcementId) {
  return useQuery({
    queryKey: ["announcements", schoolId, announcementId],
    queryFn: () =>
      announcementApi.getAnnouncementById(schoolId, announcementId),
    enabled: !!schoolId && !!announcementId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) =>
      console.error(
        `Failed to fetch announcement ${announcementId}:`,
        error.message
      ),
  });
}

export function useAllAnnouncements(schoolId) {
  return useQuery({
    queryKey: ["announcements", schoolId, "all"],
    queryFn: () => announcementApi.getAllAnnouncements(schoolId),
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) =>
      console.error(
        `Failed to fetch all announcements for school ${schoolId}:`,
        error.message
      ),
  });
}

export function useCreateAnnouncement(schoolId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (announcementRequest) =>
      announcementApi.createAnnouncement(schoolId, announcementRequest),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["announcements", schoolId] });
      queryClient.setQueryData(
        ["announcements", schoolId, data.data?.id],
        data.data
      );
    },
    onError: (error) =>
      console.error("Announcement creation failed:", error.message),
  });
}

export function useUpdateAnnouncement(schoolId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ announcementId, announcementRequest }) =>
      announcementApi.updateAnnouncement(
        schoolId,
        announcementId,
        announcementRequest
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["announcements", schoolId] });
      queryClient.setQueryData(
        ["announcements", schoolId, data.data?.id],
        data.data
      );
    },
    onError: (error) =>
      console.error("Announcement update failed:", error.message),
  });
}

export function useApproveAnnouncement(schoolId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (announcementId) =>
      announcementApi.approveAnnouncement(schoolId, announcementId),
    onSuccess: (data) => {
      // No invalidation; rely on component's optimistic update
      queryClient.setQueryData(
        ["announcements", schoolId, data.data?.id],
        data.data
      );
    },
    onError: (error) =>
      console.error("Announcement approval failed:", error.message),
  });
}

export function useCancelAnnouncement(schoolId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ announcementId, rejectionReason }) =>
      announcementApi.cancelAnnouncement(
        schoolId,
        announcementId,
        rejectionReason
      ),
    onSuccess: (data) => {
      // No invalidation; rely on component's optimistic update
      queryClient.setQueryData(
        ["announcements", schoolId, data.data?.id],
        data.data
      );
    },
    onError: (error) =>
      console.error("Announcement cancellation failed:", error.message),
  });
}

export function useRequestApproveAnnouncement(schoolId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (announcementId) =>
      announcementApi.requestApproveAnnouncement(schoolId, announcementId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["announcements", schoolId] });
      queryClient.setQueryData(
        ["announcements", schoolId, data.data?.id],
        data.data
      );
    },
    onError: (error) =>
      console.error("Request approval failed:", error.message),
  });
}

export function useAllPendingApprovals(schoolId) {
  return useQuery({
    queryKey: ["announcements", schoolId, "pending-approval"],
    queryFn: () => announcementApi.getAllRequestApproval(schoolId),
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) =>
      console.error(
        `Failed to fetch pending approvals for school ${schoolId}:`,
        error.message
      ),
  });
}

export function useCreatorPendingAnnouncements(schoolId) {
  return useQuery({
    queryKey: ["announcements", schoolId, "creator-pending"],
    queryFn: () => announcementApi.getCreatorPendingAnnouncements(schoolId),
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) =>
      console.error(
        `Failed to fetch creator pending announcements for school ${schoolId}:`,
        error.message
      ),
  });
}

export function useMyAnnouncements(
  schoolId,
  pagination = { page: 0, size: 10, sort: "createdAt,desc" }
) {
  return useQuery({
    queryKey: ["announcements", schoolId, "my-announcements", pagination],
    queryFn: () => announcementApi.getMyAnnouncements(schoolId, pagination),
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) =>
      console.error(
        `Failed to fetch my announcements for school ${schoolId}:`,
        error.message
      ),
  });
}

export function useMyDraftAnnouncements(
  schoolId,
  pagination = { page: 0, size: 10, sort: "createdAt,desc" }
) {
  return useQuery({
    queryKey: ["announcements", schoolId, "my-drafts", pagination],
    queryFn: () =>
      announcementApi.getMyAnnouncementsDraft(schoolId, pagination),
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) =>
      console.error(
        `Failed to fetch my drafts for school ${schoolId}:`,
        error.message
      ),
  });
}

// export function useCancelAnnouncement(schoolId) {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: ({ announcementId, rejectionReason }) =>
//       announcementApi.cancelAnnouncement(
//         schoolId,
//         announcementId,
//         rejectionReason
//       ),
//     onSuccess: (data) => {
//       queryClient.invalidateQueries({ queryKey: ["announcements", schoolId] });
//       queryClient.setQueryData(
//         ["announcements", schoolId, data.data?.id],
//         data.data
//       );
//     },
//     onError: (error) =>
//       console.error("Announcement cancellation failed:", error.message),
//   });
// }

export function useUpdateAnnouncementStatus(schoolId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ announcementId, status }) =>
      announcementApi.updateAnnouncementStatus(
        schoolId,
        announcementId,
        status
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["announcements", schoolId] });
      queryClient.setQueryData(
        ["announcements", schoolId, data.data?.id],
        data.data
      );
    },
    onError: (error) => console.error("Status update failed:", error.message),
  });
}

export function useDeleteAnnouncement(schoolId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (announcementId) =>
      announcementApi.deleteAnnouncement(schoolId, announcementId),
    onSuccess: (_, announcementId) => {
      queryClient.invalidateQueries({ queryKey: ["announcements", schoolId] });
      queryClient.removeQueries({
        queryKey: ["announcements", schoolId, announcementId],
      });
    },
    onError: (error) =>
      console.error("Announcement deletion failed:", error.message),
  });
}
