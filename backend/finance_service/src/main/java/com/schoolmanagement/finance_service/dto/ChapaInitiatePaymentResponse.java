// package com.schoolmanagement.finance_service.dto;

// import com.fasterxml.jackson.annotation.JsonProperty;
// import lombok.AllArgsConstructor;
// import lombok.Data;
// import lombok.NoArgsConstructor;

// @Data
// @NoArgsConstructor
// @AllArgsConstructor
// public class ChapaInitiatePaymentResponse {
//     private String message;
//     private boolean status;
    
//     private ChapaDataResponse data;

//     @Data
//     @NoArgsConstructor
//     @AllArgsConstructor
//     public static class ChapaDataResponse {
        
//         @JsonProperty("checkout_url")
//         private String checkoutUrl;
        
//         @JsonProperty("tx_ref")
//         private String txRef;
        
//         private String status;
//     }
// }



package com.schoolmanagement.finance_service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChapaInitiatePaymentResponse {
    private String message;
    private String status; // Change from boolean to String
    
    private ChapaDataResponse data;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChapaDataResponse {
        
        @JsonProperty("checkout_url")
        private String checkoutUrl;
        
        @JsonProperty("tx_ref")
        private String txRef;
        
        private String status;
    }

    // Helper method to check if the payment was successful
    public boolean isSuccess() {
        return "success".equalsIgnoreCase(this.status);
    }
}