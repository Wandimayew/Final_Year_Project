"use client";

import axios from "axios";
import { useAuthStore } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { createApiService } from "@/lib/api";

export const schoolService = createApiService(
  process.env.NEXT_PUBLIC_API_URL_FOR_TENANT || "http://localhost:8080/tenant/api"
);

const subscriptionService = schoolService;


export const subscriptionApi = {
  createPlan: async (planData) => {
    const { data } = await subscriptionService.post(
      "/addNewSubscriptionPlan",
      planData
    );
    return data;
  },
  updatePlan: async (planId, planData) => {
    const { data } = await subscriptionService.put(
      `/editSubscriptioPlanById/${planId}`,
      planData
    );
    return data;
  },
  getAllPlans: async () => {
    const { data } = await subscriptionService.get("/getAllSubscriptionPlans");
    return data;
  },
  getPlanById: async (planId) => {
    const { data } = await subscriptionService.get(
      `/getSubscriptionPlanById/${planId}`
    );
    return data;
  },
  getSchoolsByPlanId: async (planId) => {
    const { data } = await subscriptionService.get(
      `/getSchoolsByPlanId/${planId}`
    );
    return data;
  },
  deletePlan: async (planId) => {
    const { data } = await subscriptionService.delete(
      `/deleteSubscriptioPlanById/${planId}`
    );
    return data;
  },
};

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ["subscriptionPlans"],
    queryFn: subscriptionApi.getAllPlans,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error("Failed to fetch subscription plans:", error.message);
    },
  });
}

export function useSubscriptionPlan(planId, options = {}) {
  return useQuery({
    queryKey: ["subscriptionPlans", planId],
    queryFn: () => subscriptionApi.getPlanById(planId),
    enabled: !!planId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error(
        `Failed to fetch subscription plan ${planId}:`,
        error.message
      );
    },
    onSuccess: () => {
      console.log(`Successfully fetched plan ${planId} from database`);
    },
  });
}

export function useCreateSubscriptionPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planData) => subscriptionApi.createPlan(planData),
    onSuccess: (newPlan) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptionPlans"] });
      queryClient.setQueryData(["subscriptionPlans", newPlan.plan_id], newPlan);
    },
    onError: (error) => {
      console.error("Failed to create subscription plan:", error.message);
      if (error.status === 401) {
        window.location.href = "/login";
      }
    },
  });
}

export function useUpdateSubscriptionPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, data }) => subscriptionApi.updatePlan(planId, data),
    onSuccess: (updatedPlan) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptionPlans"] });
      queryClient.setQueryData(
        ["subscriptionPlans", updatedPlan.plan_id],
        updatedPlan
      );
    },
    onError: (error) => {
      console.error("Failed to update subscription plan:", error.message);
      if (error.status === 401) {
        window.location.href = "/login";
      }
    },
  });
}

export function useDeleteSubscriptionPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId) => subscriptionApi.deletePlan(planId),
    onSuccess: (_, planId) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptionPlans"] });
      queryClient.removeQueries({ queryKey: ["subscriptionPlans", planId] });
    },
    onError: (error) => {
      console.error("Failed to delete subscription plan:", error.message);
      if (error.status === 401) {
        window.location.href = "/login";
      }
    },
  });
}

export function useSchoolsByPlanId(planId, options = {}) {
  return useQuery({
    queryKey: ["schoolsByPlanId", planId],
    queryFn: () => subscriptionApi.getSchoolsByPlanId(planId),
    enabled: !!planId && typeof planId === "string",
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error(
        `Failed to fetch schools for plan ${planId}:`,
        error.message
      );
    },
    onSuccess: (data) => {
      console.log(`Successfully fetched schools for plan ${planId}:`, data);
    },
    ...options,
  });
}
