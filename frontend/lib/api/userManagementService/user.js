"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/auth";
import { createApiService } from "@/lib/api";
import { useUserStore } from "@/lib/store/userStore";
import { useState, useEffect } from "react";

export const userService = createApiService(
  process.env.NEXT_PUBLIC_API_URL_FOR_USER || "http://localhost:8080/auth/api"
);

const authApi = {
  login: async (credentials) => {
    const { data } = await userService.post("/login", credentials);
    return data;
  },
  register: async (userData, schoolId) => {
    const { data } = await userService.post(`/${schoolId}/register`, userData);
    return data;
  },
  registerAdmin: async (userData) => {
    const { data } = await userService.post("/register", userData);
    return data;
  },
  getAllLoginActivity: async (schoolId) => {
    const { data } = await userService.get(`/${schoolId}/activity`);
    return data;
  },
  logout: async () => {
    await userService.post("/logout");
  },
  refreshToken: async () => {
    const { refreshToken } = useAuthStore.getState();
    const { data } = await userService.post(
      "/refresh",
      new URLSearchParams({ refreshToken }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    return data;
  },
  forgotPassword: async (email) => {
    const { data } = await userService.post("/forgot-password", { email });
    return data;
  },
  resetPassword: async ({ token, newPassword }) => {
    const { data } = await userService.post("/reset-password", {
      token,
      newPassword,
    });
    return data;
  },
  // Add this to authApi object
  approvePasswordReset: async ({ userId, newPassword }) => {
    const { data } = await userService.post("/approve-password-reset", null, {
      params: { userId, newPassword },
    });
    return data;
  },
};

const userApi = {
  register: authApi.register,
  getAllUsers: async (schoolId) => {
    const { data } = await userService.get(`/${schoolId}/users`);
    return data;
  },
  getUser: async (schoolId, userId) => {
    const { data } = await userService.get(`/${schoolId}/users/${userId}`);
    return data;
  },
  updateUser: async (schoolId, id, userData) => {
    const { data } = await userService.put(
      `/${schoolId}/users/${id}`,
      userData
    );
    return data;
  },
  deleteUser: async (schoolId, id) => {
    await userService.delete(`/${schoolId}/users/${id}`);
  },
  updateUserRole: async ({ schoolId, userId, roleName }) => {
    const { data } = await userService.put(
      `/${schoolId}/users/${userId}/role`,
      {
        roleName,
      }
    );
    return data;
  },
  removeRoleFromUser: async ({ schoolId, userId, roleId }) => {
    const { data } = await userService.delete(
      `/${schoolId}/roles/remove-role`,
      {
        data: { userId, roleId },
      }
    );
    return data;
  },
  getUserCountsByRole: async (schoolId) => {
    const { data } = await userService.get(`/${schoolId}/users-counts`);
    return data; // Expected: { students, parents, teachers, staff }
  },

  getAllAdminActivity: async () => {
    const { data } = await userService.get("/getAllAdminActivity");
    return data;
  },

  getAllAdmins: async () => {
    const { data } = await userService.get("/getAllAdmins");
    return data;
  },

  removePermissionFromUser: async ({ schoolId, userId, permissionId }) => {
    const { data } = await userService.delete(
      `/${schoolId}/user/remove-permissions/${userId}/${permissionId}`
    );
    return data;
  },
  getUsersByRoles: async (schoolId, roleIds) => {
    const params = new URLSearchParams();
    roleIds.forEach((id) => params.append("roleIds", id));
    const { data } = await userService.get(
      `/${schoolId}/users/roles?${params.toString()}`
    );
    return data; // Assuming this returns an array of UserResponseDTO
  },
};
export function useAuth() {
  const queryClient = useQueryClient();
  const { setAuth, clearAuth } = useAuthStore();
  const [authState, setAuthState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { user, token } = useAuthStore.getState();
    setAuthState({
      user: user || null,
      token: token || "",
      roles: user?.roles || [],
    });
    setLoading(false);
  }, []);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      const { token, refreshToken, userId, schoolId, username, email, roles } =
        data;
      setAuth(
        { userId, schoolId, username, email, roles },
        token,
        refreshToken
      );
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => console.error("Login failed:", error.message),
    retry: (failureCount, error) =>
      failureCount < 2 && (!error.status || error.status >= 500),
  });

  const registerMutation = useMutation({
    mutationFn: ({ userData, schoolId }) =>
      authApi.register(userData, schoolId),
    onSuccess: (data) => {
      const { token, refreshToken, userId, schoolId, username, email, roles } =
        data;
      setAuth(
        { userId, schoolId, username, email, roles },
        token,
        refreshToken
      );
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => console.error("Registration failed:", error.message),
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      window.location.href = "/login";
    },
    onError: (error) => {
      console.warn("Logout failed:", error);
      clearAuth();
      queryClient.clear();
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (data) => console.log("Forgot password response:", data),
    onError: (error) => console.error("Forgot password failed:", error.message),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: (data) => {
      console.log("Reset password response:", data);
      window.location.href = "/login";
    },
    onError: (error) => console.error("Reset password failed:", error.message),
  });

  return {
    auth: authState,
    loading,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutateAsync,
    isLoading:
      loginMutation.isPending ||
      registerMutation.isPending ||
      logoutMutation.isPending ||
      forgotPasswordMutation.isPending ||
      resetPasswordMutation.isPending,
    error:
      loginMutation.error ||
      registerMutation.error ||
      logoutMutation.error ||
      forgotPasswordMutation.error ||
      resetPasswordMutation.error,
    isSuccess:
      loginMutation.isSuccess ||
      registerMutation.isSuccess ||
      forgotPasswordMutation.isSuccess ||
      resetPasswordMutation.isSuccess,
  };
}

