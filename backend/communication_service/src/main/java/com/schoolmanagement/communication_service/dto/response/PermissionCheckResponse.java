package com.schoolmanagement.communication_service.dto.response;

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