package com.schoolmanagement.student_service.dto;

import com.schoolmanagement.student_service.model.QRCode.QRCodeStatus;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class QRCodeRequest {


    @NotNull(message = "Class ID cannot be null")
    private Long classId;

    @NotNull(message = "Section ID cannot be null")
    private Long sectionId;

    @Future(message = "Expiry time must be in the future")
    private LocalDateTime expiryTime;

    @NotNull(message = "Status cannot be null")
    private QRCodeStatus status;
}