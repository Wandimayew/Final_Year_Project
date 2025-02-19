package com.schoolmanagement.academic_service.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.Collections;
import java.util.HashSet;

import org.hibernate.Hibernate;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.schoolmanagement.academic_service.dto.request.ClassRequest;
import com.schoolmanagement.academic_service.dto.response.ClassResponse;
import com.schoolmanagement.academic_service.dto.response.SectionResponse;
import com.schoolmanagement.academic_service.dto.response.SubjectResponse;
import com.schoolmanagement.academic_service.model.Class;
import com.schoolmanagement.academic_service.model.Section;
import com.schoolmanagement.academic_service.model.Stream;
import com.schoolmanagement.academic_service.model.Subject;
import com.schoolmanagement.academic_service.repository.ClassRepository;
import com.schoolmanagement.academic_service.repository.SectionRepository;
import com.schoolmanagement.academic_service.repository.StreamRepository;
import com.schoolmanagement.academic_service.repository.SubjectRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class ClassService {

    private final ClassRepository classRepository;
    private final StreamRepository streamRepository;
    private final SubjectRepository subjectRepository;
    private final SectionRepository sectionRepository;
    // Add a new class
    public ResponseEntity<ClassResponse> addNewClass(ClassRequest classRequest, String schoolId) {
        Optional<Stream> optionalStream = Optional
                .ofNullable(streamRepository.findBySchoolAndStreamId(schoolId, classRequest.getStreamId()));
        if (optionalStream.isEmpty()) {
            log.error("Stream not found with id {}", classRequest.getStreamId());
            return ResponseEntity.notFound().build();
        }

        Class newClass = new Class();
        newClass.setSchoolId(schoolId);
        newClass.setAcademicYear(classRequest.getAcademicYear());
        newClass.setClassName(classRequest.getClassName());
        newClass.setStream(Collections.singleton(optionalStream.get()));
        newClass.setActive(true);
        newClass.setCreated_at(LocalDateTime.now());
        newClass.setCreated_by("Admin");
        newClass.setSections(new HashSet<>());

        Class savedClass = classRepository.save(newClass);
        return ResponseEntity.ok(convertToClassResponse(savedClass));
    }

    // Edit class by ID
    public ResponseEntity<ClassResponse> editClassById(ClassRequest classRequest, String schoolId, Long classId) {
        Optional<Class> optionalClass = Optional.ofNullable(classRepository.findBySchoolAndClassId(schoolId, classId));
        if (optionalClass.isEmpty()) {
            log.error("Class not found with id {}", classId);
            return ResponseEntity.notFound().build();
        }

        Class classExists = optionalClass.get();
        classExists.setAcademicYear(classRequest.getAcademicYear());
        classExists.setClassName(classRequest.getClassName());
        classExists.setUpdated_at(LocalDateTime.now());
        classExists.setUpdated_by("Admin");

        Class savedClass = classRepository.save(classExists);
        return ResponseEntity.ok(convertToClassResponse(savedClass));
    }

    // Delete class by ID
    public ResponseEntity<String> deleteClassById(String schoolId, Long classId) {
        Optional<Class> optionalClass = Optional.ofNullable(classRepository.findBySchoolAndClassId(schoolId, classId));
        if (optionalClass.isEmpty()) {
            log.error("Class not found with id {}", classId);
            return ResponseEntity.notFound().build();
        }

        Class classExists = optionalClass.get();
        classExists.setActive(false);
        classRepository.save(classExists);

        return ResponseEntity.ok("Class with id " + classId + " deleted successfully.");
    }

    // Get class by ID getClassDetails
    public ResponseEntity<ClassResponse> getClassById(String schoolId, Long classId) {
        Optional<Class> optionalClass = Optional.ofNullable(classRepository.findBySchoolAndClassId(schoolId, classId));
        if (optionalClass.isEmpty()) {
            log.error("Class not found with id {}", classId);
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(convertToClassResponse(optionalClass.get()));
    }
    public ResponseEntity<ClassResponse> getClassDetails(String schoolId, Long classId) {
        Optional<Class> optionalClass = Optional.ofNullable(classRepository.findBySchoolAndClassId(schoolId, classId));
        if (optionalClass.isEmpty()) {
            log.error("Class  not found with id {}", classId);
            return ResponseEntity.notFound().build();
        }
        List<Section> section=sectionRepository.findAllActiveSectionsForClass(schoolId, classId);

        // if (section.isEmpty()) {
        //     log.error("Class not found with id {}", classId);
        //     return ResponseEntity.notFound().build();
        // }

        List<Subject> subject= subjectRepository.findAllSchoolSubjectsByClassThatIsActive(schoolId, classId);
        // if (subject.isEmpty()) {
        //     log.error("Class not found with id {}", classId);
        //     return ResponseEntity.notFound().build();
        // }

        return ResponseEntity.ok(classDetailsResponse(optionalClass.get(), subject, section));
    }

    // Get all classes by School ID
    // @Transactional(readOnly = true)
    public ResponseEntity<List<ClassResponse>> getAllClassesBySchoolId(String schoolId) {
        log.info("before class searching");
        List<Class> classes = classRepository.findAllSchoolClassesThatIsActive(schoolId);
        log.info("before class searchingggggg");

        // Force the initialization of the collection or field
        for (Class clazz : classes) {
            Hibernate.initialize(clazz.getSubjectList()); // Ensure subjects are loaded before further processing
            Hibernate.initialize(clazz.getSections()); // Similarly, ensure sections are initialized
        }
        log.info("after class searching");

        return ResponseEntity.ok(classes.stream()
                .map(this::convertToClassResponse)
                .collect(Collectors.toList()));
    }

    // Get all classes by Stream ID
    public ResponseEntity<List<ClassResponse>> getAllClassesByStreamId(String schoolId, Long streamId) {
        List<Class> classes = classRepository.findAllSchoolClassesByStreamThatIsActive(schoolId, streamId);
        return ResponseEntity.ok(classes.stream().map(this::convertToClassResponse).collect(Collectors.toList()));
    }

    @Transactional
    public ResponseEntity<ClassResponse> assignSubjectsToClass(String schoolId, Long classId, List<Long> subjectIds) {
        log.debug("Starting assignment of subjects to class");

        if (subjectIds == null || subjectIds.isEmpty()) {
            log.error("Subject IDs are null or empty");
            throw new IllegalArgumentException("Subject IDs cannot be null or empty.");
        }

        Class clazz = classRepository.findById(classId)
                .orElseThrow(() -> new EntityNotFoundException("Class with ID " + classId + " not found."));

        log.info("Assigning subjects [{}] to class [{}]", subjectIds, clazz.getClassId());

        Set<Subject> subjectSet = new HashSet<>();
        for (Long subjectId : subjectIds) {
            log.debug("Fetching subject with ID {}", subjectId);
            Subject subjectExist = subjectRepository.findById(subjectId)
                    .orElseThrow(() -> new EntityNotFoundException("Subject with id " + subjectId + " not found."));

            subjectSet.add(subjectExist);
            // Update the reverse side of the relationship (add class to subject's
            // classList)
            subjectExist.getClassList().add(clazz);
        }

        log.info("Before assignment: {} subjects assigned.", clazz.getSubjectList().size());
        clazz.setSubjectList(subjectSet);

        Class savedClass = classRepository.save(clazz);
        log.info("Successfully assigned {} subjects to class [{}]", subjectSet.size(), savedClass.getClassId());

        return ResponseEntity.ok(convertToClassResponse(savedClass));
    }

    // Convert Class to ClassResponse
    private ClassResponse convertToClassResponse(Class classResp) {
        if (classResp.getSubjectList() != null && !classResp.getSubjectList().isEmpty()) {
            Hibernate.initialize(classResp.getSubjectList());
        }
        Set<Section> sectionsSet = classResp.getSections() != null ? new HashSet<>(classResp.getSections())
                : Collections.emptySet();
        Set<Subject> subjectsSet = classResp.getSubjectList() != null ? new HashSet<>(classResp.getSubjectList())
                : Collections.emptySet();

        return ClassResponse.builder()
                .classId(classResp.getClassId())
                .className(classResp.getClassName())
                .academicYear(classResp.getAcademicYear())
                .stream(classResp.getStream())
                .sections(sectionsSet.stream()
                        .map(section -> SectionResponse.builder()
                                .sectionId(section.getSectionId())
                                .sectionName(section.getSectionName())
                                .capacity(section.getCapacity())
                                .isActive(section.isActive())
                                .build())
                        .collect(Collectors.toList()))
                .subjects(subjectsSet.stream()
                        .map(subject -> SubjectResponse.builder()
                                .subjectId(subject.getSubjectId())
                                .subjectName(subject.getSubjectName())
                                .subjectCode(subject.getSubjectCode())
                                .creditHours(subject.getCreditHours())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

    private ClassResponse classDetailsResponse(Class class1,List<Subject> subject, List<Section> section){

        Set<Section> sectionsSet = section != null ? new HashSet<>(section)
        : Collections.emptySet();
Set<Subject> subjectsSet = subject != null ? new HashSet<>(subject)
        : Collections.emptySet();
        return ClassResponse.builder()
        .academicYear(class1.getAcademicYear())
        .schoolId(class1.getSchoolId())
        .className(class1.getClassName())
        .stream(class1.getStream())
        .sections(sectionsSet.stream()
                .map(section1 -> SectionResponse.builder()
                        .sectionId(section1.getSectionId())
                        .sectionName(section1.getSectionName())
                        .capacity(section1.getCapacity())
                        .isActive(section1.isActive())
                        .build()).collect(Collectors.toList()))
        .subjects(subjectsSet.stream().map(subject1 -> SubjectResponse.builder()
        .subjectId(subject1.getSubjectId())
        .subjectCode(subject1.getSubjectCode())
        .subjectName(subject1.getSubjectName())
        .build()).collect(Collectors.toList()))

        .build();
    }

}
