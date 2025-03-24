package com.schoolmanagement.User_Service.dto;

import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignPermissionsRequest {
    private String userId;
    private Long roleId;
    private Set<Long> permissionIds;
}