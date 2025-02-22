package com.schoolmanagement.User_Service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.schoolmanagement.User_Service.model.Role;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {

    private Long userId;
    private Long schoolId;
    private String username;
    private String email;
<<<<<<< HEAD
    private String fullName;
    private String userAddress;
    private String phoneNumber;
=======
    private String password;
    // private String fullName;
    // private String userAddress;
    // private String phoneNumber;
>>>>>>> 81b6b4b (Staff Service added)
    @JsonProperty("roles")
    private Set<Role> roles;
    private boolean isActive;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}