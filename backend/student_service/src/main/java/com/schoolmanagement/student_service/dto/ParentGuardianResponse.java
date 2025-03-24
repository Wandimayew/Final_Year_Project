package com.schoolmanagement.student_service.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

@Data
public class ParentGuardianResponse {

    private Long parentId;
    private String schoolId;
    private String fatherName;
    private String motherName;
    private String otherFamilyMemberName;
    private String relation;
    private String email;
    private JsonNode address;
    private String phoneNumber;
}