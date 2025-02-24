package com.schoolmanagement.academic_service.dto.response;

import java.util.List;
import java.util.Map;

import com.schoolmanagement.academic_service.service.ScheduleService.AggregatedSchedule;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TimeTableResponse {
    private String schoolName;
    private String academicYear;
    private Map<String, Map<String, List<AggregatedSchedule>>> timetable;
    private String message;
    private int statusCode;
    
    @Data
    @Builder
    public static class ScheduleSlot {
        private String subjectName;
        private String teacherId;
        private String sectionName;
        private String day;
        private String startTime;
        private String endTime;
    }
}

