package com.schoolmanagement.User_Service.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class JwtResponse {
    private String token;
    private String refreshToken; // New field
    private String userId;
    private String schoolId;
    private String username;
    private String email;
    private List<String> roles;
    private String message;
}