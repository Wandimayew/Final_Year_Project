package com.schoolmanagement.student_service.dto;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class StudentRequest {

    @NotBlank(message = "Student ID cannot be blank")
    @Size(max = 50, message = "Student ID cannot exceed 50 characters")
    private String studentId;

    @NotNull(message = "User ID cannot be null")
    private Long userId;

    @NotNull(message = "School ID cannot be null")
    private Long schoolId;

    @NotNull(message = "Class ID cannot be null")
    private Long classId;

    @NotNull(message = "Section ID cannot be null")
    private Long sectionId;

    @NotBlank(message = "First name cannot be blank")
    @Size(max = 100, message = "First name cannot exceed 100 characters")
    private String firstName;

    @Size(max = 100, message = "Middle name cannot exceed 100 characters")
    private String middleName;

    @NotBlank(message = "Last name cannot be blank")
    @Size(max = 100, message = "Last name cannot exceed 100 characters")
    private String lastName;

    private String nationalId;

    @NotBlank(message = "Username cannot be blank")
    @Size(max = 50, message = "Username cannot exceed 50 characters")
    private String username;

    @NotNull(message = "Date of birth cannot be null")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    @NotBlank(message = "Gender cannot be blank")
    @Pattern(regexp = "Male|Female", message = "Gender must be Male, Female, or Other")
    private String gender;

    private String contactInfo;

    @Size(max = 255, message = "Photo URL cannot exceed 255 characters")
    private String photo;

    @NotNull(message = "Address cannot be null")
    private JsonNode address;

    private boolean isActive;

    private boolean isPassed;

    @NotNull(message = "Admission date cannot be null")
    @PastOrPresent(message = "Admission date cannot be in the future")
    private LocalDate admissionDate;

    @NotNull(message = "Parent ID cannot be null")
    private Long parentId;
}