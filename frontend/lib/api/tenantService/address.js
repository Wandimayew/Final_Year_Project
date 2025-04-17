"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createApiService } from "@/lib/api";

export const schoolService = createApiService(
  process.env.NEXT_PUBLIC_API_URL_FOR_TENANT || "http://192.168.1.98/:8080/tenant/api"
);

const addressService = schoolService;
const addressApi = {
  addNewAddress: async (schoolId, addressRequest) => {
    const { data } = await addressService.post(
      `/${schoolId}/addNewAddress`,
      addressRequest,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return data;
  },
  editAddressById: async (schoolId, addressId, addressRequest) => {
    const { data } = await addressService.put(
      `/${schoolId}/editAddressById/${addressId}`,
      addressRequest,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return data;
  },
  getAllAddressesBySchool: async (schoolId) => {
    const { data } = await addressService.get(
      `/${schoolId}/getAllAddressBySchool`
    );
    return data;
  },
  getAddressById: async (schoolId, addressId) => {
    const { data } = await addressService.get(
      `/${schoolId}/getAddressById/${addressId}`
    );
    return data;
  },
  deleteAddressById: async (schoolId, addressId) => {
    const { data } = await addressService.delete(
      `/${schoolId}/deleteAddressById/${addressId}`
    );
    return data;
  },
};

export function useAddresses(schoolId) {
  return useQuery({
    queryKey: ["addresses", schoolId],
    queryFn: () => addressApi.getAllAddressesBySchool(schoolId),
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) =>
      console.error(
        `Failed to fetch addresses for school ${schoolId}:`,
        error.message
      ),
  });
}

export function useAddress(schoolId, addressId) {
  return useQuery({
    queryKey: ["addresses", schoolId, addressId],
    queryFn: () => addressApi.getAddressById(schoolId, addressId),
    enabled: !!schoolId && !!addressId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) =>
      console.error(`Failed to fetch address ${addressId}:`, error.message),
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, addressRequest }) =>
      addressApi.addNewAddress(schoolId, addressRequest),
    onSuccess: (newAddress, { schoolId }) => {
      queryClient.invalidateQueries({ queryKey: ["addresses", schoolId] });
      queryClient.setQueryData(
        ["addresses", schoolId, newAddress.address_id],
        newAddress
      );
    },
    onError: (error) =>
      console.error("Address creation failed:", error.message),
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, addressId, addressRequest }) =>
      addressApi.editAddressById(schoolId, addressId, addressRequest),
    onSuccess: (updatedAddress, { schoolId, addressId }) => {
      queryClient.invalidateQueries({ queryKey: ["addresses", schoolId] });
      queryClient.setQueryData(
        ["addresses", schoolId, addressId],
        updatedAddress
      );
    },
    onError: (error) => console.error("Address update failed:", error.message),
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, addressId }) =>
      addressApi.deleteAddressById(schoolId, addressId),
    onSuccess: (_, { schoolId, addressId }) => {
      queryClient.invalidateQueries({ queryKey: ["addresses", schoolId] });
      queryClient.removeQueries({
        queryKey: ["addresses", schoolId, addressId],
      });
    },
    onError: (error) =>
      console.error("Address deletion failed:", error.message),
  });
}

export { addressApi };
