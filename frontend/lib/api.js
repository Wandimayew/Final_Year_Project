import axios from "axios";
import { useAuthStore } from "@/lib/auth";

export const createApiService = (baseURL) => {
  const service = axios.create({
    baseURL,
    timeout: 15000,
    withCredentials: true,
  });

  service.interceptors.request.use(
    async (config) => {
      const { token } = useAuthStore.getState();
      console.log("Sending token:", token);
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error)
  );

  service.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const status = error.response?.status;

      // Handle 401 (Unauthorized) or 403 (Forbidden) due to potential token issues
      if ((status === 401 || status === 403) && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const { refreshToken } = useAuthStore.getState();
          if (!refreshToken) {
            throw new Error("No refresh token available");
          }

          const authService = createApiService(
            process.env.NEXT_PUBLIC_AUTH_API_URL ||
              "http://localhost:8080/auth/api"
          );
          const { data } = await authService.post(
            "/refresh",
            new URLSearchParams({ refreshToken }),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
          );
          const { token: newAccessToken, refreshToken: newRefreshToken } = data;

          // Update auth store with new tokens and user data
          useAuthStore.getState().setAuth(
            {
              userId: data.userId,
              schoolId: data.schoolId,
              username: data.username,
              email: data.email,
              roles: data.roles,
            },
            newAccessToken,
            newRefreshToken
          );

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return service(originalRequest);
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          useAuthStore.getState().clearAuth();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }

      // If 403 persists after refresh (e.g., permission issue), handle it separately
      if (status === 403) {
        console.warn(
          "403 Forbidden after token refresh - insufficient permissions"
        );
        // Optionally redirect to an error page or logout
        // window.location.href = "/forbidden"; // Uncomment to redirect to a 403 page
        return Promise.reject({
          message: "You do not have permission to perform this action",
          status: 403,
        });
      }

      const message =
        error.response?.data?.message || "An unexpected error occurred";
      return Promise.reject({ message, status });
    }
  );

  return service;
};
