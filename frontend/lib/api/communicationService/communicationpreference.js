"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createApiService } from "@/lib/api";
import { communicationService } from "./announcement";

// export const communicationService = createApiService(
//   process.env.NEXT_PUBLIC_API_URL_FOR_COMMUNICATION ||
//     "http://localhost:8080/communication/api"
// );

const communicationPreferenceApi = {
  getCommunicationPreferenceById: async (
    schoolId,
    communicationPreferenceId
  ) => {
    const { data } = await communicationService.get(
      `/${schoolId}/getCommunicationPreferenceById/${communicationPreferenceId}`
    );
    return data;
  },
  getCommunicationPreferenceByUserId: async (schoolId) => {
    const { data } = await communicationService.get(
      `/${schoolId}/getCommunicationPreferenceByUserId`
    );
    return data;
  },
  getAllCommunicationPreferences: async (schoolId) => {
    const { data } = await communicationService.get(
      `/${schoolId}/getAllCommunicationPreference`
    );
    return data;
  },
  createCommunicationPreference: async (
    schoolId,
    communicationPreferenceRequest
  ) => {
    const { data } = await communicationService.post(
      `/${schoolId}/createCommunicationPreference`,
      communicationPreferenceRequest
    );
    return data;
  },
  updateCommunicationPreference: async (
    schoolId,
    userId,
    communicationPreferenceRequest
  ) => {
    const { data } = await communicationService.put(
      `/${schoolId}/updateCommunicationPreference/${userId}`,
      communicationPreferenceRequest
    );
    return data;
  },
  deleteCommunicationPreference: async (
    schoolId,
    communicationPreferenceId
  ) => {
    const { data } = await communicationService.delete(
      `/${schoolId}/deleteCommunicationPreference/${communicationPreferenceId}`
    );
    return data;
  },
};

export function useCommunicationPreference(
  schoolId,
  communicationPreferenceId
) {
  return useQuery({
    queryKey: ["communicationPreferences", schoolId, communicationPreferenceId],
    queryFn: () =>
      communicationPreferenceApi.getCommunicationPreferenceById(
        schoolId,
        communicationPreferenceId
      ),
    enabled: !!schoolId && !!communicationPreferenceId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) =>
      console.error(
        `Failed to fetch communication preference ${communicationPreferenceId}:`,
        error.message
      ),
  });
}

export function useCommunicationPreferenceByUser(schoolId) {
  return useQuery({
    queryKey: ["communicationPreferences", schoolId, "user"],
    queryFn: () =>
      communicationPreferenceApi.getCommunicationPreferenceByUserId(schoolId),
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) =>
      console.error(
        `Failed to fetch communication preference for user in school ${schoolId}:`,
        error.message
      ),
  });
}

export function useAllCommunicationPreferences(schoolId) {
  return useQuery({
    queryKey: ["communicationPreferences", schoolId, "all"],
    queryFn: () =>
      communicationPreferenceApi.getAllCommunicationPreferences(schoolId),
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) =>
      console.error(
        `Failed to fetch all communication preferences for school ${schoolId}:`,
        error.message
      ),
  });
}

export function useCreateCommunicationPreference(schoolId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (communicationPreferenceRequest) =>
      communicationPreferenceApi.createCommunicationPreference(
        schoolId,
        communicationPreferenceRequest
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["communicationPreferences", schoolId],
      });
      queryClient.setQueryData(
        ["communicationPreferences", schoolId, data.data?.id],
        data.data
      );
    },
    onError: (error) =>
      console.error("Communication preference creation failed:", error.message),
  });
}

export function useUpdateCommunicationPreference(schoolId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, communicationPreferenceRequest }) =>
      communicationPreferenceApi.updateCommunicationPreference(
        schoolId,
        userId,
        communicationPreferenceRequest
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["communicationPreferences", schoolId],
      });
      queryClient.setQueryData(
        ["communicationPreferences", schoolId, data.data?.id],
        data.data
      );
    },
    onError: (error) =>
      console.error("Communication preference update failed:", error.message),
  });
}

export function useDeleteCommunicationPreference(schoolId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (communicationPreferenceId) =>
      communicationPreferenceApi.deleteCommunicationPreference(
        schoolId,
        communicationPreferenceId
      ),
    onSuccess: (_, communicationPreferenceId) => {
      queryClient.invalidateQueries({
        queryKey: ["communicationPreferences", schoolId],
      });
      queryClient.removeQueries({
        queryKey: [
          "communicationPreferences",
          schoolId,
          communicationPreferenceId,
        ],
      });
    },
    onError: (error) =>
      console.error("Communication preference deletion failed:", error.message),
  });
}
