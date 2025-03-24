package com.schoolmanagement.academic_service.dto.request;

import java.util.List;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TimeTableRequest {

    @NotBlank(message = "School Name must not be null or empty")
    private String schoolName;

    @NotBlank(message = "School ID must not be null or empty")
    private String schoolId;

    @NotBlank(message = "Academic Year must not be null or empty")
    private String academicYear;

    @NotNull(message = "Class configurations must not be null")
    private List<ClassConfig> classConfigs;

    @NotNull(message = "Teacher configurations must not be null")
    private List<TeacherConfig> teacherConfigs;

    @NotNull(message = "Subject configurations must not be null")
    private List<SubjectConfig> subjectConfigs;

    @NotNull(message = "Stream configurations must not be null")
    private List<StreamConfig> streamConfigs;

    @NotNull(message = "Timetable constraints must not be null")
    private TimetableConstraints timetableConstraints;

    @Data
    public static class ClassConfig {
        @NotNull(message = "Class ID must not be null")
        private Long classId;

        @NotBlank(message = "Class name must not be null or empty")
        private String className;

        @NotNull(message = "Sections must not be null")
        private List<SectionConfig> sections;

        @NotNull(message = "Subjects for the class must not be null")
        private List<Long> subjectIds;
    }

    @Data
    public static class SectionConfig {
        @NotNull(message = "Section ID must not be null")
        private Long sectionId;

        @NotBlank(message = "Section name must not be null or empty")
        private String sectionName;

        @NotNull(message = "Stream Id must not be null")
        private Long streamId;
    }

    @Data
    public static class TeacherConfig {
        @NotBlank(message = "Teacher name must not be null or empty")
        private String teacherName;

        @NotBlank(message = "Teacher Id must not be null or empty")
        private String teacherId;

        @NotNull(message = "Subjects taught by the teacher must not be null")
        private List<Long> subjectIds;

        @NotNull(message = "Classes assigned to the teacher must not be null")
        private List<String> classNames;

        @NotNull(message = "Maximum classes per week must not be null")
        @Min(value = 1, message = "Maximum classes per week must be at least 1")
        private Integer maxClassesPerWeek;

        @NotNull(message = "Maximum classes per day must not be null")
        @Min(value = 1, message = "Maximum classes per day must be at least 1")
        private Integer maxClassesPerDay;
    }

    @Data
    public static class SubjectConfig {
        @NotBlank(message = "Subject name must not be null or empty")
        private String subjectName;

        @NotNull(message = "Subject Id must not be null")
        private Long subjectId;

        @NotNull(message = "Subject duration in minutes must not be null")
        @Min(value = 1, message = "Subject duration in minutes must be at least 1 minute")
        private Integer subjectDurationInMinutes;

        @NotNull(message = "Frequency of subject per week must not be null")
        @Min(value = 1, message = "Frequency of subject per week must be at least 1")
        private Integer subjectFrequencyPerWeek;
    }

    @Data
    public static class StreamConfig {
        @NotBlank(message = "Stream name must not be null or empty")
        private String streamName;

        @NotNull(message = "Classes in the stream must not be null")
        private List<String> classNames;
    }

    @Data
    public static class TimetableConstraints {
        @NotNull(message = "Maximum subjects per day must not be null")
        @Min(value = 1, message = "Maximum subjects per day must be at least 1")
        private Integer maxSubjectsPerDay;

        @NotNull(message = "Break duration in minutes must not be null")
        @Min(value = 1, message = "Break duration in minutes must be at least 1 minute")
        private Integer breakDurationInMinutes;

        @NotNull(message = "School start time must not be null")
        private String schoolStartTime;

        @NotNull(message = "School end time must not be null")
        private String schoolEndTime;
    }
}