package com.schoolmanagement.User_Service.dto;

import com.schoolmanagement.User_Service.model.UserRolePermission;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class UserPermissionDTO {
    private String userId;
    private String roleName;
    private String permissionName;
    private boolean isActive;

    public UserPermissionDTO(UserRolePermission urp) {
        this.userId = urp.getUser().getUserId();
        this.roleName = urp.getRole().getName();
        this.permissionName = urp.getPermission().getName();
        this.isActive = urp.getIsActive();
    }
}