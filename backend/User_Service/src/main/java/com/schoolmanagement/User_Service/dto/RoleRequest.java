package com.schoolmanagement.User_Service.dto;

import java.util.Set;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class RoleRequest {
    private String schoolId;

    private String name;

    private String description;

    Set<Long> permissions;
}
