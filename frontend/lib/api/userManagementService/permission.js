"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/auth";
import axios from "axios";

// Permission-specific axios instance
const permissionService = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://10.194.61.72:8080/auth/api",
  timeout: 15000,
  withCredentials: true,
});

permissionService.interceptors.request.use(
  async (config) => {
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

permissionService.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { token: refreshToken } = await authApi.refreshToken();
        useAuthStore.getState().setAuth(null, refreshToken);
        originalRequest.headers.Authorization = `Bearer ${refreshToken}`;
        return permissionService(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    const message =
      error.response?.data?.message || "An unexpected error occurred";
    return Promise.reject({ message, status: error.response?.status });
  }
);

// Permission API methods based on PermissionController
const permissionApi = {
  getAllPermissions: async (schoolId) => {
    const { data } = await permissionService.get(`/${schoolId}/permissions`);
    return data; // Returns List<PermissionDTO>
  },
  getPermissionById: async (schoolId, permissionId) => {
    const { data } = await permissionService.get(
      `/${schoolId}/permissions/${permissionId}`
    );
    return data; // Returns PermissionDTO
  },
  createPermission: async (schoolId, permissionRequest) => {
    const { data } = await permissionService.post(
      `/${schoolId}/permissions`,
      permissionRequest
    );
    return data; // Returns Permission
  },
  updatePermission: async (schoolId, permissionId, permissionRequest) => {
    const { data } = await permissionService.put(
      `/${schoolId}/permissions/${permissionId}`,
      permissionRequest
    );
    return data; // Returns Permission
  },
  deletePermission: async (schoolId, permissionId) => {
    const { data } = await permissionService.delete(
      `/${schoolId}/permissions/${permissionId}`
    );
    return data; // Returns success message
  },
  getPermissionByName: async (schoolId, name) => {
    const { data } = await permissionService.get(
      `/${schoolId}/permissions/name/${name}`
    );
    return data; // Returns Permission
  },

  getUserPermissions: async (schoolId, userId) => {
    const { data } = await permissionService.get(
      `/${schoolId}/permissions/by-user/${userId}`
    );
    return data.permissionName; // Expected: ["READ_DATA", "WRITE_DATA", ...]
  },
};

// Hooks for permission state management
export function usePermissions(schoolId) {
  return useQuery({
    queryKey: ["permissions", schoolId],
    queryFn: () => permissionApi.getAllPermissions(schoolId),
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) => {
      console.error("Failed to fetch permissions:", error.message);
    },
  });
}

export function usePermission(schoolId, permissionId) {
  return useQuery({
    queryKey: ["permissions", schoolId, permissionId],
    queryFn: () => permissionApi.getPermissionById(schoolId, permissionId),
    enabled: !!schoolId && !!permissionId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) => {
      console.error(
        `Failed to fetch permission ${permissionId}:`,
        error.message
      );
    },
  });
}

export function useCreatePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, permissionRequest }) =>
      permissionApi.createPermission(schoolId, permissionRequest),
    onSuccess: (newPermission, { schoolId }) => {
      queryClient.invalidateQueries({ queryKey: ["permissions", schoolId] });
      queryClient.setQueryData(
        ["permissions", schoolId, newPermission.permissionId],
        newPermission
      );
    },
    onError: (error) => {
      console.error("Permission creation failed:", error.message);
    },
  });
}

export function useUpdatePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, permissionId, permissionRequest }) =>
      permissionApi.updatePermission(schoolId, permissionId, permissionRequest),
    onSuccess: (updatedPermission, { schoolId }) => {
      queryClient.invalidateQueries({ queryKey: ["permissions", schoolId] });
      queryClient.setQueryData(
        ["permissions", schoolId, updatedPermission.permissionId],
        updatedPermission
      );
    },
    onError: (error) => {
      console.error("Permission update failed:", error.message);
    },
  });
}

export function useDeletePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, permissionId }) =>
      permissionApi.deletePermission(schoolId, permissionId),
    onSuccess: (_, { schoolId, permissionId }) => {
      queryClient.invalidateQueries({ queryKey: ["permissions", schoolId] });
      queryClient.removeQueries({
        queryKey: ["permissions", schoolId, permissionId],
      });
    },
    onError: (error) => {
      console.error("Permission deletion failed:", error.message);
    },
  });
}
export function useUserPermissions(schoolId, userId) {
  return useQuery({
    queryKey: ["userPermissions", schoolId, userId],
    queryFn: () => permissionApi.getUserPermissions(schoolId, userId),
    enabled: !!schoolId && !!userId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
    onError: (error) => {
      console.error(
        `Failed to fetch permissions for user ${userId}:`,
        error.message
      );
    },
  });
}

export function usePermissionByName(schoolId, name) {
  return useQuery({
    queryKey: ["permissions", schoolId, "name", name],
    queryFn: () => permissionApi.getPermissionByName(schoolId, name),
    enabled: !!schoolId && !!name,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) => {
      console.error(
        `Failed to fetch permission by name ${name}:`,
        error.message
      );
    },
  });
}

// Export permissionApi for direct use if needed
export { permissionApi };
