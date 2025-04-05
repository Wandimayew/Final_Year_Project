"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/auth";
import axios from "axios";
import { createApiService } from "@/lib/api";

export const schoolService = createApiService(
  process.env.NEXT_PUBLIC_API_URL_FOR_TENANT ||
    "http://localhost:8080/tenant/api"
);

const schoolApi = {
  addNewSchool: async (schoolRequest) => {
    const formData = new FormData();
    formData.append("school_name", schoolRequest.school_name || "");
    formData.append("addresses", JSON.stringify(schoolRequest.addresses || []));
    formData.append("contact_number", schoolRequest.contact_number || "");
    formData.append("email_address", schoolRequest.email_address || "");
    formData.append("school_type", schoolRequest.school_type || "");
    formData.append(
      "establishment_date",
      schoolRequest.establishment_date || ""
    );
    if (schoolRequest.logo) formData.append("logo", schoolRequest.logo);
    formData.append(
      "school_information",
      schoolRequest.school_information || ""
    );
    const { data } = await schoolService.post("/addNewSchool", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  editSchoolById: async (schoolId, schoolRequest) => {
    const formData = new FormData();
    // Only append fields that are provided (not undefined/null)
    if (schoolRequest.school_name !== undefined)
      formData.append("school_name", schoolRequest.school_name);
    if (schoolRequest.contact_number !== undefined)
      formData.append("contact_number", schoolRequest.contact_number);
    if (schoolRequest.email_address !== undefined)
      formData.append("email_address", schoolRequest.email_address);
    if (schoolRequest.school_type !== undefined)
      formData.append("school_type", schoolRequest.school_type);
    if (schoolRequest.school_information !== undefined)
      formData.append("school_information", schoolRequest.school_information);
    // Note: addresses, establishment_date, and logo are not typically updated here,
    // but can be added if needed
    const { data } = await schoolService.put(
      `/editSchoolById/${schoolId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return data;
  },
  getAllSchools: async () => {
    const { data } = await schoolService.get("/getAllSchools");
    return data;
  },
  getSchoolById: async (schoolId) => {
    const { data } = await schoolService.get(`/getSchoolById/${schoolId}`);
    return data;
  },
  deleteSchoolById: async (schoolId) => {
    const { data } = await schoolService.delete(
      `/deleteSchoolById/${schoolId}`
    );
    return data;
  },

  getSchoolCount: async () => {
    const { data } = await schoolService.get("/getSchoolCount");
    return data;
  },

  getSchoolName: async (schoolIds) => {
    const { data } = await schoolService.get("/getSchoolName", {
      data: schoolIds,
    });
    return data;
  },
};

export function useSchools() {
  return useQuery({
    queryKey: ["schools"],
    queryFn: () => schoolApi.getAllSchools(),
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) =>
      console.error("Failed to fetch schools:", error.message),
  });
}

export function useSchool(schoolId) {
  return useQuery({
    queryKey: ["schools", schoolId],
    queryFn: () => schoolApi.getSchoolById(schoolId),
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) =>
      console.error(`Failed to fetch school ${schoolId}:`, error.message),
  });
}

export function useCreateSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolRequest }) => schoolApi.addNewSchool(schoolRequest),
    onSuccess: (newSchool) => {
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      queryClient.setQueryData(["schools", newSchool.schoolId], newSchool);
    },
    onError: (error) => console.error("School creation failed:", error.message),
  });
}

export function useUpdateSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, schoolRequest }) => {
      console.log("useUpdateSchool - schoolId:", schoolId);
      console.log("useUpdateSchool - schoolRequest:", schoolRequest);
      return schoolApi.editSchoolById(schoolId, schoolRequest);
    },
    onSuccess: (updatedSchool, { schoolId }) => {
      console.log("School updated successfully:", updatedSchool);
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      queryClient.setQueryData(["schools", schoolId], updatedSchool);
    },
    onError: (error) => console.error("School update failed:", error.message),
  });
}

export function useDeleteSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId }) => schoolApi.deleteSchoolById(schoolId),
    onSuccess: (_, { schoolId }) => {
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      queryClient.removeQueries({ queryKey: ["schools", schoolId] });
    },
    onError: (error) => console.error("School deletion failed:", error.message),
  });
}

export function useSchoolCount() {
  return useQuery({
    queryKey: ["schoolCount"],
    queryFn: () => schoolApi.getSchoolCount(),
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) =>
      console.error("Failed to fetch school count:", error.message),
  });
}

export function useSchoolNames(schoolIds) {
  return useQuery({
    queryKey: ["schoolNames", schoolIds],
    queryFn: () => schoolApi.getSchoolName(schoolIds),
    enabled: !!schoolIds && schoolIds.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) =>
      console.error("Failed to fetch school names:", error.message),
  });
}

export { schoolApi };
