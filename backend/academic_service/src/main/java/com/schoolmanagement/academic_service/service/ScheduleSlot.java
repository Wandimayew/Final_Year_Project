package com.schoolmanagement.academic_service.service;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ScheduleSlot {
    private String subjectName;       // Name of the subject
    private String teacherId;         // ID of the assigned teacher
    private String sectionName;       // Name of the section (e.g., "Section A")
    private String startTime;         // Start time of the slot (e.g., "09:00")
    private String endTime;           // End time of the slot (e.g., "09:45")
}

