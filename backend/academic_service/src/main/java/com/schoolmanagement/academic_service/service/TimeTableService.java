// package com.schoolmanagement.academic_service.service;

// import java.time.LocalTime;
// import java.util.ArrayList;
// import java.util.Arrays;
// import java.util.Collections;
// import java.util.HashMap;
// import java.util.HashSet;
// import java.util.List;
// import java.util.Map;
// import java.util.Set;
// import java.util.function.Function;
// import java.util.stream.Collectors;

// import org.springframework.stereotype.Service;

// import com.schoolmanagement.academic_service.dto.request.TimeTableRequest;
// import com.schoolmanagement.academic_service.dto.request.TimeTableRequest.SubjectConfig;
// import com.schoolmanagement.academic_service.dto.request.TimeTableRequest.TeacherConfig;
// import com.schoolmanagement.academic_service.dto.response.TimeTableResponse;

// import jakarta.validation.ConstraintViolation;
// import jakarta.validation.ConstraintViolationException;
// import jakarta.validation.Validator;

// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;

// @Service
// @Slf4j
// @RequiredArgsConstructor
// public class TimeTableService {

//     private final Validator validator;

//     public TimeTableResponse generateTimeTable(TimeTableRequest request) {
//         log.info("Starting timetable generation process.");

//         // Validate the request
//         log.info("Validating the request...");
//         validateRequest(request);

//         // Parse constraints and configurations
//         log.info("Parsing teacher configurations...");
//         Map<String, TeacherConfig> teacherConfigMap = buildTeacherConfigMap(request.getTeacherConfigs());
//         List<SubjectConfig> subjectConfigs = request.getSubjectConfigs();

//         log.info("Building timetable...");
//         // Build the timetable
//         Map<String, Map<String, List<TimeTableResponse.ScheduleSlot>>> timetable = buildTimetable(
//                 request.getClassConfigs(),
//                 teacherConfigMap,
//                 subjectConfigs,
//                 request.getTimetableConstraints());

//         // Create and return response
//         log.info("Timetable generated successfully.");
//         return TimeTableResponse.builder()
//                 .schoolName(request.getSchoolName())
//                 .academicYear(request.getAcademicYear())
//                 .timetable(timetable)
//                 .message("Timetable generated successfully")
//                 .statusCode(200)
//                 .build();
//     }

//     private Map<String, Map<String, List<TimeTableResponse.ScheduleSlot>>> buildTimetable(
//             List<TimeTableRequest.ClassConfig> classConfigs,
//             Map<String, TeacherConfig> teacherConfigMap,
//             List<SubjectConfig> subjectConfigs,
//             TimeTableRequest.TimetableConstraints constraints) {
//         log.info("Building timetable...");

//         Map<String, Map<String, List<TimeTableResponse.ScheduleSlot>>> timetable = new HashMap<>();

//         for (TimeTableRequest.ClassConfig classConfig : classConfigs) {
//             Map<String, List<TimeTableResponse.ScheduleSlot>> sectionTimetable = new HashMap<>();
//             for (TimeTableRequest.SectionConfig section : classConfig.getSections()) {
//                 List<TimeTableResponse.ScheduleSlot> schedule = generateScheduleForSection(
//                         classConfig,
//                         section,
//                         teacherConfigMap,
//                         subjectConfigs,
//                         constraints);
//                 sectionTimetable.put(section.getSectionName(), schedule);
//             }
//             timetable.put(classConfig.getClassName(), sectionTimetable);
//         }

//         return timetable;
//     }

//     private List<TimeTableResponse.ScheduleSlot> generateScheduleForSection(
//         TimeTableRequest.ClassConfig classConfig,
//         TimeTableRequest.SectionConfig sectionConfig,
//         Map<String, TeacherConfig> teacherConfigMap,
//         List<SubjectConfig> subjectConfigs,
//         TimeTableRequest.TimetableConstraints constraints) {
//         log.info("Generating schedule for section: {}", sectionConfig.getSectionName());
    
