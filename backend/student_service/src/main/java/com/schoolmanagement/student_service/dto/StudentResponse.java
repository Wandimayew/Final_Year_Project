package com.schoolmanagement.student_service.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

import java.time.LocalDate;

@Data
public class StudentResponse {

    private Long studentId;
    private String registId;
    private String userId;
    private String schoolId;
    private Long classId;
    private Long sectionId;
    private String firstName;
    private String middleName;
    private String lastName;
    private String nationalId;
    private String username;
    private LocalDate dateOfBirth;
    private String gender;
    private String contactInfo;
    private String photo;
    private JsonNode address;
    private boolean active;
    private boolean passed;
    private LocalDate admissionDate;
    private Long parentId;
}