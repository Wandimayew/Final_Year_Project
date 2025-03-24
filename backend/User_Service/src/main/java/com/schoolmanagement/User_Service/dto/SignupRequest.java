package com.schoolmanagement.User_Service.dto;

import lombok.Data;

import java.util.Set;


@Data
public class SignupRequest {

    private String schoolId;

    private String username;

    private String email;

    private String password;

    private Set<String> roles;
}
