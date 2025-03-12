package com.schoolmanagement.student_service.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ParentCommunicationResponse {

    private Long Id;
    private Long studentId;
    private Long schoolId;
    private LocalDateTime sentAt;
    private String message;
    private Long parentId;
}