import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { subscribeWithSelector } from "zustand/middleware";

export const useAuthStore = create(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        refreshToken: null,
        setAuth: (userData, token, refreshToken) => {
          set({
            user: userData
              ? {
                  userId: userData.userId,
                  schoolId: userData.schoolId,
                  username: userData.username,
                  email: userData.email,
                  roles: userData.roles || [],
                }
              : get().user,
            token: token || get().token,
            refreshToken: refreshToken || get().refreshToken,
          });
          if (token) localStorage.setItem("token", token);
          if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        },
        clearAuth: () => {
          set({ user: null, token: null, refreshToken: null });
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
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
          refreshToken: state.refreshToken,
        }),
      }
    )
  )
);

// @/lib/auth.js
// import create from "zustand";
// import { persist } from "zustand/middleware";

// export const useAuthStore = create(
//   persist(
//     (set, get) => ({
//       userId: null,
//       schoolId: null,
//       username: null,
//       email: null,
//       roles: [],
//       token: null,
//       refreshToken: null,
//       setAuth: (user, token, refreshToken) =>
//         set({
//           userId: user.userId,
//           schoolId: user.schoolId,
//           username: user.username,
//           email: user.email,
//           roles: user.roles,
//           token,
//           refreshToken,
//         }),
//       getSchoolId: () => get().schoolId,
//       clearAuth: () =>
//         set({
//           userId: null,
//           schoolId: null,
//           username: null,
//           email: null,
//           roles: [],
//           token: null,
//           refreshToken: null,
//         }),
//     }),
//     {
//       name: "auth-store", // Key in localStorage
//       getStorage: () => localStorage,
//     }
//   )
// );
