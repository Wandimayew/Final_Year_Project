package com.schoolmanagement.User_Service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

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
    private String fullName;
    private String userAddress;
    private String phoneNumber;
    private String gender;
    private Set<Role> roles;
    private boolean isActive;
    private byte[] userPhoto;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}