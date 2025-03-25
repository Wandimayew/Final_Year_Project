import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://10.194.61.74:8080/staff/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const staffService = {
  // Staff endpoints
  getAllStaff: () => api.get("/staff"),
  getStaffById: (staffId) => api.get(`/staff/${staffId}`),
  createStaff: async (data) => {
    const formData = new FormData();

    // Handle nested objects and arrays properly
    Object.keys(data).forEach((key) => {
      if (
        typeof data[key] === "object" &&
        data[key] !== null &&
        !(data[key] instanceof File)
      ) {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    });

    return await api.post("/staff/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  updateStaff: (staffId, data) => api.put(`/staff/${staffId}`, data),
  deleteStaff: (staffId) => api.delete(`/staff/${staffId}`),
  changePassword: (staffId, currentPassword, newPassword) =>
    api.put(`/staff/${staffId}/change-password`, null, {
      params: { currentPassword, newPassword },
    }),

  // Teacher endpoints
  getAllTeachers: () => api.get("/teachers"),
  getAllTeachersAll: () => api.get("/teachers/all"),
  getAllInactiveTeachers: () => api.get("/teachers/inactive"),
  getTeacherById: (teacherId) => api.get(`/teachers/${teacherId}`),
  createTeacher: async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (
        typeof data[key] === "object" &&
        data[key] !== null &&
        !(data[key] instanceof File)
      ) {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    });
    
    return await api.post("/teachers/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  updateTeacher: (teacherId, data) => api.put(`/teachers/${teacherId}`, data),
  deleteTeacher: (teacherId) => api.delete(`/teachers/${teacherId}`),
};

export default api;
