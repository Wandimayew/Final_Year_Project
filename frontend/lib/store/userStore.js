// src/lib/stores/userStore.js
import { create } from "zustand";

export const useUserStore = create((set) => ({
  usersByRoles: [],
  selectedRoleIds: [],
  schoolId: null,
  isLoading: false,
  error: null,

  setSelectedRoleIds: (roleIds) => set({ selectedRoleIds: roleIds }),
  setSchoolId: (schoolId) => set({ schoolId }),
  setUsersByRoles: (users) => set({ usersByRoles: users }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));