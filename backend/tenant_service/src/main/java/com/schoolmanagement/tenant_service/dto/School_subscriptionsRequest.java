package com.schoolmanagement.tenant_service.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.schoolmanagement.tenant_service.model.School;
import com.schoolmanagement.tenant_service.model.Subscription_plans;

import lombok.Data;
import lombok.extern.java.Log;

@Data
public class School_subscriptionsRequest {

    private Long school_id;

    private Long subscriptionPlan;

    private LocalDate start_date;

    private LocalDate end_date;

    private String status;
}
