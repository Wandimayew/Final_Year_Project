package com.schoolmanagement.tenant_service.dto;

import lombok.Data;

@Data
public class PaymentApprovalRequest {

    private Long subscriptionId;

    private String schoolId;

    private Long planId;

    private String newStatus;

    private String currentStatus;

    
}
