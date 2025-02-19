package com.schoolmanagement.academic_service.dto.response;

import java.util.List;
import java.util.Map;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TimeTableResponse {

    private String schoolName;
    private String academicYear;
    private Map<String, Map<String, List<ScheduleSlot>>> timetable;
    private String message;
    private int statusCode;

    // Schedule Slot represents the details for each subject's class slot in the timetable
    @Data
    @Builder
    public static class ScheduleSlot {
        private String subjectName;
        private String teacherId;
        private String sectionName;
        private String startTime;
        private String endTime;
        private String day;
    }
}
