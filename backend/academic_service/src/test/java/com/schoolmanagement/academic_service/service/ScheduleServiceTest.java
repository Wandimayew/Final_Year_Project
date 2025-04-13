package com.schoolmanagement.academic_service.service;

import com.schoolmanagement.academic_service.dto.request.TimeTableRequest;
import com.schoolmanagement.academic_service.dto.response.TimeTableResponse;
import com.schoolmanagement.academic_service.model.Class;
import com.schoolmanagement.academic_service.model.Section;
import com.schoolmanagement.academic_service.model.Stream;
import com.schoolmanagement.academic_service.model.Subject;
import com.schoolmanagement.academic_service.repository.ClassRepository;
import com.schoolmanagement.academic_service.repository.SectionRepository;
import com.schoolmanagement.academic_service.repository.StreamRepository;
import com.schoolmanagement.academic_service.repository.SubjectRepository;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest
public class ScheduleServiceTest {

    @Autowired
    private ScheduleService scheduleService;

    @MockBean
    private ClassRepository classRepository;

    @MockBean
    private SectionRepository sectionRepository;

    @MockBean
    private StreamRepository streamRepository;

    @MockBean
    private SubjectRepository subjectRepository;

    @MockBean
    private Validator validator;

    @Test
    public void testGenerateTimeTable() {
        when(validator.validate(any())).thenReturn(Collections.emptySet());
    
        TimeTableRequest request = new TimeTableRequest();
        request.setSchoolId("school1");
        request.setSchoolName("Test School");
        request.setAcademicYear("2023-2024");
    
        TimeTableRequest.TimetableConstraints constraints = new TimeTableRequest.TimetableConstraints();
        constraints.setSchoolStartTime("14:00");
        constraints.setSchoolEndTime("18:15");
        constraints.setMaxSubjectsPerDay(6); // Configurable: 4, 6, etc.
        constraints.setBreakDurationInMinutes(15);
        request.setTimetableConstraints(constraints);
    
        // 4 classes
        List<TimeTableRequest.ClassConfig> classConfigs = new ArrayList<>();
        for (long i = 1; i <= 4; i++) {
            TimeTableRequest.ClassConfig classConfig = new TimeTableRequest.ClassConfig();
            classConfig.setClassId(i);
            classConfig.setClassName("Class " + i);
            classConfig.setSubjectIds(Arrays.asList(1L, 2L, 3L, 4L, 5L, 6L)); // All subjects available
            TimeTableRequest.SectionConfig section = new TimeTableRequest.SectionConfig();
            section.setSectionId(i);
            section.setSectionName("Section A");
            section.setStreamId(1L);
            classConfig.setSections(Arrays.asList(section));
            classConfigs.add(classConfig);
        }
        request.setClassConfigs(classConfigs);
    
        // Subjects with variable frequencies
        List<TimeTableRequest.SubjectConfig> subjects = Arrays.asList(
                createSubject(1L, "Math", 20),     // Total 20/week (e.g., 4/day across classes)
                createSubject(2L, "English", 16),  // 4/week per class, adjust as needed
                createSubject(3L, "Science", 12),  // 3/week
                createSubject(4L, "History", 8),   // 2/week
                createSubject(5L, "Geography", 4), // 1/week
                createSubject(6L, "Art", 20)       // 5/week
        );
        request.setSubjectConfigs(subjects);
    
        // Teachers
        List<TimeTableRequest.TeacherConfig> teachers = Arrays.asList(
                createTeacher("T1", "Math Teacher", 1L, Arrays.asList("Class 1", "Class 2", "Class 3", "Class 4"), 4, 20),
                createTeacher("T2", "English Teacher", 2L, Arrays.asList("Class 1", "Class 2", "Class 3", "Class 4"), 4, 20),
                createTeacher("T3", "Science Teacher", 3L, Arrays.asList("Class 1", "Class 2", "Class 3", "Class 4"), 4, 20),
                createTeacher("T4", "History Teacher", 4L, Arrays.asList("Class 1", "Class 2", "Class 3", "Class 4"), 4, 20),
                createTeacher("T5", "Geography Teacher", 5L, Arrays.asList("Class 1", "Class 2", "Class 3", "Class 4"), 4, 20),
                createTeacher("T6", "Art Teacher", 6L, Arrays.asList("Class 1", "Class 2", "Class 3", "Class 4"), 4, 20)
        );
        request.setTeacherConfigs(teachers);
    
        // Stream config
        TimeTableRequest.StreamConfig streamConfig = new TimeTableRequest.StreamConfig();
        streamConfig.setStreamName("Stream 1");
        streamConfig.setClassNames(Arrays.asList("Class 1", "Class 2", "Class 3", "Class 4"));
        request.setStreamConfigs(Arrays.asList(streamConfig));
    
        // Mock repositories
        for (long i = 1; i <= 4; i++) {
            Class mockClass = new Class();
            mockClass.setClassId(i);
            mockClass.setSchoolId("school1");
            mockClass.setClassName("Class " + i);
            when(classRepository.findBySchoolAndClassId("school1", i)).thenReturn(mockClass);
    
            Section mockSection = new Section();
            mockSection.setSectionId(i);
            mockSection.setSchoolId("school1");
            mockSection.setSectionName("Section A");
            when(sectionRepository.findBySchoolAndSectionId("school1", i)).thenReturn(mockSection);
        }
        Stream mockStream = new Stream();
        mockStream.setStreamId(1L);
        mockStream.setSchoolId("school1");
        mockStream.setStreamName("Stream 1");
        when(streamRepository.findBySchoolAndStreamId("school1", 1L)).thenReturn(mockStream);
    
        Subject mockSubject1 = new Subject(); mockSubject1.setSubjectId(1L); mockSubject1.setSchoolId("school1"); mockSubject1.setSubjectName("Math");
        Subject mockSubject2 = new Subject(); mockSubject2.setSubjectId(2L); mockSubject2.setSchoolId("school1"); mockSubject2.setSubjectName("English");
        Subject mockSubject3 = new Subject(); mockSubject3.setSubjectId(3L); mockSubject3.setSchoolId("school1"); mockSubject3.setSubjectName("Science");
        Subject mockSubject4 = new Subject(); mockSubject4.setSubjectId(4L); mockSubject4.setSchoolId("school1"); mockSubject4.setSubjectName("History");
        Subject mockSubject5 = new Subject(); mockSubject5.setSubjectId(5L); mockSubject5.setSchoolId("school1"); mockSubject5.setSubjectName("Geography");
        Subject mockSubject6 = new Subject(); mockSubject6.setSubjectId(6L); mockSubject6.setSchoolId("school1"); mockSubject6.setSubjectName("Art");
        List<Subject> mockSubjects = Arrays.asList(mockSubject1, mockSubject2, mockSubject3, mockSubject4, mockSubject5, mockSubject6);
        for (Subject sub : mockSubjects) {
            when(subjectRepository.findBySchoolAndSubjectId("school1", sub.getSubjectId())).thenReturn(sub);
        }
        when(subjectRepository.findAll()).thenReturn(mockSubjects);
    
        TimeTableResponse response = scheduleService.generateTimeTable(request);
        assertEquals("Timetable generated successfully", response.getMessage());
        assertEquals(200, response.getStatusCode());
        System.out.println("Generated Timetable: " + response.getTimetable());
    }

    // Helper methods unchanged...
    private TimeTableRequest.SubjectConfig createSubject(Long id, String name, int frequency) {
        TimeTableRequest.SubjectConfig sub = new TimeTableRequest.SubjectConfig();
        sub.setSubjectId(id);
        sub.setSubjectName(name);
        sub.setSubjectFrequencyPerWeek(frequency);
        sub.setSubjectDurationInMinutes(40);
        return sub;
    }

    private TimeTableRequest.TeacherConfig createTeacher(String id, String name, Long subjectId,
            List<String> classNames, int maxDay, int maxWeek) {
        TimeTableRequest.TeacherConfig teacher = new TimeTableRequest.TeacherConfig();
        teacher.setTeacherId(id);
        teacher.setTeacherName(name);
        teacher.setSubjectIds(Arrays.asList(subjectId));
        teacher.setClassNames(classNames);
        teacher.setMaxClassesPerDay(maxDay);
        teacher.setMaxClassesPerWeek(maxWeek);
        return teacher;
    }
}