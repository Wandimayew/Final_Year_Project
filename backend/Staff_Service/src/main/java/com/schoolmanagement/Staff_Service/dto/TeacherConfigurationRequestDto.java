package com.schoolmanagement.Staff_Service.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TeacherConfigurationRequestDto {

    @NotNull(message = "Teacher ID is required")
    private Long teacherId;

    @NotNull(message = "School ID is required")
    private String schoolId;

    @NotNull(message = "Courses per day is required")
    @Min(value = 0, message = "Courses per day cannot be negative")
    @Max(value = 10, message = "Courses per day cannot exceed 10")
    private Integer coursesPerDay;

    @NotNull(message = "Teaching days per week is required")
    @Min(value = 1, message = "Teaching days per week must be at least 1")
    @Max(value = 7, message = "Teaching days per week cannot exceed 7")
    private Integer teachingDaysPerWeek;

    @NotNull(message = "Active status cannot be null")
    private Boolean isActive;
    
}
