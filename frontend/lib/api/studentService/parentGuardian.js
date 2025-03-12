"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
// Adjust the path as necessary

const parentGuardianApi = axios.create({
  baseURL: 'http://localhost:8086/api', // Adjust the base URL as needed
});

// ================== PARENT/GUARDIAN API FUNCTIONS ==================
export const useCreateParentGuardian = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await parentGuardianApi.post("/parent-guardians", data);
      return response.data;
    },
    onSuccess: (newParentGuardian) => {
      queryClient.invalidateQueries({ queryKey: ["parentGuardians"] });
      queryClient.setQueryData(["parentGuardians", newParentGuardian.id], newParentGuardian);
    },
  });
};

// Get all parent/guardians with filtering and pagination
export const useParentGuardians = (params) => {
  return useQuery({
    queryKey: ["parentGuardians", params],
    queryFn: async () => {
      const response = await parentGuardianApi.get("/parent-guardians", { params });
      return response.data;
    },
  });
};

// Get single parent/guardian
export const useParentGuardian = (id) => {
  return useQuery({
    queryKey: ["parentGuardians", id],
    queryFn: async () => {
      const response = await parentGuardianApi.get(`/parent-guardians/${id}`);
      return response.data;
    },
    enabled: !!id, // Only run if id is truthy
  });
};

// Get parent/guardian by contact
export const useParentGuardianByContact = (phoneNumber, email) => {
    return useQuery({
      queryKey: ["parentGuardians", "search", { phoneNumber, email }],
      queryFn: async () => {
        const response = await parentGuardianApi.get("/parent-guardians/search", {
          params: { phoneNumber, email },
        });
        return response.data;
      },
      enabled: !!phoneNumber || !!email, // Only run if at least one parameter is provided
    });
  };

// Update parent/guardian
export const useUpdateParentGuardian = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const response = await parentGuardianApi.patch(`/parent-guardians/${id}`, data);
      return response.data;
    },
    onSuccess: (updatedParentGuardian) => {
      queryClient.invalidateQueries({ queryKey: ["parentGuardians"] });
      queryClient.setQueryData(["parentGuardians", updatedParentGuardian.id], updatedParentGuardian);
    },
  });
};

// Delete parent/guardian
export const useDeleteParentGuardian = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await parentGuardianApi.delete(`/parent-guardians/${id}`);
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["parentGuardians"] });
      queryClient.removeQueries({ queryKey: ["parentGuardians", deletedId] });
    },
  });
};
