package com.schoolmanagement.User_Service.dto;

import jakarta.persistence.Column;
import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.Set;

import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class SignupRequest {

    private Long schoolId;

    private String fullName;

    private String username;

    private String email;

    private String password;

    private String userAddress;

    private String phoneNumber;
    @JsonProperty("roles")
    private Set<String> roles;

}
