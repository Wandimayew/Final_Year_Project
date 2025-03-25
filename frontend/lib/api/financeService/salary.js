"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const financeApi = axios.create({
  baseURL: 'http://localhost:8087/api/finance', 
});

// Process salary payment
export const useProcessSalaryPayment = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async (salaryData) => {
        const response = await financeApi.post("/salary/process", salaryData);
        return response.data;
      },
      onSuccess: (salaryPayment) => {
        queryClient.invalidateQueries({ queryKey: ["salaryPayments"] });
        queryClient.invalidateQueries({ 
          queryKey: ["salaryPayments", "staff", salaryPayment.staffId] 
        });
      },
    });
  };
  
  // Get staff salary history
  export const useStaffSalaryHistory = (staffId, schoolId) => {
    return useQuery({
      queryKey: ["salaryPayments", "staff", staffId, schoolId],
      queryFn: async () => {
        const response = await financeApi.get(`/salary/staff/${staffId}/school/${schoolId}`);
        return response.data;
      },
      enabled: !!staffId && !!schoolId,
    });
  };
  
  // Get monthly salary report
  export const useMonthlySalaryReport = (schoolId, year, month) => {
    return useQuery({
      queryKey: ["salaryReports", "monthly", schoolId, year, month],
      queryFn: async () => {
        const response = await financeApi.get(`/salary/report/${schoolId}`, {
          params: { year, month }
        });
        return response.data;
      },
      enabled: !!schoolId && !!year && !!month,
    });
  };