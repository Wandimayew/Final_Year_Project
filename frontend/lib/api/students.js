import api from "@/lib/utils"
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
 // Adjust the path as necessary

// Create student
export const useCreateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/students', data);
      return response.data;
    },
    onSuccess: (newStudent) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.setQueryData(['students', newStudent.studentId], newStudent);
    },
  });
};

// Get all students with filtering and pagination
export const useStudents = (params) => {
  return useQuery({
    queryKey: ['students', params],
    queryFn: async () => {
      const response = await api.get('/students', { params });
      return response.data;
    },
  });
};

// Get single student
export const useStudent = (id) => {
  return useQuery({
    queryKey: ['students', id],
    queryFn: async () => {
      const response = await api.get(`/students/${id}`);
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
      const response = await api.patch(`/students/${id}`, data);
      return response.data;
    },
    onSuccess: (updatedStudent) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.setQueryData(['students', updatedStudent.studentId], updatedStudent);
    },
  });
};

// Delete student
export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/students/${id}`);
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.removeQueries({ queryKey: ['students', deletedId] });
    },
  });
};