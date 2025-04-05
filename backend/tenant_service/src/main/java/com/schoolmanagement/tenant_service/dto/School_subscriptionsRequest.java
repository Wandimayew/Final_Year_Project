package com.schoolmanagement.tenant_service.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class School_subscriptionsRequest {

    private String school_id;

    private Long subscriptionPlan;

    private LocalDate start_date;

    private LocalDate end_date;

    private String status;
}
