package com.schoolmanagement.academic_service.utility;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.schoolmanagement.academic_service.dto.request.TimeTableRequest;
import com.schoolmanagement.academic_service.dto.request.TimeTableRequest.SubjectConfig;
import com.schoolmanagement.academic_service.dto.request.TimeTableRequest.TeacherConfig;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class TimeTableUtils {
    public static Map<String, TeacherConfig> buildTeacherConfigMap(List<TeacherConfig> teacherConfigs) {
        log.info("Building teacher config map...");
        return teacherConfigs.stream().collect(Collectors.toMap(TeacherConfig::getTeacherId, Function.identity()));
    }

    public static String findAvailableDay(
        List<String> daysOfWeek,
        List<com.schoolmanagement.academic_service.dto.response.TimeTableResponse.ScheduleSlot> schedule,
        TimeTableRequest.TimetableConstraints constraints,
        Map<String, Set<String>> assignedSubjectsPerDay,
        SubjectConfig subject
    ) {
        for (String day : daysOfWeek) {
            long subjectsOnDay = schedule.stream()
                                         .filter(slot -> slot.getDay().equals(day))
                                         .count();
            if (subjectsOnDay < constraints.getMaxSubjectsPerDay() &&
                !assignedSubjectsPerDay.get(day).contains(subject.getSubjectName())) {
                assignedSubjectsPerDay.get(day).add(subject.getSubjectName());
                return day;
            }
        }
        return daysOfWeek.get(0); // Fallback
    }
}
