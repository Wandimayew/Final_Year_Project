// lib/streamService.js
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createApiService } from "@/lib/api";

export const streamService = createApiService(
  process.env.NEXT_PUBLIC_API_URL_FOR_ACADEMIC || "http://localhost:8086/academic/api"
);

const streamApi = {
  addNewStream: async (schoolId, streamRequest) => {
    const { data } = await streamService.post(
      `/${schoolId}/addNewStream`,
      streamRequest,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return data;
  },
  editStreamById: async (schoolId, streamId, streamRequest) => {
    const { data } = await streamService.put(
      `/${schoolId}/editStreamById/${streamId}`,
      streamRequest,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return data;
  },
  getAllStreamBySchool: async (schoolId) => {
    const { data } = await streamService.get(`/${schoolId}/getAllStreamBySchool`);
    return data;
  },
  getStreamById: async (schoolId, streamId) => {
    const { data } = await streamService.get(`/${schoolId}/getStreamById/${streamId}`);
    return data;
  },
  deleteStreamById: async (schoolId, streamId) => {
    const { data } = await streamService.delete(`/${schoolId}/deleteStreamById/${streamId}`);
    return data;
  },
};

export function useStreams(schoolId) {
  console.log("fetching streams");
  return useQuery({
    queryKey: ["streams", schoolId],
    queryFn: () => streamApi.getAllStreamBySchool(schoolId),
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) =>
      console.error(`Failed to fetch streams for school ${schoolId}:`, error.message),
  });
}

export function useStream(schoolId, streamId) {
  
  return useQuery({
    queryKey: ["streams", schoolId, streamId],
    queryFn: () => streamApi.getStreamById(schoolId, streamId),
    enabled: !!schoolId && !!streamId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) =>
      console.error(`Failed to fetch stream ${streamId}:`, error.message),
  });
}

export function useCreateStream() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, streamRequest }) =>
      streamApi.addNewStream(schoolId, streamRequest),
    onSuccess: (newStream, { schoolId }) => {
      queryClient.invalidateQueries({ queryKey: ["streams", schoolId] });
      // Assuming StreamResponse has a streamId field
      queryClient.setQueryData(
        ["streams", schoolId, newStream.streamId],
        newStream
      );
    },
    onError: (error) =>
      console.error("Stream creation failed:", error.message),
  });
}

export function useUpdateStream() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, streamId, streamRequest }) =>
      streamApi.editStreamById(schoolId, streamId, streamRequest),
    onSuccess: (updatedStream, { schoolId, streamId }) => {
      queryClient.invalidateQueries({ queryKey: ["streams", schoolId] });
      queryClient.setQueryData(
        ["streams", schoolId, streamId],
        updatedStream
      );
    },
    onError: (error) => console.error("Stream update failed:", error.message),
  });
}

export function useDeleteStream() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, streamId }) =>
      streamApi.deleteStreamById(schoolId, streamId),
    onSuccess: (_, { schoolId, streamId }) => {
      queryClient.invalidateQueries({ queryKey: ["streams", schoolId] });
      queryClient.removeQueries({
        queryKey: ["streams", schoolId, streamId],
      });
    },
    onError: (error) =>
      console.error("Stream deletion failed:", error.message),
  });
}

export { streamApi };