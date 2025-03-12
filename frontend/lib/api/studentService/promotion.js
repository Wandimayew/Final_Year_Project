"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const promotionApi = axios.create({
  baseURL: 'http://localhost:8086/api',
});

// ================== PROMOTION API FUNCTIONS ==================
export const useCreatePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await promotionApi.post("/promotions", data);
      return response.data;
    },
    onSuccess: (newPromotion) => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      queryClient.setQueryData(["promotions", newPromotion.id], newPromotion);
    },
  });
};

// Get all promotions
export const usePromotions = (params) => {
  return useQuery({
    queryKey: ["promotions", params],
    queryFn: async () => {
      const response = await promotionApi.get("/promotions", { params });
      return response.data;
    },
  });
};

// Get single promotion
export const usePromotion = (id) => {
  return useQuery({
    queryKey: ["promotions", id],
    queryFn: async () => {
      const response = await promotionApi.get(`/promotions/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Get all passed students
export const usePassedStudents = (params) => {
  return useQuery({
    queryKey: ["passedStudents", params],
    queryFn: async () => {
      const response = await promotionApi.get("/students/passed", { params });
      return response.data;
    },
  });
};

// Update promotion
export const useUpdatePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const response = await promotionApi.put(`/promotions/${id}`, data);
      return response.data;
    },
    onSuccess: (updatedPromotion) => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      queryClient.setQueryData(["promotions", updatedPromotion.id], updatedPromotion);
    },
  });
};

// Delete promotion
export const useDeletePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await promotionApi.delete(`/promotions/${id}`);
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      queryClient.removeQueries({ queryKey: ["promotions", deletedId] });
    },
  });
};
