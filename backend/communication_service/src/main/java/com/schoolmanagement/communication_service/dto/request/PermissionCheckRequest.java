package com.schoolmanagement.communication_service.dto.request;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PermissionCheckRequest {
    private String userId;
    private String schoolId;
    private String endpoint; // e.g., "/tenant/api/createSchool"
    private String httpMethod; // e.g., "POST"
}