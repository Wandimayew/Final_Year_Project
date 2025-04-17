"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/auth";
import axios from "axios";

import { createApiService } from "@/lib/api";

export const schoolService = createApiService(
  process.env.NEXT_PUBLIC_API_URL_FOR_TENANT || "http://192.168.1.98:8080/tenant/api"
);

const subscriptionService = schoolService;

const subscriptionApi = {
  addNewSchoolSubscription: async (schoolId, subscriptionData) => {
    const { data } = await subscriptionService.post(
      `/${schoolId}/addNewSchoolSubscription`,
      subscriptionData
    );
    return data;
  },
  editSchoolSubscriptionById: async (
    schoolId,
    subscriptionId,
    subscriptionData
  ) => {
    const { data } = await subscriptionService.put(
      `/${schoolId}/editSchoolSubscriptionById/${subscriptionId}`,
      subscriptionData
    );
    return data;
  },
  deleteSchoolSubscriptionById: async (schoolId, subscriptionId) => {
    const { data } = await subscriptionService.delete(
      `/${schoolId}/deleteSchoolSubscriptionById/${subscriptionId}`
    );
    return data;
  },
  getAllSchoolSubscriptions: async () => {
    const { data } = await subscriptionService.get(
      `/getAllSchoolSubscriptions`
    );
    return data;
  },
  getSchoolSubscriptionById: async (schoolId, subscriptionId) => {
    const { data } = await subscriptionService.get(
      `/${schoolId}/getSchoolSubscriptionById/${subscriptionId}`
    );
    return data;
  },
};

// Hooks for managing school subscriptions
export function useSchoolSubscriptions(schoolId) {
  return useQuery({
    queryKey: ["subscriptions", schoolId],
    queryFn: () => subscriptionApi.getAllSchoolSubscriptions(schoolId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    enabled: !!schoolId,
    onError: (error) =>
      console.error(
        `Failed to fetch subscriptions for school ${schoolId}:`,
        error.message
      ),
  });
}

export function useSchoolSubscription(schoolId, subscriptionId) {
  return useQuery({
    queryKey: ["subscriptions", schoolId, subscriptionId],
    queryFn: () =>
      subscriptionApi.getSchoolSubscriptionById(schoolId, subscriptionId),
    enabled: !!schoolId && !!subscriptionId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) =>
      console.error(
        `Failed to fetch subscription ${subscriptionId}:`,
        error.message
      ),
  });
}

export function useCreateSchoolSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, subscriptionData }) =>
      subscriptionApi.addNewSchoolSubscription(schoolId, subscriptionData),
    onSuccess: (newSubscription, { schoolId }) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions", schoolId] });
      queryClient.setQueryData(
        ["subscriptions", schoolId, newSubscription.id],
        newSubscription
      );
    },
    onError: (error) =>
      console.error("Subscription creation failed:", error.message),
  });
}

export function useUpdateSchoolSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, subscriptionId, subscriptionData }) =>
      subscriptionApi.editSchoolSubscriptionById(
        schoolId,
        subscriptionId,
        subscriptionData
      ),
    onSuccess: (updatedSubscription, { schoolId }) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions", schoolId] });
      queryClient.setQueryData(
        ["subscriptions", schoolId, updatedSubscription.id],
        updatedSubscription
      );
    },
    onError: (error) =>
      console.error("Subscription update failed:", error.message),
  });
}

export function useDeleteSchoolSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, subscriptionId }) =>
      subscriptionApi.deleteSchoolSubscriptionById(schoolId, subscriptionId),
    onSuccess: (_, { schoolId, subscriptionId }) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions", schoolId] });
      queryClient.removeQueries({
        queryKey: ["subscriptions", schoolId, subscriptionId],
      });
    },
    onError: (error) =>
      console.error("Subscription deletion failed:", error.message),
  });
}
