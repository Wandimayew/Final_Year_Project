"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/auth";
import axios from "axios";

import { createApiService } from "@/lib/api";

export const userService = createApiService(
  process.env.NEXT_PUBLIC_API_URL_FOR_USER || "http://192.168.1.98:8080/auth/api"
);
// Use userService for role-related requests
const roleService = userService;
// Role API methods based on backend RoleController
const roleApi = {
  getRoles: async (schoolId) => {
    const { data } = await roleService.get(`/${schoolId}/roles`);
    return data; // Returns List<Role>
  },
  getRoleById: async (schoolId, roleId) => {
    const { data } = await roleService.get(`/${schoolId}/roles/${roleId}`);
    return data; // Returns Role
  },
  createRole: async (schoolId, roleRequest) => {
    const { data } = await roleService.post(`/${schoolId}/roles`, roleRequest);
    return data; // Returns created Role
  },
  updateRole: async (schoolId, roleId, roleRequest) => {
    const { data } = await roleService.put(
      `/${schoolId}/roles/${roleId}`,
      roleRequest
    );
    return data; // Returns updated Role
  },
  deleteRole: async (schoolId, roleId) => {
    const { data } = await roleService.delete(`/${schoolId}/roles/${roleId}`);
    return data; // Returns success message
  },
  assignRoleToUser: async (schoolId, roleId, userId) => {
    const { data } = await roleService.post(
      `/${schoolId}/roles/${roleId}/assign/${userId}`
    );
    return data; // Returns updated User
  },
  assignPermissionsToUserForRole: async (schoolId, request) => {
    const { data } = await roleService.post(
      `/${schoolId}/roles/assign-permissions`,
      request
    );
    return data; // Returns success message
  },
  removeRoleFromUser: async (schoolId, request) => {
    const { data } = await roleService.delete(
      `/${schoolId}/roles/remove-role`,
      { data: request }
    );
    return data; // Returns updated User
  },
  getPermissionsByRole: async (schoolId, roleId) => {
    const { data } = await roleService.get(
      `/${schoolId}/permissions/by-role/${roleId}`
    );
    return data; // Returns PermissionRoleResponse
  },
};

// Hooks for role state management
export function useRoles(schoolId) {
  return useQuery({
    queryKey: ["roles", schoolId],
    queryFn: () => roleApi.getRoles(schoolId),
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) => {
      console.error("Failed to fetch roles:", error.message);
    },
  });
}

export function useRole(schoolId, roleId) {
  return useQuery({
    queryKey: ["roles", schoolId, roleId],
    queryFn: () => roleApi.getRoleById(schoolId, roleId),
    enabled: !!schoolId && !!roleId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) => {
      console.error(`Failed to fetch role ${roleId}:`, error.message);
    },
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, roleRequest }) =>
      roleApi.createRole(schoolId, roleRequest),
    onSuccess: (newRole, { schoolId }) => {
      queryClient.invalidateQueries({ queryKey: ["roles", schoolId] });
      queryClient.setQueryData(["roles", schoolId, newRole.id], newRole);
    },
    onError: (error) => {
      console.error("Role creation failed:", error.message);
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, roleId, roleRequest }) =>
      roleApi.updateRole(schoolId, roleId, roleRequest),
    onSuccess: (updatedRole, { schoolId }) => {
      queryClient.invalidateQueries({ queryKey: ["roles", schoolId] });
      queryClient.setQueryData(
        ["roles", schoolId, updatedRole.id],
        updatedRole
      );
    },
    onError: (error) => {
      console.error("Role update failed:", error.message);
    },
  });
}

// Add a custom hook for fetching permissions
export function usePermissionsByRole(schoolId, roleId) {
  return useQuery({
    queryKey: ["permissions", schoolId, roleId],
    queryFn: () => roleApi.getPermissionsByRole(schoolId, roleId),
    enabled: !!schoolId && !!roleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) => {
      console.error(
        `Failed to fetch permissions for role ${roleId}:`,
        error.message
      );
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, roleId }) => roleApi.deleteRole(schoolId, roleId),
    onSuccess: (_, { schoolId, roleId }) => {
      queryClient.invalidateQueries({ queryKey: ["roles", schoolId] });
      queryClient.removeQueries({ queryKey: ["roles", schoolId, roleId] });
    },
    onError: (error) => {
      console.error("Role deletion failed:", error.message);
    },
  });
}

export function useAssignRoleToUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, roleId, userId }) =>
      roleApi.assignRoleToUser(schoolId, roleId, userId),
    onSuccess: (updatedUser, { schoolId }) => {
      queryClient.invalidateQueries({ queryKey: ["users", schoolId] });
      queryClient.setQueryData(["users", updatedUser.userId], updatedUser);
    },
    onError: (error) => {
      console.error("Role assignment failed:", error.message);
    },
  });
}

export function useAssignPermissionsToUserForRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, request }) =>
      roleApi.assignPermissionsToUserForRole(schoolId, request),
    onSuccess: (_, { schoolId, request }) => {
      queryClient.invalidateQueries({
        queryKey: ["users", schoolId, request.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["userPermissions", schoolId, request.userId],
      });
    },
    onError: (error) =>
      console.error("Permission assignment failed:", error.message),
  });
}

export function useRemoveRoleFromUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, request }) =>
      roleApi.removeRoleFromUser(schoolId, request),
    onSuccess: (updatedUser, { schoolId }) => {
      queryClient.invalidateQueries({ queryKey: ["users", schoolId] });
      queryClient.setQueryData(["users", updatedUser.userId], updatedUser);
    },
    onError: (error) => {
      console.error("Role removal failed:", error.message);
    },
  });
}

// Export roleApi for direct use if needed
export { roleApi };
