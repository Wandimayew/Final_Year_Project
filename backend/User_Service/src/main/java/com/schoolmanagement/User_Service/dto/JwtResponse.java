package com.schoolmanagement.User_Service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long userId;
    private Long schoolId;
    private String username;
    private String email;
    private List<String> roles;
    private String message;

}
