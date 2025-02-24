package com.schoolmanagement.User_Service.dto;

import lombok.Data;

import java.util.Set;


import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class SignupRequest {

    private Long schoolId;

    // private String fullName;

    private String username;

    private String email;

    private String password;

    private String userAddress;

    private String phoneNumber;
    @JsonProperty("roles")
    private Set<String> roles;

}