//         List<TimeTableResponse.ScheduleSlot> schedule = new ArrayList<>();
//         Map<String, Integer> subjectFrequencyTracker = new HashMap<>();
//         Map<String, Integer> teacherLoadTracker = new HashMap<>();
//         Map<String, String> lastAssignedTeacherForSection = new HashMap<>();
//         LocalTime currentTime = LocalTime.parse(constraints.getSchoolStartTime());
    
//         List<String> daysOfWeek = new ArrayList<>(Arrays.asList("Monday", "Tuesday", "Wednesday", "Thursday", "Friday"));
//         Map<String, Set<String>> assignedSubjectsPerDay = new HashMap<>();
    
//         // Initialize the subjects tracker for each day
//         for (String day : daysOfWeek) {
//             assignedSubjectsPerDay.put(day, new HashSet<>());
//         }
    
//         // Shuffle the subject list to vary the order
//         List<SubjectConfig> shuffledSubjects = new ArrayList<>(subjectConfigs);
//         Collections.shuffle(shuffledSubjects);
    
//         for (SubjectConfig subject : shuffledSubjects) {
//             if (!classConfig.getSubjectIds().contains(subject.getSubjectId())) continue;
    
//             int requiredSessions = subject.getSubjectFrequencyPerWeek();
//             subjectFrequencyTracker.put(subject.getSubjectName(), 0);
    
//             for (int i = 0; i < requiredSessions; i++) {
//                 // Find an available teacher
//                 String assignedTeacherId = findAvailableTeacher(
//                     subject,
//                     classConfig,
//                     teacherConfigMap,
//                     teacherLoadTracker,
//                     constraints,
//                     lastAssignedTeacherForSection,
//                     sectionConfig.getSectionName());
    
//                 if (assignedTeacherId == null) {
//                     throw new RuntimeException("Unable to assign teacher for subject: " + subject.getSubjectName());
//                 }
    
//                 // Shuffle the days to add randomness
//                 Collections.shuffle(daysOfWeek);
//                 String assignedDay = findAvailableDay(daysOfWeek, schedule, constraints, assignedSubjectsPerDay, subject);
    
//                 // Adjust current time with random offset for variability
//                 currentTime = currentTime.plusMinutes((int) (Math.random() * 10));
    
//                 // Add the schedule slot
//                 schedule.add(TimeTableResponse.ScheduleSlot.builder()
//                     .subjectName(subject.getSubjectName())
//                     .teacherId(assignedTeacherId)
//                     .sectionName(sectionConfig.getSectionName())
//                     .day(assignedDay)
//                     .startTime(currentTime.toString())
//                     .endTime(currentTime.plusMinutes(subject.getSubjectDurationInMinutes()).toString())
//                     .build());
    
//                 // Update trackers
//                 currentTime = currentTime.plusMinutes(subject.getSubjectDurationInMinutes() + constraints.getBreakDurationInMinutes());
//                 teacherLoadTracker.put(assignedTeacherId, teacherLoadTracker.getOrDefault(assignedTeacherId, 0) + 1);
//                 subjectFrequencyTracker.put(subject.getSubjectName(),
//                     subjectFrequencyTracker.get(subject.getSubjectName()) + 1);
    
//                 // Respect daily limits
//                 if (schedule.size() % constraints.getMaxSubjectsPerDay() == 0) {
//                     currentTime = LocalTime.parse(constraints.getSchoolStartTime()); // Start the next day
//                 }
    
//                 // Reset time if past end time
//                 if (currentTime.isAfter(LocalTime.parse(constraints.getSchoolEndTime()))) {
//                     currentTime = LocalTime.parse(constraints.getSchoolStartTime());
//                 }
//             }
//         }
    
//         return schedule;
//     }
    


