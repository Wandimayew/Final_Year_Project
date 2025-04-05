package com.schoolmanagement.tenant_service.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SchoolsForPlanResponse {

    private List<SchoolResponse> schools;
    
    private Long planId;

    private boolean isActive;
    
}
