package com.schoolmanagement.student_service.dto;

import lombok.Data;

@Data
public class QRCodeScanRequest {
    private String schoolId;
    private Long classId;
    private Long studentId;
    private Long qrCodeId;
    private String recordedBy;
}
