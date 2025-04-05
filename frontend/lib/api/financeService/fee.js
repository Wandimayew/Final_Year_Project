"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const financeApi = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/finance", // Use env var for flexibility
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
    onError: (error) => {
      console.error("Error creating fee:", error);
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
    onError: (error) => {
      console.error("Error updating fee:", error);
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
    onError: (error) => {
      console.error("Error deleting fee:", error);
    },
  });
};

// Get all fees for a school
export const useSchoolFees = (schoolId) => {
  return useQuery({
    queryKey: ["fees", "school", schoolId],
    queryFn: async () => {
      try {
        const response = await financeApi.get(`/fees/school/${schoolId}`);
        return response.data || []; // Return empty array if no data
      } catch (error) {
        console.error("Error fetching school fees:", error);
        return []; // Fallback to empty array on error
      }
    },
    enabled: !!schoolId, // Only run if schoolId is provided
    placeholderData: [], // Provide placeholder data during build
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
        queryKey: ["studentFees", "student", newStudentFee.studentId],
      });
    },
    onError: (error) => {
      console.error("Error assigning fee to student:", error);
    },
  });
};

// Get fees for a student
export const useStudentFees = (studentId, schoolId) => {
  return useQuery({
    queryKey: ["studentFees", "student", studentId, schoolId],
    queryFn: async () => {
      const response = await financeApi.get(
        `/fees/student/${studentId}/school/${schoolId}`
      );
      return response.data || [];
    },
    enabled: !!studentId && !!schoolId,
    placeholderData: [],
  });
};

// Get outstanding fees for a school
export const useOutstandingFees = (schoolId) => {
  return useQuery({
    queryKey: ["fees", "outstanding", schoolId],
    queryFn: async () => {
      const response = await financeApi.get(`/fees/outstanding/${schoolId}`);
      return response.data || [];
    },
    enabled: !!schoolId,
    placeholderData: [],
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
    onError: (error) => {
      console.error("Error updating student fee payment:", error);
    },
  });
};
