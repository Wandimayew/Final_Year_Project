"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
// Adjust the path as necessary

const attendanceApi = axios.create({
  baseURL: 'http://10.194.61.72:8081/student/api', // Adjust the base URL as needed
});

// ================== ATTENDANCE API FUNCTIONS ==================
export const useCreateAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await attendanceApi.post("/attendance", data);
      return response.data;
    },
    onSuccess: (newAttendance) => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.setQueryData(["attendance", newAttendance.id], newAttendance);
    },
  });
};

// Get all attendance records
export const useAttendances = (params) => {
  return useQuery({
    queryKey: ["attendance", params],
    queryFn: async () => {
      const response = await attendanceApi.get("/attendance", { params });
      return response.data;
    },
  });
};

// Get single attendance record
export const useAttendance = (id) => {
  return useQuery({
    queryKey: ["attendance", id],
    queryFn: async () => {
      const response = await attendanceApi.get(`/attendance/${id}`);
      return response.data;
    },
    enabled: !!id, // Only run if id is truthy
  });
};

// Update attendance record
export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const response = await attendanceApi.put(`/attendance/${id}`, data);
      return response.data;
    },
    onSuccess: (updatedAttendance) => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.setQueryData(["attendance", updatedAttendance.id], updatedAttendance);
    },
  });
};

// Delete attendance record
export const useDeleteAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await attendanceApi.delete(`/attendance/${id}`);
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.removeQueries({ queryKey: ["attendance", deletedId] });
    },
  });
};

// Validate QR Code and mark attendance
export const useValidateQRCodeAndMarkAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await attendanceApi.post("/attendance/validateQRCodeAndMarkAttendance", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
};

