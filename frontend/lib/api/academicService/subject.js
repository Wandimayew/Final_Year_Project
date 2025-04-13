// lib/subjectService.js
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createApiService } from "@/lib/api";

export const subjectService = createApiService(
  process.env.NEXT_PUBLIC_API_URL_FOR_ACADEMIC || "http://localhost:8086/academic/api"
);

const subjectApi = {
  addNewSubject: async (schoolId, subjectRequest) => {
    const { data } = await subjectService.post(
      `/${schoolId}/addNewSubject`,
      subjectRequest,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return data;
  },

  editSubjectById: async (schoolId, subjectId, subjectRequest) => {
    const { data } = await subjectService.put(
      `/${schoolId}/editSubjectById/${subjectId}`,
      subjectRequest,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return data;
  },

  getAllSubjectByClass: async (schoolId, classId) => {
    const { data } = await subjectService.get(
      `/${schoolId}/getAllSubjectByClass/${classId}`
    );
    return data;
  },

  getAllSubjectsByStream: async (schoolId, streamId) => {
    const { data } = await subjectService.get(
      `/${schoolId}/getAllSubjectsByStream/${streamId}`
    );
    return data;
  },

  getAllSubjectBySchool: async (schoolId) => {
    const { data } = await subjectService.get(
      `/${schoolId}/getAllSubjectBySchool`
    );
    return data;
  },

  getSubjectById: async (schoolId, subjectId) => {
    const { data } = await subjectService.get(
      `/${schoolId}/getSubjectById/${subjectId}`
    );
    return data;
  },

  deleteSubjectById: async (schoolId, subjectId) => {
    const { data } = await subjectService.delete(
      `/${schoolId}/deleteSubjectById/${subjectId}`
    );
    return data;
  },
};

export function useSubjectsByClass(schoolId, classId) {
  return useQuery({
    queryKey: ["subjects", schoolId, classId],
    queryFn: () => subjectApi.getAllSubjectByClass(schoolId, classId),
    enabled: !!schoolId && !!classId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) =>
      console.error(
        `Failed to fetch subjects for class ${classId}:`,
        error.message
      ),
  });
}

export function useSubjectsByStream(schoolId, streamId) {
  return useQuery({
    queryKey: ["subjects", schoolId, streamId],
    queryFn: () => subjectApi.getAllSubjectsByStream(schoolId, streamId),
    enabled: !!schoolId && !!streamId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) =>
      console.error(
        `Failed to fetch subjects for stream ${streamId}:`,
        error.message
      ),
  });
}

export function useSubjectsBySchool(schoolId) {
  return useQuery({
    queryKey: ["subjects", schoolId],
    queryFn: () => subjectApi.getAllSubjectBySchool(schoolId),
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) =>
      console.error(
        `Failed to fetch subjects for school ${schoolId}:`,
        error.message
      ),
  });
}

export function useSubjectById(schoolId, subjectId) {
  return useQuery({
    queryKey: ["subjects", schoolId, subjectId],
    queryFn: () => subjectApi.getSubjectById(schoolId, subjectId),
    enabled: !!schoolId && !!subjectId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) =>
      console.error(`Failed to fetch subject ${subjectId}:`, error.message),
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, subjectRequest }) =>
      subjectApi.addNewSubject(schoolId, subjectRequest),
    onSuccess: (newSubject, { schoolId }) => {
      queryClient.invalidateQueries({ queryKey: ["subjects", schoolId] });
      queryClient.setQueryData(
        ["subjects", schoolId, newSubject.subjectId],
        newSubject
      );
    },
    onError: (error) => console.error("Subject creation failed:", error.message),
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, subjectId, subjectRequest }) =>
      subjectApi.editSubjectById(schoolId, subjectId, subjectRequest),
    onSuccess: (updatedSubject, { schoolId, subjectId }) => {
      queryClient.invalidateQueries({ queryKey: ["subjects", schoolId] });
      queryClient.setQueryData(
        ["subjects", schoolId, subjectId],
        updatedSubject
      );
    },
    onError: (error) => console.error("Subject update failed:", error.message),
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, subjectId }) =>
      subjectApi.deleteSubjectById(schoolId, subjectId),
    onSuccess: (_, { schoolId, subjectId }) => {
      queryClient.invalidateQueries({ queryKey: ["subjects", schoolId] });
      queryClient.removeQueries({ queryKey: ["subjects", schoolId, subjectId] });
    },
    onError: (error) => console.error("Subject deletion failed:", error.message),
  });
}

export { subjectApi };