"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/auth";
import axios from "axios";

const userService = axios.create({
  baseURL: "http://10.194.61.74:8080/auth/api",
  timeout: 15000,
  withCredentials: true,
  credentials: 'include',
  headers: {'Content-Type': 'application/json'}
});

userService.interceptors.request.use(
  async (config) => {
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

userService.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { token: refreshToken } = await authApi.refreshToken();
        useAuthStore.getState().setAuth(null, refreshToken);
        originalRequest.headers.Authorization = `Bearer ${refreshToken}`;
        return userService(originalRequest);
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

const authApi = {
  login: async (credentials) => {
    const { data } = await userService.post("/login", credentials);
    return data;
  },
  register: async (userData, schoolId) => {
    console.log("Registering user with schoolId:", schoolId); // Debug log
    const { data } = await userService.post(`/${schoolId}/register`, userData);
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
    const { data } = await userService.post("/refresh-token");
    return data;
  },
};

const userApi = {
  register: authApi.register,
  getAllUsers: async (schoolId) => {
    // Renamed from getUsers and added schoolId

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
    return data; // Expected: updated user object or success response
  },
  removeRoleFromUser: async ({ schoolId, userId, roleId }) => {
    const { data } = await userService.delete(
      `/${schoolId}/roles/remove-role`,
      {
        data: { userId, roleId }, // DELETE with body
      }
    );
    return data;
  },
};

export function useAuth() {
  const queryClient = useQueryClient();
  const { setAuth, clearAuth } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      const { token, userId, schoolId, username, email, roles } = data;
      setAuth({ userId, schoolId, username, email, roles }, token);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      console.error("Login failed:", error.message);
    },
    retry: (failureCount, error) =>
      failureCount < 2 && (!error.status || error.status >= 500),
  });

  const registerMutation = useMutation({
    mutationFn: ({ userData, schoolId }) =>
      authApi.register(userData, schoolId), // Adjusted to accept an object with userData and schoolId
    onSuccess: (data) => {
      const { token, userId, schoolId, username, email, roles } = data;
      setAuth({ userId, schoolId, username, email, roles }, token);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      console.error("Registration failed:", error.message);
    },
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

  return {
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoading:
      loginMutation.isPending ||
      registerMutation.isPending ||
      logoutMutation.isPending,
    error:
      loginMutation.error || registerMutation.error || logoutMutation.error,
    isSuccess: loginMutation.isSuccess || registerMutation.isSuccess,
  };
}

// Hook for fetching all login activity with schoolId
export function useLoginActivity(schoolId) {
  return useQuery({
    queryKey: ["allLoginActivity", schoolId],
    queryFn: () => authApi.getAllLoginActivity(schoolId),
    enabled: !!schoolId, // Only fetch if schoolId is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) => {
      console.error("Failed to fetch login activity:", error.message);
    },
  });
}

// Update the useUsers hook to accept schoolId
export function useUsers(schoolId) {
  return useQuery({
    queryKey: ["users", schoolId],
    queryFn: () => userApi.getAllUsers(schoolId),
    staleTime: 5 * 60 * 1000,
    retry: 2,
    enabled: !!schoolId, // Only fetch if schoolId is provided
  });
}
export function useUser(schoolId, userId) {
  return useQuery({
    queryKey: ["users", schoolId, userId],
    queryFn: () => userApi.getUser(schoolId, userId),
    enabled: !!schoolId && !!userId, // Only run if id is provided
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) => {
      console.error(`Failed to fetch user ${userId}:`, error.message);
    },
  });
}

export function useCreateUser(schoolId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData) => userApi.register(userData, schoolId), // Pass schoolId here
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: ["users", schoolId] });
      queryClient.setQueryData(["users", newUser.user?.id], newUser.user);
    },
    onError: (error) => {
      console.error("User creation failed:", error.message);
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => userApi.updateUser(id, data),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.setQueryData(["users", updatedUser.id], updatedUser);
    },
    onError: (error) => {
      console.error("User update failed:", error.message);
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userApi.updateUserRole,
    onSuccess: (data, { schoolId, userId }) => {
      queryClient.invalidateQueries({ queryKey: ["users", schoolId, userId] });
      // Optionally update the cache directly if the response includes the updated user
      queryClient.setQueryData(["users", schoolId, userId], (oldData) => ({
        ...oldData,
        roles: [data.roleName || "ROLE_USER"], // Adjust based on your API response
      }));
    },
    onError: (error) => {
      console.error("Failed to update user role:", error.message);
    },
  });
}

export function useRemoveRoleFromUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userApi.removeRoleFromUser,
    onSuccess: (data, { schoolId, userId }) => {
      queryClient.invalidateQueries({ queryKey: ["users", schoolId, userId] });
    },
    onError: (error) => {
      console.error("Failed to remove role:", error.message);
    },
  });
}
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.removeQueries({ queryKey: ["users", deletedId] });
    },
    onError: (error) => {
      console.error("User deletion failed:", error.message);
    },
  });
}
