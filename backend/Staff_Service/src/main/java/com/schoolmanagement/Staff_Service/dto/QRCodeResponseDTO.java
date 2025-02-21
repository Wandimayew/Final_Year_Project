package com.schoolmanagement.Staff_Service.dto;

import java.time.LocalDateTime;

import com.schoolmanagement.Staff_Service.enums.QRCodeStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class QRCodeResponseDTO {

    private Long qrCodeId;

    private Long schoolId;

    private LocalDateTime generatedTime;

    private Integer startTimeHour;

    private Integer startTimeMinute;

    private Integer endTimeHour;

    private Integer endTimeMinute;

    private String sessionToken;

    private String qrCodeImage;

    private String generatedBy;

    private QRCodeStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String createdBy;

    private String updatedBy;

    private Boolean isActive;
}
