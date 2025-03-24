package com.schoolmanagement.tenant_service.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PermissionCheckResponse {
    private String userId;
    private String schoolId;
    private String endpoint;
    private String httpMethod;
    private boolean hasPermission;
}