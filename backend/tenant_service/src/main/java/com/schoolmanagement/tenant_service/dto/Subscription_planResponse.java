package com.schoolmanagement.tenant_service.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class Subscription_planResponse {
    
    private Long plan_id;

    private String name;

    private BigDecimal price;

    private String billing_cycle;

    private Map<String, Object> features;

    private LocalDateTime created_at;

    private LocalDateTime updated_at;

    private String created_by;

    private boolean isActive;

}
