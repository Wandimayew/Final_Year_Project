package com.schoolmanagement.User_Service.dto;

import lombok.Data;


@Data
public class RoleRequest {
    
    private Long schoolId;

    private String name;

    private String description;
 
    private Long permissions;
}
