// "use client";

// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import axios from "axios";

// const financeApi = axios.create({
//   baseURL: 'http://localhost:8087/finance-service/api/finance', 
// });

// // Process a payment
// export const useProcessPayment = () => {
//     const queryClient = useQueryClient();
  
//     return useMutation({
//       mutationFn: async (paymentRequest) => {
//         const response = await financeApi.post("/payments/process", paymentRequest);
//         return response.data;
//       },
//       onSuccess: (paymentResponse) => {
//         queryClient.invalidateQueries({ queryKey: ["payments"] });
//         queryClient.invalidateQueries({ queryKey: ["studentFees"] });
//         queryClient.invalidateQueries({ queryKey: ["fees", "outstanding"] });
//       },
//     });
//   };
  
//   // Get payment by ID
//   export const usePayment = (paymentId) => {
//     return useQuery({
//       queryKey: ["payments", paymentId],
//       queryFn: async () => {
//         const response = await financeApi.get(`/payments/${paymentId}`);
//         return response.data;
//       },
//       enabled: !!paymentId,
//     });
//   };
  
//   // Get payments by date range
//   export const usePaymentsByDateRange = (schoolId, startDate, endDate) => {
//     return useQuery({
//       queryKey: ["payments", "range", schoolId, startDate, endDate],
//       queryFn: async () => {
//         const response = await financeApi.get(`/payments/school/${schoolId}`, {
//           params: { startDate, endDate }
//         });
//         return response.data;
//       },
//       enabled: !!schoolId && !!startDate && !!endDate,
//     });
//   };
  
//   // Generate receipt for a payment
//   export const useGenerateReceipt = (paymentId) => {
//     return useQuery({
//       queryKey: ["payments", "receipt", paymentId],
//       queryFn: async () => {
//         const response = await financeApi.get(`/payments/${paymentId}/receipt`);
//         return response.data;
//       },
//       enabled: !!paymentId,
//     });
//   };
  
//   // Cancel a payment
//   export const useCancelPayment = () => {
//     const queryClient = useQueryClient();
  
//     return useMutation({
//       mutationFn: async ({ paymentId, reason }) => {
//         await financeApi.put(`/payments/${paymentId}/cancel?reason=${encodeURIComponent(reason)}`);
//         return paymentId;
//       },
//       onSuccess: (paymentId) => {
//         queryClient.invalidateQueries({ queryKey: ["payments"] });
//         queryClient.invalidateQueries({ queryKey: ["payments", paymentId] });
//         queryClient.invalidateQueries({ queryKey: ["studentFees"] });
//       },
//     });
//   };


"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const financeApi = axios.create({
  baseURL: 'http://localhost:8087/api/finance',
});

// Process a payment (using /initiate endpoint)
export const useProcessPayment = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async (paymentRequest) => {
        const response = await financeApi.post("/payments/initiate", paymentRequest);
        return response.data;
      },
      onSuccess: (paymentResponse) => {
        if (paymentResponse.checkoutUrl) {
          window.location.href = paymentResponse.checkoutUrl;
        } else {
          queryClient.invalidateQueries({ queryKey: ["payments"] });
          queryClient.invalidateQueries({ queryKey: ["studentFees"] });
          queryClient.invalidateQueries({ queryKey: ["fees", "outstanding"] });
        }
      },
    });
};

// Get payment by ID
export const usePayment = (paymentId) => {
    return useQuery({
      queryKey: ["payments", paymentId],
      queryFn: async () => {
        const response = await financeApi.get(`/payments/${paymentId}`);
        return response.data;
      },
      enabled: !!paymentId,
    });
};

// Get payments by date range
export const usePaymentsByDateRange = (schoolId, startDate, endDate) => {
    return useQuery({
      queryKey: ["payments", "range", schoolId, startDate, endDate],
      queryFn: async () => {
        const response = await financeApi.get(`/payments/school/${schoolId}`, {
          params: { startDate, endDate }
        });
        return response.data;
      },
      enabled: !!schoolId && !!startDate && !!endDate,
    });
};

// Generate receipt for a payment
export const useGenerateReceipt = (paymentId) => {
    return useQuery({
      queryKey: ["payments", "receipt", paymentId],
      queryFn: async () => {
        const response = await financeApi.get(`/payments/${paymentId}/receipt`);
        return response.data;
      },
      enabled: !!paymentId,
    });
};

// Cancel a payment
export const useCancelPayment = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async ({ paymentId, reason }) => {
        await financeApi.put(`/payments/${paymentId}/cancel?reason=${encodeURIComponent(reason)}`);
        return paymentId;
      },
      onSuccess: (paymentId) => {
        queryClient.invalidateQueries({ queryKey: ["payments"] });
        queryClient.invalidateQueries({ queryKey: ["payments", paymentId] });
        queryClient.invalidateQueries({ queryKey: ["studentFees"] });
      },
    });
};

// Handle Chapa webhook callback
export const useHandleChapaCallback = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async (tx_ref) => {
        const response = await financeApi.post("/payments/process", null, {
          params: { tx_ref }
        });
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["payments"] });
        queryClient.invalidateQueries({ queryKey: ["studentFees"] });
      },
    });
};

// Verify payment status by transaction reference
export const useVerifyPayment = (txRef) => {
    return useQuery({
      queryKey: ["payments", "verify", txRef],
      queryFn: async () => {
        const response = await financeApi.get(`/payments/verify/${txRef}`);
        return response.data;
      },
      enabled: !!txRef,
    });
};