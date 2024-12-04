package com.schoolmanagement.User_Service.dto;

import jakarta.persistence.Column;
import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.Set;

import org.springframework.web.multipart.MultipartFile;

@Data
public class SignupRequest {

    @NotNull(message = "School ID cannot be null")
    private Long schoolId;

    @NotBlank(message = "Full name cannot be blank")
    private String fullName;

    @NotBlank(message = "Username cannot be blank")
    private String username;

    @NotBlank(message = "Email cannot be blank")
    private String email;

    @NotBlank(message = "Password cannot be blank")
    private String password;

    @Size(max = 255, message = "Address cannot exceed 255 characters")
    private String userAddress;

    @Lob
    private MultipartFile userPhoto;

    @NotBlank(message = "Phone number cannot be blank")
    private String phoneNumber;

    @NotBlank(message = "Gender cannot be blank")
    private String gender;

    private Set<String> roles;

}
