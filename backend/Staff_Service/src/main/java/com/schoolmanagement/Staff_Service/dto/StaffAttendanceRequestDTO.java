package com.schoolmanagement.Staff_Service.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.schoolmanagement.Staff_Service.enums.AttendanceStatus;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;

@Data
public class StaffAttendanceRequestDTO {

    private Long staffId;
    
    private Long schoolId;

    private String sessionToken;
    
    private LocalDate date;
    
    private String recordedBy;

    private Long classId;

    private LocalDateTime inTime;  
    
    private LocalDateTime outTime;
    
    @Enumerated(EnumType.STRING)
    private AttendanceStatus status;

    private Long qrCodeId;
    
    private String remark;

    

}