//     private String findAvailableDay(List<String> daysOfWeek, List<TimeTableResponse.ScheduleSlot> schedule,
//             TimeTableRequest.TimetableConstraints constraints, Map<String, Set<String>> assignedSubjectsPerDay,
//             SubjectConfig subject) {

//         // Try to assign the subject to a day that hasn't yet had this subject scheduled
//         for (String day : daysOfWeek) {
//             // Ensure no day exceeds the max subjects per day limit
//             long subjectsOnDay = schedule.stream()
//                     .filter(slot -> slot.getDay().equals(day))
//                     .count();

//             if (subjectsOnDay < constraints.getMaxSubjectsPerDay() &&
//                     !assignedSubjectsPerDay.get(day).contains(subject.getSubjectName())) {
//                 assignedSubjectsPerDay.get(day).add(subject.getSubjectName());
//                 return day;
//             }
//         }

//         // If all days have been exhausted, fallback to the first available day
//         return daysOfWeek.get(0); // If all days are full, fallback to the first day
//     }

//     private String findAvailableTeacher(
//             SubjectConfig subject,
//             TimeTableRequest.ClassConfig classConfig,
//             Map<String, TeacherConfig> teacherConfigMap,
//             Map<String, Integer> teacherLoadTracker,
//             TimeTableRequest.TimetableConstraints constraints,
//             Map<String, String> lastAssignedTeacherForSection,
//             String sectionName) {
//         List<String> availableTeachers = new ArrayList<>();

//         for (TeacherConfig teacher : teacherConfigMap.values()) {
//             if (!teacher.getSubjectIds().contains(subject.getSubjectId()))
//                 continue;
//             if (!teacher.getClassNames().contains(classConfig.getClassName()))
//                 continue;

//             int currentLoad = teacherLoadTracker.getOrDefault(teacher.getTeacherId(), 0);

//             // Check if teacher is overworked
//             if (currentLoad >= teacher.getMaxClassesPerDay()) {
//                 log.info("Teacher {} exceeded max load: {}/{}", teacher.getTeacherName(), currentLoad,
//                         teacher.getMaxClassesPerDay());
//                 continue; // Skip this teacher if they exceeded their load
//             }

//             // Ensure the teacher hasn't been assigned to the same section for this subject
//             // recently
//             if (lastAssignedTeacherForSection.containsKey(sectionName) &&
//                     lastAssignedTeacherForSection.get(sectionName).equals(teacher.getTeacherId())) {
//                 log.info("Teacher {} already assigned to section {} for this subject.", teacher.getTeacherName(),
//                         sectionName);
//                 continue; // Skip the teacher to avoid consecutive teaching of the same subject
//             }

//             // Add to the list of available teachers if they are eligible
//             availableTeachers.add(teacher.getTeacherId());
//         }

//         if (availableTeachers.isEmpty()) {
//             log.error("No teachers available for subject: {}", subject.getSubjectName());
//             throw new RuntimeException("Unable to assign teacher for subject: " + subject.getSubjectName());
//         }

//         // Return the first available teacher (or use your preferred selection strategy)
//         String assignedTeacherId = availableTeachers.get(0);
//         lastAssignedTeacherForSection.put(sectionName, assignedTeacherId);
//         return assignedTeacherId;
//     }

//     private Map<String, TeacherConfig> buildTeacherConfigMap(List<TeacherConfig> teacherConfigs) {
//         log.info("Building teacher config map...");
//         return teacherConfigs.stream().collect(Collectors.toMap(TeacherConfig::getTeacherId, Function.identity()));
//     }

//     private void validateRequest(TimeTableRequest request) {
//         log.info("Validating timetable request...");

//         Set<ConstraintViolation<TimeTableRequest>> violations = validator.validate(request);
//         if (!violations.isEmpty()) {
//             log.error("Request validation failed with violations: {}", violations);
//             throw new ConstraintViolationException(violations);
//         }
//     }
// }