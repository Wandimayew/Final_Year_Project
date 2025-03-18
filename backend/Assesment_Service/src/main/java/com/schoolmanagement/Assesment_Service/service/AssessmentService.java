// com.schoolmanagement.Assesment_Service.service.AssessmentService.java
package com.schoolmanagement.Assesment_Service.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.schoolmanagement.Assesment_Service.dto.AssessmentRequestDTO;
import com.schoolmanagement.Assesment_Service.dto.AssessmentResponseDTO;
import com.schoolmanagement.Assesment_Service.exception.BadRequestException;
import com.schoolmanagement.Assesment_Service.model.Assessment;
import com.schoolmanagement.Assesment_Service.repository.AssessmentRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;

    public ResponseEntity<AssessmentResponseDTO> createAssessment(AssessmentRequestDTO assessmentRequest) {
        log.info("Creating a new assessment: {}", assessmentRequest);

        String normalizedAssessmentName = assessmentRequest.getAssessmentName() != null 
            ? assessmentRequest.getAssessmentName().trim().toLowerCase() 
            : null;
    String normalizedType = assessmentRequest.getType() != null 
            ? assessmentRequest.getType().trim().toLowerCase() 
            : null;
    String semester = assessmentRequest.getSemester() != null 
            ? assessmentRequest.getSemester().trim() 
            : "";

    // Define the context for uniqueness
    String studentId = assessmentRequest.getStudentId();
    Long subjectId = assessmentRequest.getSubjectId();
    Long classId = assessmentRequest.getClassId();

    // Required field validation
    if (studentId == null || subjectId == null || classId == null || normalizedAssessmentName == null) {
        throw new BadRequestException("Student ID, Subject ID, Class ID, and Assessment Name are required");
    }

    // Check for existing assessments in the same context
    List<Assessment> existingAssessments = assessmentRepository.findByStudentIdAndSubjectIdAndClassIdAndIsActiveTrue(
            studentId, subjectId, classId).stream()
            .filter(a -> {
                String existingName = a.getAssessmentName() != null ? a.getAssessmentName().trim().toLowerCase() : null;
                String existingType = a.getType() != null ? a.getType().trim().toLowerCase() : null;
                String existingSemester = a.getSemester() != null ? a.getSemester().trim() : "";

                // Define uniqueness criteria (customize as needed)
                boolean nameMatches = normalizedAssessmentName.equals(existingName);
                boolean typeMatches = (normalizedType == null && existingType == null) || 
                                     (normalizedType != null && normalizedType.equals(existingType));
                boolean semesterMatches = semester.equals(existingSemester);

                // Enforce uniqueness based on name, type, and semester
                return nameMatches && typeMatches && semesterMatches;
            })
            .collect(Collectors.toList());

    if (!existingAssessments.isEmpty()) {
        throw new BadRequestException("An assessment with the name '" + assessmentRequest.getAssessmentName() + 
                                      "' already exists for student ID: " + studentId + 
                                      ", subject ID: " + subjectId + 
                                      ", class ID: " + classId + 
                                      ", semester: " + semester);
    }
        
        Assessment assessment = new Assessment();
        assessment.setSchoolId(assessmentRequest.getSchoolId());
        assessment.setStreamId(assessmentRequest.getStreamId()); 
        assessment.setClassId(assessmentRequest.getClassId());
        assessment.setSectionId(assessmentRequest.getSectionId()); 
        assessment.setSubjectId(assessmentRequest.getSubjectId());
        assessment.setStudentId(assessmentRequest.getStudentId());
        assessment.setAssessmentName(assessmentRequest.getAssessmentName());
        assessment.setAssessmentDate(assessmentRequest.getAssessmentDate());
        assessment.setScore(assessmentRequest.getScore());
        assessment.setType(assessmentRequest.getType());
        assessment.setSemester(assessmentRequest.getSemester());
        assessment.setStatus(assessmentRequest.getStatus());
        assessment.setIsActive(true);
        assessment.setCreatedAt(LocalDateTime.now());
        
        Assessment savedAssessment = assessmentRepository.save(assessment);
        return ResponseEntity.ok(convertToAssessmentResponse(savedAssessment));
    }

    public ResponseEntity<AssessmentResponseDTO> updateAssessment(Long assessmentId, AssessmentRequestDTO assessmentRequest) {
        log.info("Updating assessment with ID: {}", assessmentId);
        
        Assessment existingAssessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new EntityNotFoundException("Assessment not found with ID: " + assessmentId));
        
        if (!existingAssessment.getIsActive()) {
            throw new BadRequestException("Assessment is inactive");
        }
        
        existingAssessment.setSchoolId(assessmentRequest.getSchoolId() != null ? 
                assessmentRequest.getSchoolId() : existingAssessment.getSchoolId());
        existingAssessment.setStreamId(assessmentRequest.getStreamId() != null ? 
                assessmentRequest.getStreamId() : existingAssessment.getStreamId()); // Added for frontend
        existingAssessment.setClassId(assessmentRequest.getClassId() != null ? 
                assessmentRequest.getClassId() : existingAssessment.getClassId());
        existingAssessment.setSectionId(assessmentRequest.getSectionId() != null ? 
                assessmentRequest.getSectionId() : existingAssessment.getSectionId()); // Added for frontend
        existingAssessment.setSubjectId(assessmentRequest.getSubjectId() != null ? 
                assessmentRequest.getSubjectId() : existingAssessment.getSubjectId());
        existingAssessment.setStudentId(assessmentRequest.getStudentId() != null ? 
                assessmentRequest.getStudentId() : existingAssessment.getStudentId());
        existingAssessment.setAssessmentName(assessmentRequest.getAssessmentName() != null ? 
                assessmentRequest.getAssessmentName() : existingAssessment.getAssessmentName());
        existingAssessment.setAssessmentDate(assessmentRequest.getAssessmentDate() != null ? 
                assessmentRequest.getAssessmentDate() : existingAssessment.getAssessmentDate());
        existingAssessment.setScore(assessmentRequest.getScore() != null ? 
                assessmentRequest.getScore() : existingAssessment.getScore());
        existingAssessment.setType(assessmentRequest.getType() != null ? 
                assessmentRequest.getType() : existingAssessment.getType());
        existingAssessment.setStatus(assessmentRequest.getStatus() != null ? 
                assessmentRequest.getStatus() : existingAssessment.getStatus());
        
        existingAssessment.setUpdatedAt(LocalDateTime.now());
        existingAssessment.setUpdatedBy("admin");
        
        Assessment updatedAssessment = assessmentRepository.save(existingAssessment);
        return ResponseEntity.ok(convertToAssessmentResponse(updatedAssessment));
    }

    public ResponseEntity<String> deleteAssessment(Long assessmentId) {
        log.info("Deleting assessment with ID: {}", assessmentId);
        
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new EntityNotFoundException("Assessment not found with ID: " + assessmentId));
        
        assessment.setIsActive(false);
        assessment.setUpdatedAt(LocalDateTime.now());
        assessment.setUpdatedBy("admin");
        
        assessmentRepository.save(assessment);
        return ResponseEntity.ok("Assessment with ID " + assessmentId + " deleted successfully");
    }

    public ResponseEntity<AssessmentResponseDTO> getAssessmentById(Long assessmentId) {
        log.info("Fetching assessment with ID: {}", assessmentId);
        
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new EntityNotFoundException("Assessment not found with ID: " + assessmentId));
        
        if (!assessment.getIsActive()) {
            throw new BadRequestException("Assessment is inactive");
        }
        
        return ResponseEntity.ok(convertToAssessmentResponse(assessment));
    }

    public ResponseEntity<List<AssessmentResponseDTO>> getAllActiveAssessments() {
        log.info("Fetching all active assessments");
        
        List<Assessment> activeAssessments = assessmentRepository.findAllActiveAssessments();
        List<AssessmentResponseDTO> responseDTOs = activeAssessments.stream()
                .map(this::convertToAssessmentResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responseDTOs);
    }

    public ResponseEntity<List<AssessmentResponseDTO>> getAssessmentsBySchoolId(String schoolId) {
        log.info("Fetching assessments for school ID: {}", schoolId);
        
        List<Assessment> assessments = assessmentRepository.findBySchoolIdAndIsActiveTrue(schoolId);
        List<AssessmentResponseDTO> responseDTOs = assessments.stream()
                .map(this::convertToAssessmentResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responseDTOs);
    }

    public ResponseEntity<List<AssessmentResponseDTO>> getAssessmentsByStudentId(String studentId) {
        log.info("Fetching assessments for student ID: {}", studentId);
        
        List<Assessment> assessments = assessmentRepository.findByStudentIdAndIsActiveTrue(studentId);
        List<AssessmentResponseDTO> responseDTOs = assessments.stream()
                .map(this::convertToAssessmentResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responseDTOs);
    }

    public ResponseEntity<List<AssessmentResponseDTO>> getAssessmentsByClassId(Long classId) {
        log.info("Fetching assessments for class ID: {}", classId);
        
        List<Assessment> assessments = assessmentRepository.findByClassIdAndIsActiveTrue(classId);
        List<AssessmentResponseDTO> responseDTOs = assessments.stream()
                .map(this::convertToAssessmentResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responseDTOs);
    }

    public ResponseEntity<List<AssessmentResponseDTO>> getAssessmentsBySubjectId(Long subjectId) {
        log.info("Fetching assessments for subject ID: {}", subjectId);
        
        List<Assessment> assessments = assessmentRepository.findBySubjectIdAndIsActiveTrue(subjectId);
        List<AssessmentResponseDTO> responseDTOs = assessments.stream()
                .map(this::convertToAssessmentResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responseDTOs);
    }

    // New method to filter assessments by multiple criteria
    public ResponseEntity<List<AssessmentResponseDTO>> getAssessmentsByFilters(
            Long streamId, Long classId, Long sectionId, Long subjectId, String studentId) {
        log.info("Fetching assessments with filters - streamId: {}, classId: {}, sectionId: {}, subjectId: {}, studentId: {}",
                streamId, classId, sectionId, subjectId, studentId);

        List<Assessment> assessments = assessmentRepository.findByFiltersAndIsActiveTrue(
                streamId, classId, sectionId, subjectId, studentId);
        List<AssessmentResponseDTO> responseDTOs = assessments.stream()
                .map(this::convertToAssessmentResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responseDTOs);
    }

    // Helper method to convert Assessment entity to AssessmentResponseDTO
    public AssessmentResponseDTO convertToAssessmentResponse(Assessment assessment) {
        return AssessmentResponseDTO.builder()
                .assessmentId(assessment.getAssessmentId())
                .schoolId(assessment.getSchoolId())
                .streamId(assessment.getStreamId())  
                .classId(assessment.getClassId())
                .sectionId(assessment.getSectionId()) 
                .subjectId(assessment.getSubjectId())
                .studentId(assessment.getStudentId())
                .assessmentName(assessment.getAssessmentName())
                .assessmentDate(assessment.getAssessmentDate())
                .type(assessment.getType())
                .score(assessment.getScore())
                .semester(assessment.getSemester())
                .status(assessment.getStatus())
                .isActive(assessment.getIsActive())
                .createdAt(assessment.getCreatedAt())
                .createdBy(assessment.getCreatedBy())
                .updatedAt(assessment.getUpdatedAt())
                .updatedBy(assessment.getUpdatedBy())
                .build();
    }
}