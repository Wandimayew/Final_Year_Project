"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const financeApi = axios.create({
  baseURL: 'http://localhost:8087/api/finance', 
});

// Create a new fee
export const useCreateFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (feeData) => {
      const response = await financeApi.post("/fees", feeData);
      return response.data;
    },
    onSuccess: (newFee) => {
      queryClient.invalidateQueries({ queryKey: ["fees"] });
      queryClient.setQueryData(["fees", newFee.feeId], newFee);
    },
  });
};

// Update an existing fee
export const useUpdateFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ feeId, ...feeData }) => {
      const response = await financeApi.put(`/fees/${feeId}`, feeData);
      return response.data;
    },
    onSuccess: (updatedFee) => {
      queryClient.invalidateQueries({ queryKey: ["fees"] });
      queryClient.setQueryData(["fees", updatedFee.feeId], updatedFee);
    },
  });
};

// Delete a fee
export const useDeleteFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (feeId) => {
      await financeApi.delete(`/fees/${feeId}`);
      return feeId;
    },
    onSuccess: (deletedFeeId) => {
      queryClient.invalidateQueries({ queryKey: ["fees"] });
      queryClient.removeQueries({ queryKey: ["fees", deletedFeeId] });
    },
  });
};

// Get all fees for a school
export const useSchoolFees = (schoolId) => {
  return useQuery({
    queryKey: ["fees", "school", schoolId],
    queryFn: async () => {
      const response = await financeApi.get(`/fees/school/${schoolId}`);
      return response.data;
    },
    enabled: !!schoolId, // Only run if schoolId is provided
  });
};

// Assign fee to a student
export const useAssignFeeToStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentFeeData) => {
      const response = await financeApi.post(`/fees/student`, studentFeeData);
      return response.data;
    },
    onSuccess: (newStudentFee) => {
      queryClient.invalidateQueries({ queryKey: ["studentFees"] });
      queryClient.invalidateQueries({ 
        queryKey: ["studentFees", "student", newStudentFee.studentId] 
      });
    },
  });
};

// Get fees for a student
export const useStudentFees = (studentId, schoolId) => {
  return useQuery({
    queryKey: ["studentFees", "student", studentId, schoolId],
    queryFn: async () => {
      const response = await financeApi.get(`/fees/student/${studentId}/school/${schoolId}`);
      return response.data;
    },
    enabled: !!studentId && !!schoolId,
  });
};

// Get outstanding fees for a school
export const useOutstandingFees = (schoolId) => {
  return useQuery({
    queryKey: ["fees", "outstanding", schoolId],
    queryFn: async () => {
      const response = await financeApi.get(`/fees/outstanding/${schoolId}`);
      return response.data;
    },
    enabled: !!schoolId,
  });
};

// Update student fee payment
export const useUpdateStudentFeePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ studentFeeId, paidAmount }) => {
      const response = await financeApi.put(
        `/fees/student/${studentFeeId}/payment?paidAmount=${paidAmount}`
      );
      return response.data;
    },
    onSuccess: (updatedStudentFee) => {
      queryClient.invalidateQueries({ queryKey: ["studentFees"] });
      queryClient.invalidateQueries({ queryKey: ["fees", "outstanding"] });
    },
  });
};