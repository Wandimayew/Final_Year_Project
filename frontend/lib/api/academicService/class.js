// lib/classService.js
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createApiService } from "@/lib/api";

export const classService = createApiService(
  process.env.NEXT_PUBLIC_API_URL_FOR_ACADEMIC || "http://localhost:8086/academic/api"
);

const classApi = {
  addNewClass: async (schoolId, classRequest) => {
    const { data } = await classService.post(
      `/${schoolId}/addNewClass`,
      classRequest,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return data;
  },
  editClassById: async (schoolId, classId, classRequest) => {
    const { data } = await classService.put(
      `/${schoolId}/editClassById/${classId}`,
      classRequest,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return data;
  },
  editStatus: async (schoolId, classId) => {
    const { data } = await classService.put(
      `/${schoolId}/editStatus/${classId}`,
      null, // No request body needed
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return data;
  },
  getAllClassBySchool: async (schoolId) => {
    const { data } = await classService.get(`/${schoolId}/getAllClassBySchool`);
    return data;
  },
  getAllClassByStream: async (schoolId, streamId) => {
    const { data } = await classService.get(
      `/${schoolId}/getAllClassByStream/${streamId}`
    );
    return data;
  },
  getClassById: async (schoolId, classId) => {
    const { data } = await classService.get(`/${schoolId}/getClassById/${classId}`);
    return data;
  },
  getClassDetails: async (schoolId, classId) => {
    const { data } = await classService.get(`/${schoolId}/getClassDetails/${classId}`);
    return data;
  },
  deleteClassById: async (schoolId, classId) => {
    const { data } = await classService.delete(`/${schoolId}/deleteClassById/${classId}`);
    return data;
  },
  assignSubjectsToClass: async (schoolId, classId, subjectIds) => {
    const { data } = await classService.post(
      `/${schoolId}/assign-subjects/${classId}`,
      subjectIds,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return data;
  },
};

export function useClassesBySchool(schoolId) {
  return useQuery({
    queryKey: ["classes", schoolId],
    queryFn: () => classApi.getAllClassBySchool(schoolId),
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) =>
      console.error(`Failed to fetch classes for school ${schoolId}:`, error.message),
  });
}

export function useClassesByStream(schoolId, streamId) {
  return useQuery({
    queryKey: ["classes", schoolId, streamId],
    queryFn: () => classApi.getAllClassByStream(schoolId, streamId),
    enabled: !!schoolId && !!streamId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) =>
      console.error(
        `Failed to fetch classes for stream ${streamId} in school ${schoolId}:`,
        error.message
      ),
  });
}

export function useClassById(schoolId, classId) {
  return useQuery({
    queryKey: ["classes", schoolId, classId],
    queryFn: () => classApi.getClassById(schoolId, classId),
    enabled: !!schoolId && !!classId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) =>
      console.error(`Failed to fetch class ${classId}:`, error.message),
  });
}

export function useClassDetails(schoolId, classId) {
  return useQuery({
    queryKey: ["classDetails", schoolId, classId],
    queryFn: () => classApi.getClassDetails(schoolId, classId),
    enabled: !!schoolId && !!classId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) =>
      console.error(`Failed to fetch details for class ${classId}:`, error.message),
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, classRequest }) =>
      classApi.addNewClass(schoolId, classRequest),
    onSuccess: (newClass, { schoolId }) => {
      queryClient.invalidateQueries({ queryKey: ["classes", schoolId] });
      // Assuming ClassResponse has a classId field
      queryClient.setQueryData(["classes", schoolId, newClass.classId], newClass);
    },
    onError: (error) => console.error("Class creation failed:", error.message),
  });
}

export function useUpdateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, classId, classRequest }) =>
      classApi.editClassById(schoolId, classId, classRequest),
    onSuccess: (updatedClass, { schoolId, classId }) => {
      queryClient.invalidateQueries({ queryKey: ["classes", schoolId] });
      queryClient.setQueryData(["classes", schoolId, classId], updatedClass);
    },
    onError: (error) => console.error("Class update failed:", error.message),
  });
}

export function useUpdateClassStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, classId }) => classApi.editStatus(schoolId, classId),
    onSuccess: (updatedClass, { schoolId, classId }) => {
      queryClient.invalidateQueries({ queryKey: ["classes", schoolId] });
      queryClient.setQueryData(["classes", schoolId, classId], updatedClass);
    },
    onError: (error) => console.error("Class status update failed:", error.message),
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, classId }) => classApi.deleteClassById(schoolId, classId),
    onSuccess: (_, { schoolId, classId }) => {
      queryClient.invalidateQueries({ queryKey: ["classes", schoolId] });
      queryClient.removeQueries({ queryKey: ["classes", schoolId, classId] });
      queryClient.removeQueries({ queryKey: ["classDetails", schoolId, classId] });
    },
    onError: (error) => console.error("Class deletion failed:", error.message),
  });
}

export function useAssignSubjectsToClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, classId, subjectIds }) =>
      classApi.assignSubjectsToClass(schoolId, classId, subjectIds),
    onSuccess: (updatedClass, { schoolId, classId }) => {
      queryClient.invalidateQueries({ queryKey: ["classes", schoolId] });
      queryClient.invalidateQueries({ queryKey: ["classDetails", schoolId, classId] });
      queryClient.setQueryData(["classes", schoolId, classId], updatedClass);
    },
    onError: (error) =>
      console.error("Assigning subjects to class failed:", error.message),
  });
}

export { classApi };