package com.schoolmanagement.student_service.dto;

import com.schoolmanagement.student_service.model.QRCode.QRCodeStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class QRCodeResponse {

    private Long qrCodeId;
    private Long schoolId;
    private Long classId;
    private Long sectionId;
    private LocalDateTime generatedTime;
    private LocalDateTime expiryTime;
    private String sessionToken;
    private String generatedBy;
    private String qrCodePath;
    private QRCodeStatus status;
}