import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { subscribeWithSelector } from "zustand/middleware";

export const useAuthStore = create(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        user: null, // Will hold userId, schoolId, username, email, roles
        token: null,
        setAuth: (userData, token) => {
          set({
            user: {
              userId: userData.userId,
              schoolId: userData.schoolId,
              username: userData.username,
              email: userData.email,
              roles: userData.roles,
            },
            token,
          });
          if (token) localStorage.setItem("token", token); // Sync token to localStorage
        },
        clearAuth: () => {
          set({ user: null, token: null });
          localStorage.removeItem("token");
        },
        isAuthenticated: () => !!get().token,
        getUserId: () => get().user?.userId || null,
        getSchoolId: () => get().user?.schoolId || null,
        getUsername: () => get().user?.username || null,
        getEmail: () => get().user?.email || null,
        getRoles: () => get().user?.roles || [],
      }),
      {
        name: "auth-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          user: state.user,
          token: state.token,
        }), // Persist both user and token
      }
    )
  )
);
