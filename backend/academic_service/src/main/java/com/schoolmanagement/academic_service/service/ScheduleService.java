package com.schoolmanagement.academic_service.service;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

import com.schoolmanagement.academic_service.dto.request.TimeTableRequest;
import com.schoolmanagement.academic_service.dto.request.TimeTableRequest.SubjectConfig;
import com.schoolmanagement.academic_service.dto.request.TimeTableRequest.TeacherConfig;
import com.schoolmanagement.academic_service.dto.response.TimeTableResponse;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class ScheduleService {

    private final Validator validator;

    // Helper inner class to represent a teacher's busy time slot.
    private static class TimeSlot {
        String day;
        LocalTime start;
        LocalTime end;

        public TimeSlot(String day, LocalTime start, LocalTime end) {
            this.day = day;
            this.start = start;
            this.end = end;
        }
    }

    // Helper inner class for a proposed scheduling slot.
    private static class ProposedSlot {
        String day;
        LocalTime start;
        LocalTime end;

        public ProposedSlot(String day, LocalTime start, LocalTime end) {
            this.day = day;
            this.start = start;
            this.end = end;
        }
    }

    /**
     * New DTO for aggregated schedule row.
     * Each row represents a subject with:
     * - orderNo
     * - subjectTitle
     * - teacher (ID or name)
     * - schedule: a map for Monday–Friday (empty string if not scheduled)
     */
    public static class AggregatedSchedule {
        private int orderNo;
        private String subjectTitle;
        private String teacher;
        private Map<String, String> schedule;

        public AggregatedSchedule() {
            // Initialize schedule map with empty strings for each day.
            schedule = new LinkedHashMap<>();
            schedule.put("Monday", "");
            schedule.put("Tuesday", "");
            schedule.put("Wednesday", "");
            schedule.put("Thursday", "");
            schedule.put("Friday", "");
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

    /**
     * Aggregates a list of individual schedule slots into a list of
     * AggregatedSchedule.
     * Groups by subject and teacher, and for each day (Monday-Friday) fills in the
     * time range;
     * if no class on a day, leaves an empty string.
     */
    private List<AggregatedSchedule> aggregateScheduleSlots(List<TimeTableResponse.ScheduleSlot> slots) {
        // Group by key: subjectName + "_" + teacherId.
        Map<String, List<TimeTableResponse.ScheduleSlot>> grouped = slots.stream()
                .collect(Collectors.groupingBy(slot -> slot.getSubjectName() + "_" + slot.getTeacherId()));

        List<AggregatedSchedule> aggregatedList = new ArrayList<>();
        for (Map.Entry<String, List<TimeTableResponse.ScheduleSlot>> entry : grouped.entrySet()) {
            List<TimeTableResponse.ScheduleSlot> slotGroup = entry.getValue();
            if (slotGroup.isEmpty()) {
                continue;
            }
            AggregatedSchedule agg = new AggregatedSchedule();
            // Set subject title and teacher from the first slot in the group.
            agg.setSubjectTitle(slotGroup.get(0).getSubjectName());
            agg.setTeacher(slotGroup.get(0).getTeacherId());
            // For each slot, update the schedule map.
            for (TimeTableResponse.ScheduleSlot slot : slotGroup) {
                String day = slot.getDay();
                String timeRange = slot.getStartTime() + " - " + slot.getEndTime();
                String currentValue = agg.getSchedule().get(day);
                if (currentValue != null && !currentValue.isEmpty()) {
                    agg.getSchedule().put(day, currentValue + ", " + timeRange);
                } else {
                    agg.getSchedule().put(day, timeRange);
                }
            }
            aggregatedList.add(agg);
        }
        // Assign order numbers (e.g., based on insertion order)
        int order = 1;
        for (AggregatedSchedule agg : aggregatedList) {
            agg.setOrderNo(order++);
        }
        return aggregatedList;
    }

    public TimeTableResponse generateTimeTable(TimeTableRequest request) {
        log.info("Starting timetable generation process.");
        log.info("Validating the request... and the data is: {}", request);
        validateRequest(request);

        log.info("Parsing teacher configurations...");
        Map<String, TeacherConfig> teacherConfigMap = buildTeacherConfigMap(request.getTeacherConfigs());
        List<SubjectConfig> subjectConfigs = request.getSubjectConfigs();

        // Global map to track busy slots per teacher across sections.
        Map<String, List<TimeSlot>> teacherBusySlots = new HashMap<>();

        log.info("Building timetable...");
        // Generate individual schedule slots first.
        Map<String, Map<String, List<TimeTableResponse.ScheduleSlot>>> rawTimetable = buildTimetable(
                request.getClassConfigs(),
                teacherConfigMap,
                subjectConfigs,
                request.getTimetableConstraints(),
                teacherBusySlots);

        // Aggregate individual schedule slots into aggregated schedules.
        Map<String, Map<String, List<AggregatedSchedule>>> aggregatedTimetable = new HashMap<>();
        for (Map.Entry<String, Map<String, List<TimeTableResponse.ScheduleSlot>>> classEntry : rawTimetable
                .entrySet()) {
            String className = classEntry.getKey();
            Map<String, List<AggregatedSchedule>> aggregatedSectionMap = new HashMap<>();
            for (Map.Entry<String, List<TimeTableResponse.ScheduleSlot>> sectionEntry : classEntry.getValue()
                    .entrySet()) {
                List<TimeTableResponse.ScheduleSlot> slotList = sectionEntry.getValue();
                List<AggregatedSchedule> aggregatedSchedules = aggregateScheduleSlots(slotList);
                aggregatedSectionMap.put(sectionEntry.getKey(), aggregatedSchedules);
            }
            aggregatedTimetable.put(className, aggregatedSectionMap);
        }

        validateTimetableConflicts(rawTimetable);

        log.info("Timetable generated successfully.");
        // NOTE: Ensure your TimeTableResponse.builder() is adapted to accept the
        // aggregated timetable.
        return TimeTableResponse.builder()
                .schoolName(request.getSchoolName())
                .academicYear(request.getAcademicYear())
                .timetable(aggregatedTimetable)
                .message("Timetable generated successfully")
                .statusCode(200)
                .build();
    }

    private Map<String, Map<String, List<TimeTableResponse.ScheduleSlot>>> buildTimetable(
            List<TimeTableRequest.ClassConfig> classConfigs,
            Map<String, TeacherConfig> teacherConfigMap,
            List<SubjectConfig> subjectConfigs,
            TimeTableRequest.TimetableConstraints constraints,
            Map<String, List<TimeSlot>> teacherBusySlots) {

        log.info("Building timetable...");
        Map<String, Map<String, List<TimeTableResponse.ScheduleSlot>>> timetable = new HashMap<>();

        for (TimeTableRequest.ClassConfig classConfig : classConfigs) {
            Map<String, List<TimeTableResponse.ScheduleSlot>> sectionTimetable = new HashMap<>();
            for (TimeTableRequest.SectionConfig section : classConfig.getSections()) {
                List<TimeTableResponse.ScheduleSlot> schedule = generateScheduleForSection(
                        classConfig,
                        section,
                        teacherConfigMap,
                        subjectConfigs,
                        constraints,
                        teacherBusySlots);
                sectionTimetable.put(section.getSectionName(), schedule);
            }
            timetable.put(classConfig.getClassName(), sectionTimetable);
        }
        return timetable;
    }

    /**
     * Clones the busy slots for a teacher from the global map.
     */
    private List<TimeSlot> cloneBusySlots(Map<String, List<TimeSlot>> teacherBusySlots, String teacherId) {
        return teacherBusySlots.containsKey(teacherId) ? new ArrayList<>(teacherBusySlots.get(teacherId))
                : new ArrayList<>();
    }

    /**
     * Schedules sessions for each subject in a given class section.
     * For each subject, we try to assign a teacher that can cover all sessions
     * without conflict.
     * If a teacher is already assigned for the subject, we first try that teacher
     * (using a temporary clone of his busy slots); if any session cannot be
     * scheduled conflict‑free,
     * we remove that assignment and search for an alternative.
     */
    private List<TimeTableResponse.ScheduleSlot> generateScheduleForSection(
            TimeTableRequest.ClassConfig classConfig,
            TimeTableRequest.SectionConfig sectionConfig,
            Map<String, TeacherConfig> teacherConfigMap,
            List<SubjectConfig> subjectConfigs,
            TimeTableRequest.TimetableConstraints constraints,
            Map<String, List<TimeSlot>> teacherBusySlots) {

        log.info("Generating schedule for section: {}", sectionConfig.getSectionName());
        List<TimeTableResponse.ScheduleSlot> schedule = new ArrayList<>();
        Map<String, Integer> teacherLoadTracker = new HashMap<>();
        // Cache teacher assignment for consistency.
        Map<Integer, String> subjectTeacherAssignment = new HashMap<>();
        LocalTime currentTime = LocalTime.parse(constraints.getSchoolStartTime());

        List<String> daysOfWeek = Arrays.asList("Monday", "Tuesday", "Wednesday", "Thursday", "Friday");
        Map<String, Set<String>> assignedSubjectsPerDay = new HashMap<>();
        for (String day : daysOfWeek) {
            assignedSubjectsPerDay.put(day, new HashSet<>());
        }

        List<SubjectConfig> shuffledSubjects = new ArrayList<>(subjectConfigs);
        Collections.shuffle(shuffledSubjects);

        for (SubjectConfig subject : shuffledSubjects) {
            // Skip subjects not offered by the class.
            if (!classConfig.getSubjectIds().contains(subject.getSubjectId()))
                continue;

            boolean scheduledSubject = false;
            List<TimeTableResponse.ScheduleSlot> candidateSlots = new ArrayList<>();
            LocalTime localTimeForSubject = currentTime;

            // First, if a teacher is already assigned, try using that teacher.
            if (subjectTeacherAssignment.containsKey(subject.getSubjectId())) {
                String teacherId = subjectTeacherAssignment.get(subject.getSubjectId());
                boolean success = true;
                candidateSlots.clear();
                List<TimeSlot> tempBusySlots = cloneBusySlots(teacherBusySlots, teacherId);
                localTimeForSubject = currentTime;
                try {
                    for (int i = 0; i < subject.getSubjectFrequencyPerWeek(); i++) {
                        Collections.shuffle(daysOfWeek);
                        String assignedDay = findAvailableDay(daysOfWeek, schedule, constraints, assignedSubjectsPerDay,
                                subject);
                        LocalTime proposedStart = localTimeForSubject.plusMinutes((int) (Math.random() * 10));
                        Map<String, List<TimeSlot>> tempMap = new HashMap<>();
                        tempMap.put(teacherId, tempBusySlots);
                        // Force unboxing of duration using intValue()
                        ProposedSlot ps = adjustProposedSlot(teacherId, assignedDay, proposedStart,
                                subject.getSubjectDurationInMinutes().intValue(), constraints, tempMap, daysOfWeek);
                        candidateSlots.add(TimeTableResponse.ScheduleSlot.builder()
                                .subjectName(subject.getSubjectName())
                                .teacherId(teacherId)
                                .sectionName(sectionConfig.getSectionName())
                                .day(ps.day)
                                .startTime(ps.start.toString())
                                .endTime(ps.end.toString())
                                .build());
                        tempBusySlots.add(new TimeSlot(ps.day, ps.start, ps.end));
                        localTimeForSubject = ps.end.plusMinutes(constraints.getBreakDurationInMinutes());
                    }
                } catch (RuntimeException e) {
                    log.warn(
                            "Assigned teacher {} failed to schedule all sessions for subject {}: {}. Searching alternative teacher.",
                            teacherId, subject.getSubjectName(), e.getMessage());
                    success = false;
                }
                if (success && candidateSlots.size() == subject.getSubjectFrequencyPerWeek()) {
                    scheduledSubject = true;
                    schedule.addAll(candidateSlots);
                    teacherBusySlots.put(teacherId, tempBusySlots);
                    teacherLoadTracker.put(teacherId,
                            teacherLoadTracker.getOrDefault(teacherId, 0) + subject.getSubjectFrequencyPerWeek());
                    currentTime = localTimeForSubject;
                } else {
                    subjectTeacherAssignment.remove(subject.getSubjectId());
                    candidateSlots.clear();
                }
            }

            // If not scheduled yet, try each candidate teacher.
            if (!scheduledSubject) {
                List<String> candidateTeacherIds = teacherConfigMap.values().stream()
                        .filter(teacher -> teacher.getSubjectIds().contains(subject.getSubjectId())
                                && teacher.getClassNames().contains(classConfig.getClassName()))
                        .map(TeacherConfig::getTeacherId)
                        .collect(Collectors.toList());

                for (String candidateTeacher : candidateTeacherIds) {
                    candidateSlots.clear();
                    localTimeForSubject = currentTime;
                    List<TimeSlot> tempBusySlots = cloneBusySlots(teacherBusySlots, candidateTeacher);
                    boolean candidateSuccess = true;
                    try {
                        for (int i = 0; i < subject.getSubjectFrequencyPerWeek(); i++) {
                            Collections.shuffle(daysOfWeek);
                            String candidateDay = findAvailableDay(daysOfWeek, schedule, constraints,
                                    assignedSubjectsPerDay, subject);
                            LocalTime proposedStart = localTimeForSubject.plusMinutes((int) (Math.random() * 10));
                            Map<String, List<TimeSlot>> tempMap = new HashMap<>();
                            tempMap.put(candidateTeacher, tempBusySlots);
                            ProposedSlot ps = adjustProposedSlot(candidateTeacher, candidateDay, proposedStart,
                                    subject.getSubjectDurationInMinutes().intValue(), constraints, tempMap, daysOfWeek);
                            candidateSlots.add(TimeTableResponse.ScheduleSlot.builder()
                                    .subjectName(subject.getSubjectName())
                                    .teacherId(candidateTeacher)
                                    .sectionName(sectionConfig.getSectionName())
                                    .day(ps.day)
                                    .startTime(ps.start.toString())
                                    .endTime(ps.end.toString())
                                    .build());
                            tempBusySlots.add(new TimeSlot(ps.day, ps.start, ps.end));
                            localTimeForSubject = ps.end.plusMinutes(constraints.getBreakDurationInMinutes());
                        }
                    } catch (RuntimeException e) {
                        log.warn("Teacher {} cannot be scheduled for subject {}: {}",
                                candidateTeacher, subject.getSubjectName(), e.getMessage());
                        candidateSuccess = false;
                    }
                    if (candidateSuccess && candidateSlots.size() == subject.getSubjectFrequencyPerWeek()) {
                        scheduledSubject = true;
                        subjectTeacherAssignment.put(subject.getSubjectId(), candidateTeacher);
                        schedule.addAll(candidateSlots);
                        teacherBusySlots.put(candidateTeacher, tempBusySlots);
                        teacherLoadTracker.put(candidateTeacher, teacherLoadTracker.getOrDefault(candidateTeacher, 0)
                                + subject.getSubjectFrequencyPerWeek());
                        currentTime = localTimeForSubject;
                        break;
                    }
                }
                if (!scheduledSubject) {
                    throw new RuntimeException("Unable to assign a teacher for subject: " + subject.getSubjectName());
                }
            }
        }
        return schedule;
    }

    /**
     * Checks for conflicts in the generated timetable.
     * It verifies that no teacher or section has overlapping slots.
     */
    private void validateTimetableConflicts(Map<String, Map<String, List<TimeTableResponse.ScheduleSlot>>> timetable) {
        // Check teacher conflicts.
        Map<String, Map<String, List<TimeTableResponse.ScheduleSlot>>> teacherSlots = new HashMap<>();
        for (Map<String, List<TimeTableResponse.ScheduleSlot>> sectionMap : timetable.values()) {
            for (List<TimeTableResponse.ScheduleSlot> slots : sectionMap.values()) {
                for (TimeTableResponse.ScheduleSlot slot : slots) {
                    teacherSlots.computeIfAbsent(slot.getTeacherId(), k -> new HashMap<>())
                            .computeIfAbsent(slot.getDay(), k -> new ArrayList<>())
                            .add(slot);
                }
            }
        }
        for (Map.Entry<String, Map<String, List<TimeTableResponse.ScheduleSlot>>> teacherEntry : teacherSlots
                .entrySet()) {
            String teacherId = teacherEntry.getKey();
            for (Map.Entry<String, List<TimeTableResponse.ScheduleSlot>> dayEntry : teacherEntry.getValue()
                    .entrySet()) {
                List<TimeTableResponse.ScheduleSlot> slots = dayEntry.getValue();
                slots.sort(Comparator.comparing(slot -> LocalTime.parse(slot.getStartTime())));
                for (int i = 1; i < slots.size(); i++) {
                    LocalTime prevEnd = LocalTime.parse(slots.get(i - 1).getEndTime());
                    LocalTime currentStart = LocalTime.parse(slots.get(i).getStartTime());
                    if (prevEnd.isAfter(currentStart)) {
                        throw new RuntimeException("Conflict detected: Teacher " + teacherId
                                + " has overlapping slots on " + dayEntry.getKey());
                    }
                }
            }
        }

        // Check section conflicts.
        Map<String, Map<String, List<TimeTableResponse.ScheduleSlot>>> sectionSlots = new HashMap<>();
        for (Map.Entry<String, Map<String, List<TimeTableResponse.ScheduleSlot>>> classEntry : timetable.entrySet()) {
            String className = classEntry.getKey();
            for (Map.Entry<String, List<TimeTableResponse.ScheduleSlot>> sectionEntry : classEntry.getValue()
                    .entrySet()) {
                String sectionKey = className + "-" + sectionEntry.getKey();
                for (TimeTableResponse.ScheduleSlot slot : sectionEntry.getValue()) {
                    sectionSlots.computeIfAbsent(sectionKey, k -> new HashMap<>())
                            .computeIfAbsent(slot.getDay(), k -> new ArrayList<>())
                            .add(slot);
                }
            }
        }
        for (Map.Entry<String, Map<String, List<TimeTableResponse.ScheduleSlot>>> sectionEntry : sectionSlots
                .entrySet()) {
            String sectionKey = sectionEntry.getKey();
            for (Map.Entry<String, List<TimeTableResponse.ScheduleSlot>> dayEntry : sectionEntry.getValue()
                    .entrySet()) {
                List<TimeTableResponse.ScheduleSlot> slots = dayEntry.getValue();
                slots.sort(Comparator.comparing(slot -> LocalTime.parse(slot.getStartTime())));
                for (int i = 1; i < slots.size(); i++) {
                    LocalTime prevEnd = LocalTime.parse(slots.get(i - 1).getEndTime());
                    LocalTime currentStart = LocalTime.parse(slots.get(i).getStartTime());
                    if (!prevEnd.isBefore(currentStart)) {
                        throw new RuntimeException("Conflict detected: Section " + sectionKey
                                + " has overlapping slots on " + dayEntry.getKey());
                    }
                }
            }
        }
    }

    // Checks if a teacher is available for a proposed timeslot on a given day.
    private boolean isTeacherAvailable(String teacherId, String day, LocalTime proposedStart, LocalTime proposedEnd,
            Map<String, List<TimeSlot>> teacherBusySlots) {
        List<TimeSlot> busySlots = teacherBusySlots.getOrDefault(teacherId, new ArrayList<>());
        for (TimeSlot slot : busySlots) {
            if (slot.day.equals(day) && proposedStart.isBefore(slot.end) && proposedEnd.isAfter(slot.start)) {
                return false;
            }
        }
        return true;
    }

    private String findAvailableDay(List<String> daysOfWeek, List<TimeTableResponse.ScheduleSlot> schedule,
            TimeTableRequest.TimetableConstraints constraints, Map<String, Set<String>> assignedSubjectsPerDay,
            SubjectConfig subject) {
        for (String day : daysOfWeek) {
            long subjectsOnDay = schedule.stream().filter(slot -> slot.getDay().equals(day)).count();
            if (subjectsOnDay < constraints.getMaxSubjectsPerDay()
                    && !assignedSubjectsPerDay.get(day).contains(subject.getSubjectName())) {
                assignedSubjectsPerDay.get(day).add(subject.getSubjectName());
                return day;
            }
        }
        return daysOfWeek.get(0);
    }

    private Map<String, TeacherConfig> buildTeacherConfigMap(List<TeacherConfig> teacherConfigs) {
        log.info("Building teacher config map...");
        return teacherConfigs.stream().collect(Collectors.toMap(TeacherConfig::getTeacherId, Function.identity()));
    }

    private void validateRequest(TimeTableRequest request) {
        log.info("Validating timetable request...");
        Set<ConstraintViolation<TimeTableRequest>> violations = validator.validate(request);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }
    }

    /**
     * Adjusts the proposed slot to avoid conflicts.
     */
    private ProposedSlot adjustProposedSlot(String teacherId, String day, LocalTime proposedStart, int duration,
            TimeTableRequest.TimetableConstraints constraints, Map<String, List<TimeSlot>> teacherBusySlots,
            List<String> daysOfWeek) {

        AtomicReference<String> currentDay = new AtomicReference<>(day);
        AtomicReference<LocalTime> currentStart = new AtomicReference<>(proposedStart);
        AtomicReference<LocalTime> proposedEndRef = new AtomicReference<>(currentStart.get().plusMinutes(duration));

        // Record attempted schedule keys so we don't repeat the same adjustment.
        Set<String> attemptedSchedules = new HashSet<>();
        int iteration = 0;
        int maxIterations = 1000; // safety guard

        while (!isTeacherAvailable(teacherId, currentDay.get(), currentStart.get(), proposedEndRef.get(),
                teacherBusySlots)) {
            iteration++;
            if (iteration > maxIterations) {
                throw new RuntimeException("Exceeded max iterations for teacher " + teacherId);
            }
            // Build a unique key for the current attempt.
            String scheduleKey = currentDay.get() + "_" + currentStart.get() + "_" + proposedEndRef.get();
            if (attemptedSchedules.contains(scheduleKey)) {
                // Already attempted this schedule; shift to the next day.
                int currentIndex = daysOfWeek.indexOf(currentDay.get());
                int nextIndex = (currentIndex + 1) % daysOfWeek.size();
                currentDay.set(daysOfWeek.get(nextIndex));
                currentStart.set(LocalTime.parse(constraints.getSchoolStartTime()));
                proposedEndRef.set(currentStart.get().plusMinutes(duration));
                scheduleKey = currentDay.get() + "_" + currentStart.get() + "_" + proposedEndRef.get();
                attemptedSchedules.add(scheduleKey);
                continue;
            }
            attemptedSchedules.add(scheduleKey);

            // Check conflicts on the current day.
            List<TimeSlot> conflicts = teacherBusySlots.getOrDefault(teacherId, new ArrayList<>()).stream()
                    .filter(slot -> slot.day.equals(currentDay.get())
                            && currentStart.get().isBefore(slot.end)
                            && proposedEndRef.get().isAfter(slot.start))
                    .collect(Collectors.toList());

            if (!conflicts.isEmpty()) {
                // Shift the start time to the maximum end time among conflicting slots.
                LocalTime maxEnd = conflicts.stream()
                        .map(slot -> slot.end)
                        .max(LocalTime::compareTo)
                        .orElse(currentStart.get());
                currentStart.set(maxEnd);
                proposedEndRef.set(currentStart.get().plusMinutes(duration));
                continue;
            }

            // If the proposed slot goes beyond school end, try the next day.
            if (proposedEndRef.get().isAfter(LocalTime.parse(constraints.getSchoolEndTime()))) {
                int currentIndex = daysOfWeek.indexOf(currentDay.get());
                int nextIndex = (currentIndex + 1) % daysOfWeek.size();
                currentDay.set(daysOfWeek.get(nextIndex));
                currentStart.set(LocalTime.parse(constraints.getSchoolStartTime()));
                proposedEndRef.set(currentStart.get().plusMinutes(duration));
                scheduleKey = currentDay.get() + "_" + currentStart.get() + "_" + proposedEndRef.get();
                attemptedSchedules.add(scheduleKey);
                continue;
            }
        }
        return new ProposedSlot(currentDay.get(), currentStart.get(), proposedEndRef.get());
    }
}
