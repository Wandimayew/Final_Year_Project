"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const financeApi = axios.create({
  baseURL: 'http://localhost:8080/api/finance', 
});

// Generate a new invoice
export const useGenerateInvoice = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async (invoiceRequest) => {
        const response = await financeApi.post("/invoices/generate", invoiceRequest);
        return response.data;
      },
      onSuccess: (newInvoice) => {
        queryClient.invalidateQueries({ queryKey: ["invoices"] });
        queryClient.setQueryData(["invoices", newInvoice.invoiceId], newInvoice);
        queryClient.invalidateQueries({ 
          queryKey: ["invoices", "student", newInvoice.studentId] 
        });
      },
    });
  };
  
  // Get invoice by ID
  export const useInvoice = (invoiceId) => {
    return useQuery({
      queryKey: ["invoices", invoiceId],
      queryFn: async () => {
        const response = await financeApi.get(`/invoices/${invoiceId}`);
        return response.data;
      },
      enabled: !!invoiceId,
    });
  };
  
  // Get invoice by number
  export const useInvoiceByNumber = (invoiceNumber) => {
    return useQuery({
      queryKey: ["invoices", "number", invoiceNumber],
      queryFn: async () => {
        const response = await financeApi.get(`/invoices/number/${invoiceNumber}`);
        return response.data;
      },
      enabled: !!invoiceNumber,
    });
  };
  
  // Get student invoices
  export const useStudentInvoices = (studentId, schoolId) => {
    return useQuery({
      queryKey: ["invoices", "student", studentId, schoolId],
      queryFn: async () => {
        const response = await financeApi.get(`/invoices/student/${studentId}/school/${schoolId}`);
        return response.data;
      },
      enabled: !!studentId && !!schoolId,
    });
  };
  
  // Update invoice status
  export const useUpdateInvoiceStatus = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async ({ invoiceId, status }) => {
        await financeApi.put(`/invoices/${invoiceId}/status?status=${status}`);
        return { invoiceId, status };
      },
      onSuccess: ({ invoiceId }) => {
        queryClient.invalidateQueries({ queryKey: ["invoices"] });
        queryClient.invalidateQueries({ queryKey: ["invoices", invoiceId] });
      },
    });
  };
  
  // Delete an invoice
  export const useDeleteInvoice = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async (invoiceId) => {
        await financeApi.delete(`/invoices/${invoiceId}`);
        return invoiceId;
      },
      onSuccess: (deletedInvoiceId) => {
        queryClient.invalidateQueries({ queryKey: ["invoices"] });
        queryClient.removeQueries({ queryKey: ["invoices", deletedInvoiceId] });
      },
    });
  };