// Other hooks remain unchanged for brevity, but here's one example:
export function useUsers(schoolId) {
  return useQuery({
    queryKey: ["users", schoolId],
    queryFn: () => userApi.getAllUsers(schoolId), // Note: Should be userApi.getAllUsers if you add userApi back
    staleTime: 5 * 60 * 1000,
    retry: 2,
    enabled: !!schoolId,
  });
}
export function useLoginActivity(schoolId) {
  return useQuery({
    queryKey: ["allLoginActivity", schoolId],
    queryFn: () => authApi.getAllLoginActivity(schoolId),
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) =>
      console.error("Failed to fetch login activity:", error.message),
  });
}
export function useApprovePasswordReset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, newPassword }) =>
      authApi.approvePasswordReset({ userId, newPassword }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allLoginActivity"] });
    },
    onError: (error) =>
      console.error("Failed to approve password reset:", error.message),
  });
}

export function useUser(schoolId, userId) {
  return useQuery({
    queryKey: ["users", schoolId, userId],
    queryFn: () => userApi.getUser(schoolId, userId),
    enabled: !!schoolId && !!userId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) =>
      console.error(`Failed to fetch user ${userId}:`, error.message),
  });
}

export function useUserCounts(schoolId) {
  return useQuery({
    queryKey: ["userCounts", schoolId],
    queryFn: () => userApi.getUserCountsByRole(schoolId),
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) =>
      console.error(
        `Failed to fetch user counts for school ${schoolId}:`,
        error.message
      ),
  });
}

export function useCreateAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userData) => authApi.registerAdmin(userData),
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.setQueryData(["users", newUser.user?.id], newUser.user);
    },
    onError: (error) => console.error("User creation failed:", error.message),
  });
}

export function useCreateUser(schoolId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userData) => userApi.register(userData, schoolId),
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: ["users", schoolId] });
      queryClient.setQueryData(["users", newUser.user?.id], newUser.user);
    },
    onError: (error) => console.error("User creation failed:", error.message),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, id, data }) =>
      userApi.updateUser(schoolId, id, data),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.setQueryData(["users", updatedUser.id], updatedUser);
    },
    onError: (error) => console.error("User update failed:", error.message),
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userApi.updateUserRole,
    onSuccess: (data, { schoolId, userId }) => {
      queryClient.invalidateQueries({ queryKey: ["users", schoolId, userId] });
      queryClient.setQueryData(["users", schoolId, userId], (oldData) => ({
        ...oldData,
        roles: [data.roleName || "ROLE_USER"],
      }));
    },
    onError: (error) =>
      console.error("Failed to update user role:", error.message),
  });
}

export function useRemoveRoleFromUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userApi.removeRoleFromUser,
    onSuccess: (data, { schoolId, userId }) => {
      queryClient.invalidateQueries({ queryKey: ["users", schoolId, userId] });
    },
    onError: (error) => console.error("Failed to remove role:", error.message),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: (_, { schoolId, id }) => {
      queryClient.invalidateQueries({ queryKey: ["users", schoolId] });
      queryClient.removeQueries({ queryKey: ["users", schoolId, id] });
    },
    onError: (error) => console.error("User deletion failed:", error.message),
  });
}

export function useAdminActivity() {
  return useQuery({
    queryKey: ["adminActivity"],
    queryFn: () => userApi.getAllAdminActivity(),
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) =>
      console.error("Failed to fetch admin activity:", error.message),
  });
}

export function useAllAdmins() {
  return useQuery({
    queryKey: ["allAdmins"],
    queryFn: () => userApi.getAllAdmins(),
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) =>
      console.error("Failed to fetch all admins:", error.message),
  });
}

export function useRemovePermissionFromUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userApi.removePermissionFromUser,
    onSuccess: (data, { schoolId, userId }) => {
      queryClient.invalidateQueries({ queryKey: ["users", schoolId, userId] });
      queryClient.invalidateQueries({ queryKey: ["users", schoolId] });
      queryClient.invalidateQueries({
        queryKey: ["userPermissions", schoolId, userId],
      });
    },
    onError: (error) =>
      console.error("Failed to remove permission:", error.message),
  });
}

export function useUsersByRoles(schoolId, roleIds) {
  const { setUsersByRoles, setLoading, setError } = useUserStore(); // Use Zustand setters

  return useQuery({
    queryKey: ["usersByRoles", schoolId, roleIds],
    queryFn: () => userApi.getUsersByRoles(schoolId, roleIds),
    enabled: !!schoolId && roleIds.length > 0,
    onSuccess: (data) => {
      setUsersByRoles(data);
      setLoading(false);
    },
    onError: (error) => {
      setError(error.message || "Failed to fetch users by roles");
      setLoading(false);
    },
    onSettled: () => setLoading(false),
  });
}
