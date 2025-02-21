package com.schoolmanagement.Staff_Service.dto;

import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserResponseDTO {

    private Long userId;
    private Long schoolId;
    private String username;
    private String email;
    private String password;
    private Set<String> roles;
    private boolean isActive;
    
}
