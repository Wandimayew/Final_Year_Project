package com.schoolmanagement.tenant_service.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class School_subscriptionsResponse {

    private Long subscription_id;

    private String school_id;

    private Long subscriptionPlan;

    private LocalDate start_date;

    private LocalDate end_date;

    private String status;

    private LocalDateTime created_at;

    private LocalDateTime updated_at;

    private String created_by;
    private boolean isActive;

    private String plan_name;
}
