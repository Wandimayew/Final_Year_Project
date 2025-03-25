"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const qrCodeApi = axios.create({
  baseURL: 'http://10.194.61.74:8080/student/api',
});

// ================== QR CODE API FUNCTIONS ==================
export const useCreateQRCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await qrCodeApi.post("/qrcodes", data);
      return response.data;
    },
    onSuccess: (newQRCode) => {
      queryClient.invalidateQueries({ queryKey: ["qrcodes"] });
      queryClient.setQueryData(["qrcodes", newQRCode.id], newQRCode);
    },
  });
};

// Get all QR codes
export const useQRCodes = (params) => {
  return useQuery({
    queryKey: ["qrcodes", params],
    queryFn: async () => {
      const response = await qrCodeApi.get("/qrcodes", { params });
      return response.data;
    },
  });
};

// Get single QR code
export const useQRCode = (id) => {
  return useQuery({
    queryKey: ["qrcodes", id],
    queryFn: async () => {
      const response = await qrCodeApi.get(`/qrcodes/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useQRCodesByClassAndSection = (classId, sectionId) => {
    return useQuery({
      queryKey: ["qrcodes", "search", { classId, sectionId }],
      queryFn: async () => {
        const response = await qrCodeApi.get("/qrcodes/search", {
          params: { classId, sectionId },
        });
        return response.data;
      },
      enabled: !!classId || !!sectionId, // Only run if at least one parameter is provided
    });
  };

// Update QR code
export const useUpdateQRCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const response = await qrCodeApi.put(`/qrcodes/${id}`, data);
      return response.data;
    },
    onSuccess: (updatedQRCode) => {
      queryClient.invalidateQueries({ queryKey: ["qrcodes"] });
      queryClient.setQueryData(["qrcodes", updatedQRCode.id], updatedQRCode);
    },
  });
};
 
// Delete QR code
export const useDeleteQRCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await qrCodeApi.delete(`/qrcodes/${id}`);
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["qrcodes"] });
      queryClient.removeQueries({ queryKey: ["qrcodes", deletedId] });
    },
  });
};

// Generate QR code
export const useGenerateQRCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await qrCodeApi.post(
        `/qrcodes/generate`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qrcodes"] });
    },
  });
};
