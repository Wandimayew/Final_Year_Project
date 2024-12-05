package com.schoolmanagement.User_Service.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PermissionResponse {
    private Long permissionId;

    private String name;

    private String description;
}