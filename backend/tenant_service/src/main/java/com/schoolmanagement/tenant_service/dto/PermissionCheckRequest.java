package com.schoolmanagement.tenant_service.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PermissionCheckRequest {
    private String userId;
    private String schoolId;
    private String endpoint;    // e.g., "/tenant/api/createSchool"
    private String httpMethod;  // e.g., "POST"
}