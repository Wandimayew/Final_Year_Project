package com.schoolmanagement.User_Service.dto;

import jakarta.persistence.Column;
import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.Set;

import org.springframework.web.multipart.MultipartFile;

@Data
public class SignupRequest {

    private Long schoolId;

    private String fullName;

    private String username;

    private String email;

    private String password;

    private String userAddress;

    private MultipartFile userPhoto;

    private String phoneNumber;

    private String gender;

    private Set<String> roles;

}
