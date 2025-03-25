"use client";

// import studentApi from "@/lib/config";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
// Adjust the path as necessary

const studentApi = axios.create({
  baseURL: 'http://10.194.61.74:8080/student', // Adjust the base URL as needed
  // headers: {
  //   'Content-Type': 'application/json',
  // },
});
// ================== STUDENT API FUNCTIONS ==================
export const useCreateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await studentApi.post("/api", data);
      return response.data;
    },
    onSuccess: (newStudent) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.setQueryData(["students", newStudent.studentId], newStudent);
    },
  });
};

// Get all students with filtering and pagination
export const useStudents = (params) => {
  return useQuery({
    queryKey: ["students", params],
    queryFn: async () => {
      const response = await studentApi.get("/api", { params });
      return response.data;
    },
  });
};

// Get single student
export const useStudent = (id) => {
  return useQuery({
    queryKey: ["students", id],
    queryFn: async () => {
      const response = await studentApi.get(`/api/${id}`);
      return response.data;
    },
    enabled: !!id, // Only run if id is truthy
  });
};

// Update student
export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const response = await studentApi.patch(`/api/${id}`, data);
      return response.data;
    },
    onSuccess: (updatedStudent) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.setQueryData(
        ["students", updatedStudent.studentId],
        updatedStudent
      );
    },
  });
};

// Delete student
export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await studentApi.delete(`/api/${id}`);
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.removeQueries({ queryKey: ["students", deletedId] });
    },
  });
};
