package com.schoolmanagement.Staff_Service.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.schoolmanagement.Staff_Service.enums.AttendanceStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor 
@Builder
public class StaffAttendanceResponseDTO {

    private Long attendanceId;
    
    private Long staffId;
    
    private String schoolId;

    private String sessionToken;

    private LocalDate date;
    
    private String recordedBy;

    private Long classId;
    
    private AttendanceStatus status;
    
    private String remark;

    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;

    private LocalDateTime inTime;

    private LocalDateTime outTime;
    
    private String createdBy;

    private String updatedBy;

    private Boolean isActive;

    private Long qrCodeId;
}


