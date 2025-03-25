"use client";

// import userApi from "@/lib/config";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/auth";
import axios from "axios";

const userService = axios.create({
  baseURL: 'http://10.194.61.74:8080/auth/api', // Adjust the base URL as needed
  // headers: {
  //   'Content-Type': 'application/json',
  // },
});
// ================== AUTH API FUNCTIONS ==================
const authApi = {
  login: async (credentials) => {
    const { data } = await userService.post("/login", credentials);
    return data;
  },

  register: async (userData) => {
    const { data } = await userService.post("/register", userData);
    return data;
  },

  logout: async () => {
    localStorage.removeItem("token");
    await userService.post("/logout");
  },
};

// ================== USER API FUNCTIONS ==================
const userApi = {
  register: async (userData) => {
    const { data } = await userService.post("/register", userData);
    return data;
  },

  getUsers: async () => {
    const { data } = await userService.get("/users");
    return data;
  },

  getUser: async (id) => {
    const { data } = await userService.get(`/users/${id}`);
    return data;
  },

  updateUser: async (id, userData) => {
    const { data } = await userService.patch(`/users/${id}`, {
      ...userData,
      avator: userData.avator,
    });
    return data;
  },

  deleteUser: async (id) => {
    await userService.delete(`/users/${id}`);
  },
};

// ================== AUTH HOOKS ==================
export function useAuth() {
  const queryClient = useQueryClient();
  const { setAuth, clearAuth } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ user, token }) => {
      setAuth(user, token);
      userApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: ({ user, token }) => {
      setAuth(user, token);
    },
  });

  const logout = () => {
    authApi.logout();
    clearAuth();
    queryClient.clear();
  };

  return {
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoading: loginMutation.isPending || registerMutation.isPending,
    error: loginMutation.error || registerMutation.error,
  };
}

// ================== USER HOOKS ==================
export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: userApi.getUsers,
  });
}

export function useUser(id) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => userApi.getUser(id),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.register,
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.setQueryData(["users", newUser.id], newUser);
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
  });
}
