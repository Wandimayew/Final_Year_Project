package com.schoolmanagement.User_Service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RemoveRoleRequest {
    private String userId;
    private Long roleId;
}
