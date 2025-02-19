package com.schoolmanagement.academic_service.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.schoolmanagement.academic_service.dto.request.SubjectRequest;
import com.schoolmanagement.academic_service.dto.response.SubjectResponse;
import com.schoolmanagement.academic_service.model.Subject;
import com.schoolmanagement.academic_service.repository.SubjectRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;
    
    public ResponseEntity<SubjectResponse> addNewSubject(SubjectRequest subjectRequest, String schoolId) {

        Subject newSubject = new Subject();

        newSubject.setSchoolId(schoolId);
        newSubject.setSubjectName(subjectRequest.getSubjectName());
        newSubject.setSubjectCode(subjectRequest.getSubjectCode());
        newSubject.setCreditHours(subjectRequest.getCreditHours());
        newSubject.setActive(true);
        newSubject.setCreated_at(LocalDateTime.now());
        newSubject.setCreated_by("Admin");

        Subject savedSubject = subjectRepository.save(newSubject);

        return ResponseEntity.ok(convertToSubjectResponse(savedSubject));

    }

    public ResponseEntity<SubjectResponse> editSubjectById(SubjectRequest subjectRequest, String schoolId,
            Long subjectId) {

        Subject subjectExists= subjectRepository.findBySchoolAndSubjectId(schoolId,subjectId);
        if (subjectExists == null) {
            log.error("Subject not found with id {}", subjectId);
            return ResponseEntity.notFound().build();
        }
        subjectExists.setSubjectCode(subjectRequest.getSubjectCode());
        subjectExists.setSubjectName(subjectRequest.getSubjectName());
        subjectExists.setCreditHours(subjectRequest.getCreditHours());
        subjectExists.setUpdated_at(LocalDateTime.now());
        subjectExists.setUpdated_by("updated");

        Subject savedSubject= subjectRepository.save(subjectExists);

        return ResponseEntity.ok(convertToSubjectResponse(savedSubject));
    }

    public ResponseEntity<String> deleteSubjectById(String schoolId, Long subjectId) {

        Subject subjectExists= subjectRepository.findBySchoolAndSubjectId(schoolId,subjectId);
        if (subjectExists == null) {
            log.error("Subject not found with id {}", subjectId);
            return ResponseEntity.notFound().build();
        }

        subjectExists.setActive(false);

        subjectRepository.save(subjectExists);
        return ResponseEntity.ok("Subject with id " + subjectId + " deleted successfully.");
    }

    public ResponseEntity<SubjectResponse> getSubjectById(String schoolId, Long subjectId) {

        Subject subjectExists= subjectRepository.findBySchoolAndSubjectId(schoolId,subjectId);
        if (subjectExists == null) {
            log.error("Subject not found with id {}", subjectId);
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(convertToSubjectResponse(subjectExists));
    }

    public ResponseEntity<List<SubjectResponse>> getAllSubjectesBySchoolId(String schoolId) {

        List<Subject> subjects = subjectRepository.findAllSchoolSubjectsThatIsActive(schoolId);

        return ResponseEntity.ok(subjects.stream().map(this::convertToSubjectResponse).collect(Collectors.toList()));
    }

    public ResponseEntity<List<SubjectResponse>> getAllSubjectesByStream(String schoolId,Long streamId) {

        log.info("finsing the subject for stream");
        List<Subject> subjects = subjectRepository.findAllSchoolSubjectsByStreamThatIsActive(schoolId,streamId);
        log.info("finsing the subject for stream 22");

        return ResponseEntity.ok(subjects.stream().map(this::convertToSubjectResponse).collect(Collectors.toList()));
    }

    public ResponseEntity<List<SubjectResponse>> getAllSubjectesByClass(String schoolId,Long classId) {

        List<Subject> subjects = subjectRepository.findAllSchoolSubjectsByClassThatIsActive(schoolId,classId);

        return ResponseEntity.ok(subjects.stream().map(this::convertToSubjectResponse).collect(Collectors.toList()));
    }

    private SubjectResponse convertToSubjectResponse(Subject subject) {
        return SubjectResponse.builder()
                .subjectId(subject.getSubjectId())
                .schoolId(subject.getSchoolId())
                .subjectName(subject.getSubjectName())
                .subjectCode(subject.getSubjectCode())
                .creditHours(subject.getCreditHours())
                .build();
    }
}
