package com.schoolmanagement.User_Service.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;


@Data
public class PermissionRequest {
    // @Size(max = 50, message = "Permission name cannot exceed 50 characters")
    private String name;

    // @Size(max = 255, message = "Description cannot exceed 255 characters")
    private String description;
}
