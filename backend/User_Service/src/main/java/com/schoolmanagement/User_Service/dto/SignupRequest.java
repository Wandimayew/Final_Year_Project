package com.schoolmanagement.User_Service.dto;

import lombok.Data;

import java.util.Set;

import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class SignupRequest {

    private String schoolId;

    private String username;

    private String email;

    private String password;

    @JsonProperty("roles")
    private Set<String> roles;

    @JsonProperty("permissions")
    private Set<String> permissions;
}
