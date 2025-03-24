package com.schoolmanagement.User_Service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private String userId;
    private String schoolId;
    private String username;
    private String email;
    private List<String> roles;
    private Set<String> permissions;
    private String message;

}
