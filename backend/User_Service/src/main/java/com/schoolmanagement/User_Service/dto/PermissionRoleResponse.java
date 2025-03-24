package com.schoolmanagement.User_Service.dto;

import java.util.List;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class PermissionRoleResponse {
    
    private String roleName;
    private List<String> permissionName;
}
