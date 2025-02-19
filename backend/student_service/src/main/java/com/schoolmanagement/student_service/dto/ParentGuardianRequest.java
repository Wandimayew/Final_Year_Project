package com.schoolmanagement.student_service.dto;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ParentGuardianRequest {

    @NotNull(message = "School ID cannot be null")
    private Long schoolId;

    @Size(max = 100, message = "Father name cannot exceed 100 characters")
    private String fatherName;

    @Size(max = 100, message = "Mother name cannot exceed 100 characters")
    private String motherName;

    @Size(max = 100, message = "Other family member name cannot exceed 100 characters")
    private String otherFamilyMemberName;

    @NotBlank(message = "Relation cannot be blank")
    @Size(max = 50, message = "Relation cannot exceed 50 characters")
    private String relation;

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email must be a valid email address")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    private String email;

    @NotNull(message = "Address cannot be null")
    private JsonNode address;

    @NotBlank(message = "Phone number cannot be blank")
    @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Phone number must be a valid number with 10-15 digits")
    private String phoneNumber;
}