"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createApiService } from "@/lib/api";

export const sectionService = createApiService(
  process.env.NEXT_PUBLIC_API_URL_FOR_ACADEMIC ||
    "http://localhost:8086/academic/api"
);

const sectionApi = {
  addNewSection: async (schoolId, sectionRequest) => {
    const { data } = await sectionService.post(
      `/${schoolId}/addNewSection`,
      sectionRequest,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return data;
  },

  editSectionById: async (schoolId, sectionId, sectionRequest) => {
    const { data } = await sectionService.put(
      `/${schoolId}/editSectionById/${sectionId}`,
      sectionRequest,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return data;
  },

  getAllSectionByClass: async (schoolId, classId) => {
    const { data } = await sectionService.get(
      `/${schoolId}/getAllSectionByClass/${classId}`
    );
    return data;
  },

  getSectionById: async (schoolId, sectionId) => {
    const { data } = await sectionService.get(
      `/${schoolId}/getSectionById/${sectionId}`
    );
    return data;
  },

  deleteSectionById: async (schoolId, sectionId) => {
    const { data } = await sectionService.delete(
      `/${schoolId}/deleteSectionById/${sectionId}`
    );
    return data;
  },

  deleteSectionByClass: async (schoolId, classId) => {
    const { data } = await sectionService.delete(
      `/${schoolId}/deleteSectionByClass/${classId}`
    );
    return data;
  },
};

export function useSectionsByClass(schoolId, classId) {
  return useQuery({
    queryKey: ["sections", schoolId, classId],
    queryFn: () => sectionApi.getAllSectionByClass(schoolId, classId),
    enabled: !!schoolId && !!classId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) =>
      console.error(
        `Failed to fetch sections for class ${classId}:`,
        error.message
      ),
  });
}

export function useSectionById(schoolId, sectionId) {
  return useQuery({
    queryKey: ["sections", schoolId, sectionId],
    queryFn: () => sectionApi.getSectionById(schoolId, sectionId),
    enabled: !!schoolId && !!sectionId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) =>
      console.error(`Failed to fetch section ${sectionId}:`, error.message),
  });
}

export function useCreateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, sectionRequest }) =>
      sectionApi.addNewSection(schoolId, sectionRequest),
    onSuccess: (newSection, { schoolId, sectionRequest }) => {
      // Invalidate sections query
      queryClient.invalidateQueries({
        queryKey: ["sections", schoolId, sectionRequest.classId],
      });
      // Update section cache
      queryClient.setQueryData(
        ["sections", schoolId, newSection.sectionId],
        newSection
      );
      // Invalidate classDetails query for ViewClass
      queryClient.invalidateQueries({
        queryKey: ["classDetails", schoolId, sectionRequest.classId],
      });
    },
    onError: (error) =>
      console.error("Section creation failed:", error.message),
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, sectionId, sectionRequest }) =>
      sectionApi.editSectionById(schoolId, sectionId, sectionRequest),
    onMutate: async ({ schoolId, sectionId, sectionRequest }) => {
      // Cancel ongoing classDetails queries
      await queryClient.cancelQueries({
        queryKey: ["classDetails", schoolId, sectionRequest.classId],
      });

      // Snapshot previous classDetails
      const previousClassDetails = queryClient.getQueryData([
        "classDetails",
        schoolId,
        sectionRequest.classId,
      ]);

      // Optimistically update classDetails
      queryClient.setQueryData(
        ["classDetails", schoolId, sectionRequest.classId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            sections: old.sections.map((sec) =>
              sec.sectionId === sectionId
                ? {
                    ...sec,
                    sectionName: sectionRequest.sectionName,
                    capacity: sectionRequest.capacity,
                  }
                : sec
            ),
          };
        }
      );

      // Update sections cache
      queryClient.setQueryData(
        ["sections", schoolId, sectionId],
        (old) => ({
          ...old,
          sectionName: sectionRequest.sectionName,
          capacity: sectionRequest.capacity,
        })
      );

      return { previousClassDetails, schoolId, classId: sectionRequest.classId };
    },
    onError: (error, variables, context) => {
      // Roll back classDetails on error
      queryClient.setQueryData(
        ["classDetails", context.schoolId, context.classId],
        context.previousClassDetails
      );
      console.error("Section update failed:", error.message);
    },
    onSuccess: (updatedSection, { schoolId, sectionId, sectionRequest }) => {
      // Invalidate queries to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: ["sections", schoolId, sectionRequest.classId],
      });
      queryClient.invalidateQueries({
        queryKey: ["classDetails", schoolId, sectionRequest.classId],
      });
    },
  });
}

export function useDeleteSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, sectionId, classId }) =>
      sectionApi.deleteSectionById(schoolId, sectionId),
    onMutate: async ({ schoolId, sectionId, classId }) => {
      // Cancel ongoing classDetails queries
      await queryClient.cancelQueries({
        queryKey: ["classDetails", schoolId, classId],
      });

      // Snapshot previous classDetails
      const previousClassDetails = queryClient.getQueryData([
        "classDetails",
        schoolId,
        classId,
      ]);

      // Optimistically remove section from classDetails
      queryClient.setQueryData(
        ["classDetails", schoolId, classId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            sections: old.sections.filter((sec) => sec.sectionId !== sectionId),
          };
        }
      );

      return { previousClassDetails, schoolId, classId };
    },
    onError: (error, variables, context) => {
      // Roll back classDetails on error
      queryClient.setQueryData(
        ["classDetails", context.schoolId, context.classId],
        context.previousClassDetails
      );
      console.error("Section deletion failed:", error.message);
    },
    onSuccess: (_, { schoolId, sectionId, classId }) => {
      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: ["sections", schoolId, classId],
      });
      queryClient.invalidateQueries({
        queryKey: ["classDetails", schoolId, classId],
      });
      queryClient.removeQueries({
        queryKey: ["sections", schoolId, sectionId],
      });
    },
  });
}

export function useDeleteSectionsByClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, classId }) =>
      sectionApi.deleteSectionByClass(schoolId, classId),
    onSuccess: (_, { schoolId, classId }) => {
      queryClient.invalidateQueries({
        queryKey: ["sections", schoolId, classId],
      });
      queryClient.invalidateQueries({
        queryKey: ["classDetails", schoolId, classId],
      });
    },
    onError: (error) =>
      console.error("Sections deletion by class failed:", error.message),
  });
}

export { sectionApi };