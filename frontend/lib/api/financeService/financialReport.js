"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const financeApi = axios.create({
  baseURL: 'http://localhost:8080/api/finance', 
});

// Get financial summary
export const useFinancialSummary = (schoolId, startDate, endDate) => {
    return useQuery({
      queryKey: ["financialReports", "summary", schoolId, startDate, endDate],
      queryFn: async () => {
        const response = await financeApi.get(`/reports/summary/${schoolId}`, {
          params: { startDate, endDate }
        });
        return response.data;
      },
      enabled: !!schoolId && !!startDate && !!endDate,
    });
  };
  
  // Get monthly financial report
  export const useMonthlyReport = (schoolId, year, month) => {
    return useQuery({
      queryKey: ["financialReports", "monthly", schoolId, year, month],
      queryFn: async () => {
        const response = await financeApi.get(`/reports/monthly/${schoolId}`, {
          params: { year, month }
        });
        return response.data;
      },
      enabled: !!schoolId && !!year && !!month,
    });
  };
  
  // Get annual financial report
  export const useAnnualReport = (schoolId, year) => {
    return useQuery({
      queryKey: ["financialReports", "annual", schoolId, year],
      queryFn: async () => {
        const response = await financeApi.get(`/reports/annual/${schoolId}`, {
          params: { year }
        });
        return response.data;
      },
      enabled: !!schoolId && !!year,
    });
  };
  
  // Get dashboard financial stats
  export const useDashboardStats = (schoolId) => {
    return useQuery({
      queryKey: ["financialReports", "dashboard", schoolId],
      queryFn: async () => {
        const response = await financeApi.get(`/reports/dashboard/${schoolId}`);
        return response.data;
      },
      enabled: !!schoolId,
    });
  };