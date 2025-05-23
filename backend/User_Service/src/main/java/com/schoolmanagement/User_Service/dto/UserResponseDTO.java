package com.schoolmanagement.User_Service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {

    private String userId;
    private String schoolId;
    private String username;
    private String email;
    private String password;
    @JsonProperty("roles")
    private Set<String> roles;
    private Set<String> permissions;
    private boolean isActive;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}