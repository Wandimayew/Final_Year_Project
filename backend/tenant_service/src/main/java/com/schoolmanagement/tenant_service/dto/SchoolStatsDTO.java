package com.schoolmanagement.tenant_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SchoolStatsDTO {
    private String schoolId;
    private LocalDateTime joinDate; // Maps to created_at
    private boolean isActive;
    private long activeCount; // Added for total active schools
    private long inactiveCount; // Added for total inactive schools
}