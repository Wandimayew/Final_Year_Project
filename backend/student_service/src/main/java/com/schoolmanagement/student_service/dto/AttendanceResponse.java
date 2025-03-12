package com.schoolmanagement.student_service.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AttendanceResponse {

    private Long attendanceId;
    private Long schoolId;
    private Long classId;
    private Long studentId;
    private Long qrCodeId;
    private LocalDateTime attendanceDate;
    private String recordedBy;
    private String remarks;
}