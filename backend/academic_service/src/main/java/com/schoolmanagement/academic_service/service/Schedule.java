package com.schoolmanagement.academic_service.service;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.schoolmanagement.academic_service.dto.request.TimeTableRequest.ClassConfig;
import com.schoolmanagement.academic_service.dto.request.TimeTableRequest.SectionConfig;
import com.schoolmanagement.academic_service.dto.request.TimeTableRequest.SubjectConfig;
import com.schoolmanagement.academic_service.dto.request.TimeTableRequest.TeacherConfig;
import com.schoolmanagement.academic_service.dto.request.TimeTableRequest.TimetableConstraints;
import com.schoolmanagement.academic_service.dto.response.TimeTableResponse;
import com.schoolmanagement.academic_service.utility.TimeTableUtils;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class Schedule {
     public List<TimeTableResponse.ScheduleSlot> generateScheduleForSection(
        ClassConfig classConfig,
        SectionConfig sectionConfig,
        Map<String, TeacherConfig> teacherConfigMap,
        List<SubjectConfig> subjectConfigs,
        TimetableConstraints constraints
    ) {
        log.info("Generating schedule for section: {}", sectionConfig.getSectionName());

        List<TimeTableResponse.ScheduleSlot> schedule = new ArrayList<>();
        Map<String, Integer> subjectFrequencyTracker = new HashMap<>();
        Map<String, Integer> teacherLoadTracker = new HashMap<>();
        Map<String, String> lastAssignedTeacherForSection = new HashMap<>();
        LocalTime currentTime = LocalTime.parse(constraints.getSchoolStartTime());

        List<String> daysOfWeek = Arrays.asList("Monday", "Tuesday", "Wednesday", "Thursday", "Friday");
        Map<String, Set<String>> assignedSubjectsPerDay = new HashMap<>();
        for (String day : daysOfWeek) assignedSubjectsPerDay.put(day, new HashSet<>());

        List<SubjectConfig> shuffledSubjects = new ArrayList<>(subjectConfigs);
        Collections.shuffle(shuffledSubjects);

        for (SubjectConfig subject : shuffledSubjects) {
            if (!classConfig.getSubjectIds().contains(subject.getSubjectId())) continue;

            int requiredSessions = subject.getSubjectFrequencyPerWeek();
            subjectFrequencyTracker.put(subject.getSubjectName(), 0);

            for (int i = 0; i < requiredSessions; i++) {
                String assignedTeacherId = findAvailableTeacher(
                    subject, classConfig, teacherConfigMap, teacherLoadTracker, constraints,
                    lastAssignedTeacherForSection, sectionConfig.getSectionName()
                );

                if (assignedTeacherId == null) {
                    throw new RuntimeException("Unable to assign teacher for subject: " + subject.getSubjectName());
                }

                Collections.shuffle(daysOfWeek);
                String assignedDay = TimeTableUtils.findAvailableDay(
                    daysOfWeek, schedule, constraints, assignedSubjectsPerDay, subject
                );

                schedule.add(TimeTableResponse.ScheduleSlot.builder()
                    .subjectName(subject.getSubjectName())
                    .teacherId(assignedTeacherId)
                    .sectionName(sectionConfig.getSectionName())
                    .day(assignedDay)
                    .startTime(currentTime.toString())
                    .endTime(currentTime.plusMinutes(subject.getSubjectDurationInMinutes()).toString())
                    .build());

                currentTime = currentTime.plusMinutes(
                    subject.getSubjectDurationInMinutes() + constraints.getBreakDurationInMinutes()
                );
                teacherLoadTracker.merge(assignedTeacherId, 1, Integer::sum);
                subjectFrequencyTracker.merge(subject.getSubjectName(), 1, Integer::sum);

                if (schedule.size() % constraints.getMaxSubjectsPerDay() == 0) {
                    currentTime = LocalTime.parse(constraints.getSchoolStartTime());
                }
            }
        }

        return schedule;
    }

    private String findAvailableTeacher(
        SubjectConfig subject, ClassConfig classConfig,
        Map<String, TeacherConfig> teacherConfigMap, Map<String, Integer> teacherLoadTracker,
        TimetableConstraints constraints, Map<String, String> lastAssignedTeacherForSection, String sectionName
    ) {
        List<String> availableTeachers = new ArrayList<>();

        for (TeacherConfig teacher : teacherConfigMap.values()) {
            if (!teacher.getSubjectIds().contains(subject.getSubjectId()) ||
                !teacher.getClassNames().contains(classConfig.getClassName())) continue;

            int currentLoad = teacherLoadTracker.getOrDefault(teacher.getTeacherId(), 0);
            if (currentLoad >= teacher.getMaxClassesPerDay()) continue;

            if (sectionName.equals(lastAssignedTeacherForSection.get(sectionName))) continue;

            availableTeachers.add(teacher.getTeacherId());
        }

        if (availableTeachers.isEmpty()) {
            log.error("No teachers available for subject: {}", subject.getSubjectName());
            throw new RuntimeException("Unable to assign teacher for subject: " + subject.getSubjectName());
        }

        String assignedTeacherId = availableTeachers.get(0);
        lastAssignedTeacherForSection.put(sectionName, assignedTeacherId);
        return assignedTeacherId;
    }
}
