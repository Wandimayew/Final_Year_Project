package com.schoolmanagement.User_Service.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;


import lombok.Builder;

@Data
@Builder
public class RoleResponse {
    private String roleId;

    private String schoolId;

    private String name;

    private String description;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String createdBy;

    private Set<Long> permissions;
}
