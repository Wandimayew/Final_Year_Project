package com.schoolmanagement.User_Service.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Set;

@Data
@Builder
public class SignupResponse {
    private String userId;
    private String username;
    private String email;
    private String schoolId;
    private Set<String> roles;
}