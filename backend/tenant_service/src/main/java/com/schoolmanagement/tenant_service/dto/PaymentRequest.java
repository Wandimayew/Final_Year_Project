package com.schoolmanagement.tenant_service.dto;

import lombok.Data;

@Data
public class PaymentRequest {
    
    private String schoolId;

    private Long subscriptionId;

    private String status;
}
