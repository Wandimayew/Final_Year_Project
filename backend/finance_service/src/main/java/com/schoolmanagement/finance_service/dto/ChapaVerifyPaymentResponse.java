// package com.schoolmanagement.finance_service.dto;

// import com.fasterxml.jackson.annotation.JsonProperty;
// import lombok.AllArgsConstructor;
// import lombok.Data;
// import lombok.NoArgsConstructor;

// import java.math.BigDecimal;

// @Data
// @NoArgsConstructor
// @AllArgsConstructor
// public class ChapaVerifyPaymentResponse {
    
//     private String message;
    
//     private boolean status;
    
//     private ChapaVerifyDataResponse data;
    
//     @Data
//     @NoArgsConstructor
//     @AllArgsConstructor
//     public static class ChapaVerifyDataResponse {
        
//         private BigDecimal amount;
        
//         @JsonProperty("app_fee")
//         private BigDecimal appFee;
        
//         private String currency;
        
//         @JsonProperty("customer_email")
//         private String customerEmail;
        
//         @JsonProperty("customer_name")
//         private String customerName;
        
//         @JsonProperty("customer_phone")
//         private String customerPhone;
        
//         @JsonProperty("first_name")
//         private String firstName;
        
//         @JsonProperty("last_name")
//         private String lastName;
        
//         @JsonProperty("tx_ref")
//         private String txRef;
        
//         @JsonProperty("payment_type")
//         private String paymentType;
        
//         private String reference;
        
//         private String status;
        
//         @JsonProperty("created_at")
//         private String createdAt;
//     }
// }


// package com.schoolmanagement.finance_service.dto;

// import com.fasterxml.jackson.annotation.JsonProperty;
// import lombok.AllArgsConstructor;
// import lombok.Data;
// import lombok.NoArgsConstructor;

// @Data
// @NoArgsConstructor
// @AllArgsConstructor
// public class ChapaVerifyPaymentResponse {
//     private String message;
//     private String status; // Change from boolean to String
    
//     private ChapaVerifyDataResponse data;

//     @Data
//     @NoArgsConstructor
//     @AllArgsConstructor
//     public static class ChapaVerifyDataResponse {
        
//         @JsonProperty("tx_ref")
//         private String txRef;
        
//         @JsonProperty("amount")
//         private double amount;
        
//         @JsonProperty("currency")
//         private String currency;
        
//         @JsonProperty("status")
//         private String status;
//     }

//     // Helper method to check if the payment was successful
//     public boolean isSuccess() {
//         return "success".equalsIgnoreCase(this.status);
//     }
// }


package com.schoolmanagement.finance_service.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.datatype.jsr310.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChapaVerifyPaymentResponse {
    private String message;
    private String status; // Change from boolean to String
    
    private ChapaVerifyDataResponse data;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChapaVerifyDataResponse {
        
        @JsonProperty("first_name")
        private String firstName;
        
        @JsonProperty("last_name")
        private String lastName;
        
        private String email;
        
        @JsonProperty("phone_number")
        private String phoneNumber;
        
        private String currency;
        
        private double amount;
        
        private double charge;
        
        private String mode;
        
        private String method;
        
        private String type;
        
        private String status;
        
        private String reference;
        
        @JsonProperty("tx_ref")
        private String txRef;
        
        private Customization customization;
        
        private Object meta; // Use a more specific type if the structure is known
        
        @JsonProperty("created_at")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSSSS'Z'")
        private LocalDateTime createdAt;
        
        @JsonProperty("updated_at")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSSSS'Z'")
        private LocalDateTime updatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Customization {
        private String title;
        private String description;
        private String logo; // Assuming logo is a URL or base64 string
    }

    // Helper method to check if the payment was successful
    public boolean isSuccess() {
        return "success".equalsIgnoreCase(this.status);
    }
}
