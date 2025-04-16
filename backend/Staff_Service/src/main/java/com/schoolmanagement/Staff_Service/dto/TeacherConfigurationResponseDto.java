package com.schoolmanagement.Staff_Service.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class TeacherConfigurationResponseDto {

    private final Long id;

    private final Long teacherId;

    private final String schoolId;

    private final Integer coursesPerDay;

    private final Integer teachingDaysPerWeek;

    private final LocalDateTime createdAt;

    private final LocalDateTime updatedAt;

    private final String createdBy;

    private final String updatedBy;

    private final Boolean isActive;
}
