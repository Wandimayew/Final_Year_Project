package com.schoolmanagement.academic_service.service;

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
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduleService {

    private final Validator validator;
    private final ClassRepository classRepository;
    private final SectionRepository sectionRepository;
    private final StreamRepository streamRepository;
    private final SubjectRepository subjectRepository;

    private static final List<String> DAYS_OF_WEEK = Arrays.asList("Monday", "Tuesday", "Wednesday", "Thursday", "Friday");

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

        @Override
        public String toString() {
            StringBuilder sb = new StringBuilder();
            sb.append("{orderNo=").append(orderNo)
                    .append(", subjectTitle=").append(subjectTitle)
                    .append(", teacher=").append(teacher)
                    .append(", schedule={");
            schedule.forEach((day, time) -> sb.append(day).append("=").append(time.isEmpty() ? "None" : time).append(", "));
            if (!schedule.isEmpty()) sb.setLength(sb.length() - 2); // Remove trailing ", "
            sb.append("}}");
            return sb.toString();
        }
    }

    public TimeTableResponse generateTimeTable(TimeTableRequest request) {
        log.info("Starting timetable generation process for school: {}", request.getSchoolName());
        validateRequest(request);
        validateEntitiesExistence(request);

        Map<String, Map<String, List<TimeTableResponse.ScheduleSlot>>> rawTimetable = generateTimetable(request);
        Map<String, Map<String, List<AggregatedSchedule>>> aggregatedTimetable = aggregateTimetable(rawTimetable);

        return TimeTableResponse.builder()
                .schoolName(request.getSchoolName())
                .academicYear(request.getAcademicYear())
                .timetable(aggregatedTimetable)
                .message("Timetable generated successfully")
                .statusCode(200)
                .build();
    }

    private Map<String, Map<String, List<TimeTableResponse.ScheduleSlot>>> generateTimetable(TimeTableRequest request) {
        Map<String, TeacherConfig> teacherConfigMap = buildTeacherConfigMap(request.getTeacherConfigs());
        Map<String, Map<String, List<TimeSlot>>> timetable = new HashMap<>();
        Random random = new Random();

        // Initialize timetable structure
        for (TimeTableRequest.ClassConfig classConfig : request.getClassConfigs()) {
            String classKey = "Class-" + classConfig.getClassId();
            Map<String, List<TimeSlot>> sectionSchedules = new HashMap<>();
            for (TimeTableRequest.SectionConfig section : classConfig.getSections()) {
                sectionSchedules.put("Section-" + section.getSectionId(), new ArrayList<>());
            }
            timetable.put(classKey, sectionSchedules);
        }

        // Calculate daily slots
        LocalTime startTime = LocalTime.parse(request.getTimetableConstraints().getSchoolStartTime());
        int subjectsPerDay = request.getTimetableConstraints().getMaxSubjectsPerDay();
        List<LocalTime[]> dailySlots = new ArrayList<>();
        LocalTime current = startTime;
        int breakAfter = subjectsPerDay / 2;
        for (int i = 0; i < subjectsPerDay; i++) {
            LocalTime end = current.plusMinutes(40);
            dailySlots.add(new LocalTime[]{current, end});
            current = end;
            if (i == breakAfter - 1) current = current.plusMinutes(15);
        }

        // Subject frequency tracking
        Map<String, Integer> subjectFrequencyRemaining = new HashMap<>();
        Map<String, SubjectConfig> subjectConfigMap = new HashMap<>();
        for (SubjectConfig sub : request.getSubjectConfigs()) {
            subjectFrequencyRemaining.put(sub.getSubjectName(), sub.getSubjectFrequencyPerWeek());
            subjectConfigMap.put(sub.getSubjectName(), sub);
        }

        // Global assignment
        List<String> allClassKeys = new ArrayList<>(timetable.keySet());
        int totalSlotsAssigned = 0;
        int totalDemand = subjectFrequencyRemaining.values().stream().mapToInt(Integer::intValue).sum();

        // Main scheduling pass
        for (String day : DAYS_OF_WEEK) {
            Map<String, Set<String>> usedSubjectsPerClass = new HashMap<>();
            allClassKeys.forEach(classKey -> usedSubjectsPerClass.put(classKey, new HashSet<>()));

            for (int slotIndex = 0; slotIndex < subjectsPerDay; slotIndex++) {
                Collections.shuffle(allClassKeys, random);
                for (String classKey : allClassKeys) {
                    String className = request.getClassConfigs().stream()
                            .filter(c -> ("Class-" + c.getClassId()).equals(classKey))
                            .findFirst().get().getClassName();
                    List<TimeSlot> sectionSchedule = timetable.get(classKey).values().iterator().next();

                    List<SubjectConfig> availableSubjects = request.getClassConfigs().stream()
                            .filter(c -> ("Class-" + c.getClassId()).equals(classKey))
                            .flatMap(c -> request.getSubjectConfigs().stream()
                                    .filter(sub -> c.getSubjectIds().contains(sub.getSubjectId())))
                            .filter(sub -> subjectFrequencyRemaining.getOrDefault(sub.getSubjectName(), 0) > 0)
                            .sorted((a, b) -> subjectFrequencyRemaining.get(b.getSubjectName()) - subjectFrequencyRemaining.get(a.getSubjectName())) // Prioritize high frequency
                            .collect(Collectors.toList());
                    Collections.shuffle(availableSubjects, random);

                    boolean assigned = false;
                    for (SubjectConfig candidate : availableSubjects) {
                        if (usedSubjectsPerClass.get(classKey).contains(candidate.getSubjectName())) {
                            continue; // No repeats per class/day in main pass
                        }

                        List<TeacherConfig> availableTeachers = new ArrayList<>(teacherConfigMap.values());
                        Collections.shuffle(availableTeachers, random);

                        for (TeacherConfig teacher : availableTeachers) {
                            if (!teacher.getSubjectIds().contains(candidate.getSubjectId()) || 
                                !teacher.getClassNames().contains(className)) {
                                continue;
                            }

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

                            if (dailyLoad < teacher.getMaxClassesPerDay() && weeklyLoad < teacher.getMaxClassesPerWeek()) {
                                TimeSlot slot = new TimeSlot(day, dailySlots.get(slotIndex)[0], dailySlots.get(slotIndex)[1],
                                        teacher.getTeacherId(), candidate.getSubjectName());
                                if (isSlotValid(slot, teacher.getTeacherId(), sectionSchedule, timetable)) {
                                    sectionSchedule.add(slot);
                                    subjectFrequencyRemaining.put(candidate.getSubjectName(),
                                            subjectFrequencyRemaining.get(candidate.getSubjectName()) - 1);
                                    usedSubjectsPerClass.get(classKey).add(candidate.getSubjectName());
                                    totalSlotsAssigned++;
                                    assigned = true;
                                    break;
                                }
                            }
                        }
                        if (assigned) break;
                    }
                }
            }
        }

        // Forced assignment for remaining slots
        for (String day : DAYS_OF_WEEK) {
            for (int slotIndex = 0; slotIndex < subjectsPerDay && subjectFrequencyRemaining.values().stream().anyMatch(freq -> freq > 0); slotIndex++) {
                for (String classKey : allClassKeys) {
                    String className = request.getClassConfigs().stream()
                            .filter(c -> ("Class-" + c.getClassId()).equals(classKey))
                            .findFirst().get().getClassName();
                    List<TimeSlot> sectionSchedule = timetable.get(classKey).values().iterator().next();

                    List<SubjectConfig> remainingSubjects = request.getSubjectConfigs().stream()
                            .filter(sub -> subjectFrequencyRemaining.getOrDefault(sub.getSubjectName(), 0) > 0)
                            .sorted((a, b) -> subjectFrequencyRemaining.get(b.getSubjectName()) - subjectFrequencyRemaining.get(a.getSubjectName()))
                            .collect(Collectors.toList());

                    for (SubjectConfig candidate : remainingSubjects) {
                        List<TeacherConfig> availableTeachers = teacherConfigMap.values().stream()
                                .filter(t -> t.getSubjectIds().contains(candidate.getSubjectId()) && t.getClassNames().contains(className))
                                .collect(Collectors.toList());
                        Collections.shuffle(availableTeachers, random);

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

                            if (dailyLoad < teacher.getMaxClassesPerDay() && weeklyLoad < teacher.getMaxClassesPerWeek()) {
                                TimeSlot slot = new TimeSlot(day, dailySlots.get(slotIndex)[0], dailySlots.get(slotIndex)[1],
                                        teacher.getTeacherId(), candidate.getSubjectName());
                                if (isSlotValid(slot, teacher.getTeacherId(), sectionSchedule, timetable)) {
                                    sectionSchedule.add(slot);
                                    subjectFrequencyRemaining.put(candidate.getSubjectName(),
                                            subjectFrequencyRemaining.get(candidate.getSubjectName()) - 1);
                                    totalSlotsAssigned++;
                                    break;
                                }
                            }
                        }
                        if (subjectFrequencyRemaining.get(candidate.getSubjectName()) == 0) break;
                    }
                }
            }
        }

        int remaining = subjectFrequencyRemaining.values().stream().mapToInt(Integer::intValue).sum();
        if (remaining > 0) {
            log.info("Remaining subjects: {}", subjectFrequencyRemaining);
            throw new RuntimeException("Failed to assign all subjects: " + remaining + " remaining");
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
        for (Map.Entry<String, Map<String, List<TimeTableResponse.ScheduleSlot>>> classEntry : rawTimetable.entrySet()) {
            Map<String, List<AggregatedSchedule>> sectionMap = new HashMap<>();
            for (Map.Entry<String, List<TimeTableResponse.ScheduleSlot>> sectionEntry : classEntry.getValue().entrySet()) {
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
            if (slotGroup.isEmpty()) continue;
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