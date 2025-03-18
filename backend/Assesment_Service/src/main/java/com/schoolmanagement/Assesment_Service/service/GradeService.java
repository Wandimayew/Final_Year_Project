package com.schoolmanagement.Assesment_Service.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.schoolmanagement.Assesment_Service.dto.GradeRequestDTO;
import com.schoolmanagement.Assesment_Service.dto.GradeResponseDTO;
import com.schoolmanagement.Assesment_Service.exception.BadRequestException;
import com.schoolmanagement.Assesment_Service.model.Assessment;
import com.schoolmanagement.Assesment_Service.model.Grade;
import com.schoolmanagement.Assesment_Service.repository.AssessmentRepository;
import com.schoolmanagement.Assesment_Service.repository.GradeRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class GradeService {

    private final GradeRepository gradeRepository;
    private final AssessmentRepository assessmentRepository;
    private final AssessmentService assessmentService;

    private static final double MAX_SCORE = 100.0; // Adjust if different

    public ResponseEntity<GradeResponseDTO> createGrade(GradeRequestDTO requestDTO) {
        log.info("Creating grade for student ID: {} and assessment ID: {}", 
                requestDTO.getStudentId(), requestDTO.getAssessmentId());
        
        Assessment assessment = assessmentRepository.findById(requestDTO.getAssessmentId())
                .orElseThrow(() -> new EntityNotFoundException("Assessment not found with ID: " + requestDTO.getAssessmentId()));
        
        if (!assessment.getIsActive()) {
            throw new BadRequestException("Cannot create grade for inactive assessment");
        }

        if (!assessment.getStudentId().equals(requestDTO.getStudentId())) {
            throw new BadRequestException("Student ID in request does not match assessment's student ID");
        }

        Double score = assessment.getScore();
        if (score == null) {
            throw new BadRequestException("Assessment has no score to grade");
        }

        // Calculate percentage
        Double percentage = (score / MAX_SCORE) * 100.0;

        Grade grade = new Grade();
        grade.setStudentId(requestDTO.getStudentId());
        grade.setSchoolId(requestDTO.getSchoolId());
        grade.setAssessment(assessment);
        grade.setPercentage(percentage);
        grade.setRemarks(requestDTO.getRemarks());
        grade.setIsActive(true);
        grade.setCreatedAt(LocalDateTime.now());
        
        Grade savedGrade = gradeRepository.save(grade);
        return ResponseEntity.ok(convertToGradeResponse(savedGrade));
    }

    public ResponseEntity<GradeResponseDTO> updateGrade(Long gradeId, GradeRequestDTO requestDTO) {
        log.info("Updating grade with ID: {}", gradeId);
        
        Grade existingGrade = gradeRepository.findById(gradeId)
                .orElseThrow(() -> new EntityNotFoundException("Grade not found with ID: " + gradeId));
        
        if (!existingGrade.getIsActive()) {
            throw new BadRequestException("Grade is inactive");
        }
        
        if (requestDTO.getAssessmentId() != null && 
                !requestDTO.getAssessmentId().equals(existingGrade.getAssessment().getAssessmentId())) {
            Assessment assessment = assessmentRepository.findById(requestDTO.getAssessmentId())
                    .orElseThrow(() -> new EntityNotFoundException("Assessment not found with ID: " + requestDTO.getAssessmentId()));
            if (!assessment.getIsActive()) {
                throw new BadRequestException("Cannot update to inactive assessment");
            }
            if (!assessment.getStudentId().equals(requestDTO.getStudentId())) {
                throw new BadRequestException("Student ID in request does not match new assessment's student ID");
            }
            existingGrade.setAssessment(assessment);
        }

        // Recalculate percentage if assessment changed
        Double score = existingGrade.getAssessment().getScore();
        if (score != null) {
            Double percentage = (score / MAX_SCORE) * 100.0;
            existingGrade.setPercentage(percentage);
        }

        existingGrade.setStudentId(requestDTO.getStudentId() != null ? 
                requestDTO.getStudentId() : existingGrade.getStudentId());
        existingGrade.setSchoolId(requestDTO.getSchoolId() != null ? 
                requestDTO.getSchoolId() : existingGrade.getSchoolId());
        existingGrade.setRemarks(requestDTO.getRemarks() != null ? 
                requestDTO.getRemarks() : existingGrade.getRemarks());
        
        existingGrade.setUpdatedAt(LocalDateTime.now());
        existingGrade.setUpdatedBy("admin");
        
        Grade updatedGrade = gradeRepository.save(existingGrade);
        return ResponseEntity.ok(convertToGradeResponse(updatedGrade));
    }

    public ResponseEntity<String> deleteGrade(Long gradeId) {
        log.info("Deleting grade with ID: {}", gradeId);
        
        Grade grade = gradeRepository.findById(gradeId)
                .orElseThrow(() -> new EntityNotFoundException("Grade not found with ID: " + gradeId));
        
        grade.setIsActive(false);
        grade.setUpdatedAt(LocalDateTime.now());
        grade.setUpdatedBy("admin");
        
        gradeRepository.save(grade);
        return ResponseEntity.ok("Grade with ID " + gradeId + " deleted successfully");
    }

    public ResponseEntity<GradeResponseDTO> getGradeById(Long gradeId) {
        log.info("Fetching grade with ID: {}", gradeId);
        
        Grade grade = gradeRepository.findById(gradeId)
                .orElseThrow(() -> new EntityNotFoundException("Grade not found with ID: " + gradeId));
        
        if (!grade.getIsActive()) {
            throw new BadRequestException("Grade is inactive");
        }
        
        return ResponseEntity.ok(convertToGradeResponse(grade));
    }

    public ResponseEntity<List<GradeResponseDTO>> getAllActiveGrades() {
        log.info("Fetching all active grades");
        
        List<Grade> activeGrades = gradeRepository.findAllActiveGrades();
        List<GradeResponseDTO> responseDTOs = activeGrades.stream()
                .map(this::convertToGradeResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responseDTOs);
    }

    public ResponseEntity<List<GradeResponseDTO>> getGradesByStudentId(String studentId) {
        log.info("Fetching grades for student ID: {}", studentId);
        
        List<Grade> grades = gradeRepository.findByStudentIdAndIsActiveTrue(studentId);
        List<GradeResponseDTO> responseDTOs = grades.stream()
                .map(this::convertToGradeResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responseDTOs);
    }

    public ResponseEntity<List<GradeResponseDTO>> getGradesBySchoolId(String schoolId) {
        log.info("Fetching grades for school ID: {}", schoolId);
        
        List<Grade> grades = gradeRepository.findBySchoolIdAndIsActiveTrue(schoolId);
        List<GradeResponseDTO> responseDTOs = grades.stream()
                .map(this::convertToGradeResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responseDTOs);
    }

    public ResponseEntity<List<GradeResponseDTO>> getGradesByAssessmentId(Long assessmentId) {
        log.info("Fetching grades for assessment ID: {}", assessmentId);
        
        List<Grade> grades = gradeRepository.findByAssessment_AssessmentIdAndIsActiveTrue(assessmentId);
        List<GradeResponseDTO> responseDTOs = grades.stream()
                .map(this::convertToGradeResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responseDTOs);
    }

    public ResponseEntity<GradeResponseDTO> getGradeByStudentAndAssessment(String studentId, Long assessmentId) {
        log.info("Fetching grade for student ID: {} and assessment ID: {}", studentId, assessmentId);
        
        List<Grade> grades = gradeRepository.findByStudentIdAndAssessment_AssessmentIdAndIsActiveTrue(studentId, assessmentId);
        
        if (grades.isEmpty()) {
            throw new EntityNotFoundException("Grade not found for student ID: " + studentId + " and assessment ID: " + assessmentId);
        }
        
        return ResponseEntity.ok(convertToGradeResponse(grades.get(0)));
    }

    // Helper method to convert Grade entity to GradeResponseDTO
    private GradeResponseDTO convertToGradeResponse(Grade grade) {
        return GradeResponseDTO.builder()
                .gradeId(grade.getGradeId())
                .studentId(grade.getStudentId())
                .schoolId(grade.getSchoolId())
                .assessment(assessmentService.convertToAssessmentResponse(grade.getAssessment()))
                .percentage(grade.getPercentage())
                .remarks(grade.getRemarks())
                .isActive(grade.getIsActive())
                .createdAt(grade.getCreatedAt())
                .createdBy(grade.getCreatedBy())
                .updatedAt(grade.getUpdatedAt())
                .updatedBy(grade.getUpdatedBy())
                .build();
    }
}