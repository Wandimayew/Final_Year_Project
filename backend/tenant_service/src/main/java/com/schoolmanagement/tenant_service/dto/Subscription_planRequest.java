package com.schoolmanagement.tenant_service.dto;

import java.math.BigDecimal;
import java.util.Map;

import lombok.Data;

@Data
public class Subscription_planRequest {
    private String name;

    private BigDecimal price;

    private String billing_cycle;

    private Map<String, Object> features;
}