package com.schoolmanagement.User_Service.dto;

import com.schoolmanagement.User_Service.model.Permission;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class PermissionDTO {
    private Long permissionId;
    private String name;
    private String schoolId;
    private String endpoint;
    private String httpMethod;
    private String description;
    private boolean is_active;

    public PermissionDTO(Permission permission) {
        this.permissionId = permission.getPermissionId();
        this.name = permission.getName();
        this.schoolId = permission.getSchoolId();
        this.endpoint = permission.getEndpoint();
        this.httpMethod = permission.getHttpMethod();
        this.description = permission.getDescription();
        this.is_active = permission.getIs_active();
    }
}