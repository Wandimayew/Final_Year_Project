package com.schoolmanagement.academic_service.service;

import java.time.LocalTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.schoolmanagement.academic_service.dto.request.TimeTableRequest;
import com.schoolmanagement.academic_service.dto.request.TimeTableRequest.SubjectConfig;
import com.schoolmanagement.academic_service.dto.request.TimeTableRequest.TeacherConfig;
import com.schoolmanagement.academic_service.dto.response.TimeTableResponse;
import com.schoolmanagement.academic_service.repository.ClassRepository;
import com.schoolmanagement.academic_service.repository.SectionRepository;
import com.schoolmanagement.academic_service.repository.StreamRepository;
import com.schoolmanagement.academic_service.repository.SubjectRepository;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduleService {

    private final Validator validator;
    private final ClassRepository classRepository;
    private final SectionRepository sectionRepository;
    private final StreamRepository streamRepository;
    private final SubjectRepository subjectRepository;

    private static final List<String> DAYS_OF_WEEK = Arrays.asList("Monday", "Tuesday", "Wednesday", "Thursday",
            "Friday");

    private static class TimeSlot {
        String day;
        LocalTime start;
        LocalTime end;
        String teacherId;
        String subjectName;

        TimeSlot(String day, LocalTime start, LocalTime end, String teacherId, String subjectName) {
            this.day = day;
            this.start = start;
            this.end = end;
            this.teacherId = teacherId;
            this.subjectName = subjectName;
        }

        TimeSlot copy() {
            return new TimeSlot(day, start, end, teacherId, subjectName);
        }

        boolean overlaps(TimeSlot other) {
            return this.day.equals(other.day) && this.start.isBefore(other.end) && this.end.isAfter(other.start);
        }
    }

    public static class AggregatedSchedule {
        private int orderNo;
        private String subjectTitle;
        private String teacher;
        private Map<String, String> schedule;

        public AggregatedSchedule() {
            schedule = new LinkedHashMap<>();
            DAYS_OF_WEEK.forEach(day -> schedule.put(day, ""));
        }

        public int getOrderNo() {
            return orderNo;
        }

        public void setOrderNo(int orderNo) {
            this.orderNo = orderNo;
        }

        public String getSubjectTitle() {
            return subjectTitle;
        }

        public void setSubjectTitle(String subjectTitle) {
            this.subjectTitle = subjectTitle;
        }

        public String getTeacher() {
            return teacher;
        }

        public void setTeacher(String teacher) {
            this.teacher = teacher;
        }

        public Map<String, String> getSchedule() {
            return schedule;
        }

        public void setSchedule(Map<String, String> schedule) {
            this.schedule = schedule;
        }
    }

    public TimeTableResponse generateTimeTable(TimeTableRequest request) {
        log.info("Starting timetable generation process for school: {}", request.getSchoolName());
        validateRequest(request);
        validateEntitiesExistence(request);

        Map<String, Map<String, List<TimeTableResponse.ScheduleSlot>>> rawTimetable = generateTimetableCSP(request);
        Map<String, Map<String, List<AggregatedSchedule>>> aggregatedTimetable = aggregateTimetable(rawTimetable);

        return TimeTableResponse.builder()
                .schoolName(request.getSchoolName())
                .academicYear(request.getAcademicYear())
                .timetable(aggregatedTimetable)
                .message("Timetable generated successfully")
                .statusCode(200)
                .build();
    }

    private Map<String, Map<String, List<TimeTableResponse.ScheduleSlot>>> generateTimetableCSP(
            TimeTableRequest request) {
        Map<String, TeacherConfig> teacherConfigMap = buildTeacherConfigMap(request.getTeacherConfigs());
        Map<String, Map<String, Integer>> sectionSubjectFrequency = new HashMap<>();
        Map<String, Map<String, List<TimeSlot>>> timetable = new HashMap<>();

        // Initialize timetable and frequency map
        for (TimeTableRequest.ClassConfig classConfig : request.getClassConfigs()) {
            if (classConfig.getSections().isEmpty() || classConfig.getSubjectIds().isEmpty())
                continue;
            Map<String, List<TimeSlot>> sectionSchedules = new HashMap<>();
            for (TimeTableRequest.SectionConfig section : classConfig.getSections()) {
                String sectionKey = "Section-" + section.getSectionId();
                sectionSchedules.put(sectionKey, new ArrayList<>());
                Map<String, Integer> subjectFreq = new HashMap<>();
                for (SubjectConfig sub : request.getSubjectConfigs()) {
                    if (classConfig.getSubjectIds().contains(sub.getSubjectId())) {
                        subjectFreq.put(sub.getSubjectName(), sub.getSubjectFrequencyPerWeek());
                    }
                }
                sectionSubjectFrequency.put(sectionKey, subjectFreq);
            }
            timetable.put("Class-" + classConfig.getClassId(), sectionSchedules);
        }

        // CSP Backtracking
        if (!assignSchedules(timetable, sectionSubjectFrequency, teacherConfigMap, request.getTimetableConstraints())) {
            throw new RuntimeException("Failed to generate a valid timetable: No feasible solution found.");
        }

        // Convert to response format
        Map<String, Map<String, List<TimeTableResponse.ScheduleSlot>>> rawTimetable = new HashMap<>();
        for (Map.Entry<String, Map<String, List<TimeSlot>>> classEntry : timetable.entrySet()) {
            Map<String, List<TimeTableResponse.ScheduleSlot>> sectionMap = new HashMap<>();
            for (Map.Entry<String, List<TimeSlot>> sectionEntry : classEntry.getValue().entrySet()) {
                List<TimeTableResponse.ScheduleSlot> slots = sectionEntry.getValue().stream()
                        .map(slot -> TimeTableResponse.ScheduleSlot.builder()
                                .subjectName(slot.subjectName)
                                .teacherId(slot.teacherId)
                                .sectionName(sectionEntry.getKey())
                                .day(slot.day)
                                .startTime(slot.start.toString())
                                .endTime(slot.end.toString())
                                .build())
                        .collect(Collectors.toList());
                sectionMap.put(sectionEntry.getKey(), slots);
            }
            rawTimetable.put(classEntry.getKey(), sectionMap);
        }
        return rawTimetable;
    }

    private boolean assignSchedules(
            Map<String, Map<String, List<TimeSlot>>> timetable,
            Map<String, Map<String, Integer>> sectionSubjectFrequency,
            Map<String, TeacherConfig> teacherConfigMap,
            TimeTableRequest.TimetableConstraints constraints) {
        // Find the next unassigned subject
        Optional<Map.Entry<String, Map.Entry<String, Integer>>> nextAssignment = sectionSubjectFrequency.entrySet()
                .stream()
                .flatMap(sectionEntry -> sectionEntry.getValue().entrySet().stream()
                        .filter(freqEntry -> freqEntry.getValue() > 0)
                        .map(freqEntry -> Map.entry(sectionEntry.getKey(), freqEntry)))
                .findFirst();

        if (!nextAssignment.isPresent())
            return true; // All subjects assigned

        String sectionKey = nextAssignment.get().getKey();
        String subjectName = nextAssignment.get().getValue().getKey();
        String classKey = timetable.entrySet().stream()
                .filter(entry -> entry.getValue().containsKey(sectionKey))
                .map(Map.Entry::getKey)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Class not found for section: " + sectionKey));
        String className = classKey.replace("Class-", "");
        SubjectConfig subjectConfig = getSubjectConfig(subjectName, sectionSubjectFrequency);

        LocalTime schoolStart = LocalTime.parse(constraints.getSchoolStartTime());
        LocalTime schoolEnd = LocalTime.parse(constraints.getSchoolEndTime());
        int duration = subjectConfig.getSubjectDurationInMinutes();

        for (String day : DAYS_OF_WEEK) {
            List<TimeSlot> currentDaySchedule = timetable.get(classKey).get(sectionKey).stream()
                    .filter(slot -> slot.day.equals(day))
                    .sorted(Comparator.comparing(s -> s.start))
                    .collect(Collectors.toList());

            if (currentDaySchedule.size() >= constraints.getMaxSubjectsPerDay())
                continue;

            LocalTime currentTime = currentDaySchedule.isEmpty() ? schoolStart
                    : currentDaySchedule.get(currentDaySchedule.size() - 1).end;
            int subjectsToday = currentDaySchedule.size();

            // Add break dynamically if needed (after 3 subjects or to fit schedule)
            if (subjectsToday >= 3 && currentTime.plusMinutes(duration).isAfter(schoolEnd)) {
                currentTime = currentTime.plusMinutes(constraints.getBreakDurationInMinutes());
            }
            LocalTime endTime = currentTime.plusMinutes(duration);
            if (endTime.isAfter(schoolEnd))
                continue;

            List<TeacherConfig> availableTeachers = teacherConfigMap.values().stream()
                    .filter(t -> t.getSubjectIds().contains(subjectConfig.getSubjectId()) &&
                            t.getClassNames().contains(className))
                    .collect(Collectors.toList());

            for (TeacherConfig teacher : availableTeachers) {
                int dailyLoad = timetable.values().stream()
                        .flatMap(m -> m.values().stream())
                        .flatMap(List::stream)
                        .filter(slot -> slot.day.equals(day) && slot.teacherId.equals(teacher.getTeacherId()))
                        .mapToInt(s -> 1)
                        .sum();
                int weeklyLoad = timetable.values().stream()
                        .flatMap(m -> m.values().stream())
                        .flatMap(List::stream)
                        .filter(slot -> slot.teacherId.equals(teacher.getTeacherId()))
                        .mapToInt(s -> 1)
                        .sum();

                if (dailyLoad >= teacher.getMaxClassesPerDay() || weeklyLoad >= teacher.getMaxClassesPerWeek())
                    continue;

                TimeSlot proposedSlot = new TimeSlot(day, currentTime, endTime, teacher.getTeacherId(), subjectName);
                List<TimeSlot> sectionSchedule = timetable.get(classKey).get(sectionKey);

                if (isSlotValid(proposedSlot, teacher.getTeacherId(), sectionSchedule, timetable)) {
                    sectionSchedule.add(proposedSlot);
                    sectionSubjectFrequency.get(sectionKey).put(subjectName,
                            sectionSubjectFrequency.get(sectionKey).get(subjectName) - 1);

                    if (assignSchedules(timetable, sectionSubjectFrequency, teacherConfigMap, constraints)) {
                        return true;
                    }

                    sectionSchedule.remove(proposedSlot);
                    sectionSubjectFrequency.get(sectionKey).put(subjectName,
                            sectionSubjectFrequency.get(sectionKey).get(subjectName) + 1);
                }
            }
        }
        return false;
    }

    private SubjectConfig getSubjectConfig(String subjectName,
            Map<String, Map<String, Integer>> sectionSubjectFrequency) {
        for (SubjectConfig config : sectionSubjectFrequency.values().iterator().next().keySet().stream()
                .map(name -> new SubjectConfig() {
                    {
                        setSubjectName(name);
                        setSubjectId(sectionSubjectFrequency.entrySet().stream()
                                .flatMap(e -> e.getValue().entrySet().stream())
                                .filter(e -> e.getKey().equals(name))
                                .findFirst().map(e -> Long.valueOf(allSubjects().stream()
                                        .filter(s -> s.getSubjectName().equals(name))
                                        .findFirst().get().getSubjectId()))
                                .orElse(0L));
                        setSubjectDurationInMinutes(40);
                        setSubjectFrequencyPerWeek(sectionSubjectFrequency.values().iterator().next().get(name));
                    }
                })
                .collect(Collectors.toList())) {
            if (config.getSubjectName().equals(subjectName))
                return config;
        }
        throw new RuntimeException("Subject config not found for: " + subjectName);
    }

    private List<SubjectConfig> allSubjects() {
        return subjectRepository.findAll().stream()
                .map(sub -> new SubjectConfig() {
                    {
                        setSubjectName(sub.getSubjectName());
                        setSubjectId(sub.getSubjectId());
                        setSubjectDurationInMinutes(40);
                        setSubjectFrequencyPerWeek(0); // Placeholder, updated in CSP
                    }
                })
                .collect(Collectors.toList());
    }

    private boolean isSlotValid(TimeSlot proposedSlot, String teacherId, List<TimeSlot> sectionSchedule,
            Map<String, Map<String, List<TimeSlot>>> timetable) {
        for (TimeSlot slot : sectionSchedule) {
            if (slot.day.equals(proposedSlot.day) && slot.overlaps(proposedSlot))
                return false;
        }

        for (Map<String, List<TimeSlot>> classSchedules : timetable.values()) {
            for (List<TimeSlot> slots : classSchedules.values()) {
                for (TimeSlot slot : slots) {
                    if (slot.teacherId.equals(teacherId) && slot.overlaps(proposedSlot))
                        return false;
                }
            }
        }
        return true;
    }

    private void validateEntitiesExistence(TimeTableRequest request) {
        String schoolId = request.getSchoolId();
        for (TimeTableRequest.ClassConfig classConfig : request.getClassConfigs()) {
            if (classConfig.getSections().isEmpty() || classConfig.getSubjectIds().isEmpty())
                continue;
            if (classRepository.findBySchoolAndClassId(schoolId, classConfig.getClassId()) == null) {
                throw new IllegalArgumentException(
                        "Class ID " + classConfig.getClassId() + " does not exist for school " + schoolId);
            }
            for (TimeTableRequest.SectionConfig section : classConfig.getSections()) {
                if (sectionRepository.findBySchoolAndSectionId(schoolId, section.getSectionId()) == null) {
                    throw new IllegalArgumentException(
                            "Section ID " + section.getSectionId() + " does not exist for school " + schoolId);
                }
                if (streamRepository.findBySchoolAndStreamId(schoolId, section.getStreamId()) == null) {
                    throw new IllegalArgumentException(
                            "Stream ID " + section.getStreamId() + " does not exist for school " + schoolId);
                }
            }
            for (Long subjectId : classConfig.getSubjectIds()) {
                if (subjectRepository.findBySchoolAndSubjectId(schoolId, subjectId) == null) {
                    throw new IllegalArgumentException(
                            "Subject ID " + subjectId + " does not exist for school " + schoolId);
                }
            }
        }
    }

    private Map<String, Map<String, List<AggregatedSchedule>>> aggregateTimetable(
            Map<String, Map<String, List<TimeTableResponse.ScheduleSlot>>> rawTimetable) {
        Map<String, Map<String, List<AggregatedSchedule>>> aggregatedTimetable = new HashMap<>();
        for (Map.Entry<String, Map<String, List<TimeTableResponse.ScheduleSlot>>> classEntry : rawTimetable
                .entrySet()) {
            Map<String, List<AggregatedSchedule>> sectionMap = new HashMap<>();
            for (Map.Entry<String, List<TimeTableResponse.ScheduleSlot>> sectionEntry : classEntry.getValue()
                    .entrySet()) {
                sectionMap.put(sectionEntry.getKey(), aggregateScheduleSlots(sectionEntry.getValue()));
            }
            aggregatedTimetable.put(classEntry.getKey(), sectionMap);
        }
        return aggregatedTimetable;
    }

    private List<AggregatedSchedule> aggregateScheduleSlots(List<TimeTableResponse.ScheduleSlot> slots) {
        Map<String, List<TimeTableResponse.ScheduleSlot>> grouped = slots.stream()
                .collect(Collectors.groupingBy(slot -> slot.getSubjectName() + "_" + slot.getTeacherId()));
        List<AggregatedSchedule> aggregatedList = new ArrayList<>();
        for (Map.Entry<String, List<TimeTableResponse.ScheduleSlot>> entry : grouped.entrySet()) {
            List<TimeTableResponse.ScheduleSlot> slotGroup = entry.getValue();
            if (slotGroup.isEmpty())
                continue;
            AggregatedSchedule agg = new AggregatedSchedule();
            agg.setSubjectTitle(slotGroup.get(0).getSubjectName());
            agg.setTeacher(slotGroup.get(0).getTeacherId());
            for (TimeTableResponse.ScheduleSlot slot : slotGroup) {
                String timeRange = slot.getStartTime() + " - " + slot.getEndTime();
                agg.getSchedule().put(slot.getDay(), timeRange);
            }
            aggregatedList.add(agg);
        }
        int order = 1;
        for (AggregatedSchedule agg : aggregatedList) {
            agg.setOrderNo(order++);
        }
        return aggregatedList;
    }

    private Map<String, TeacherConfig> buildTeacherConfigMap(List<TeacherConfig> teacherConfigs) {
        return teacherConfigs.stream().collect(Collectors.toMap(TeacherConfig::getTeacherId, Function.identity()));
    }

    private void validateRequest(TimeTableRequest request) {
        Set<ConstraintViolation<TimeTableRequest>> violations = validator.validate(request);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }
        LocalTime start = LocalTime.parse(request.getTimetableConstraints().getSchoolStartTime());
        LocalTime end = LocalTime.parse(request.getTimetableConstraints().getSchoolEndTime());
        if (start.isAfter(end)) {
            throw new IllegalArgumentException("School start time must be before end time");
        }
    }
}