package com.schoolmanagement.Assessment_Service.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.schoolmanagement.Assessment_Service.dto.ProgressTrackerRequestDTO;
import com.schoolmanagement.Assessment_Service.dto.ProgressTrackerResponseDTO;
import com.schoolmanagement.Assessment_Service.exception.BadRequestException;
import com.schoolmanagement.Assessment_Service.model.Assessment;
import com.schoolmanagement.Assessment_Service.model.Grade;
import com.schoolmanagement.Assessment_Service.model.ProgressTracker;
import com.schoolmanagement.Assessment_Service.repository.AssessmentRepository;
import com.schoolmanagement.Assessment_Service.repository.GradeRepository;
import com.schoolmanagement.Assessment_Service.repository.ProgressTrackerRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class ProgressTrackerService {

    private final ProgressTrackerRepository progressTrackerRepository;
    private final AssessmentRepository assessmentRepository;
    private final GradeRepository gradeRepository;
    private final AssessmentService assessmentService;

    public ResponseEntity<ProgressTrackerResponseDTO> createProgressTracker(ProgressTrackerRequestDTO requestDTO) {
        log.info("Creating progress tracker for student ID: {} and assessment ID: {}", 
                requestDTO.getStudentId(), requestDTO.getAssessmentId());
        
        Assessment assessment = assessmentRepository.findById(requestDTO.getAssessmentId())
                .orElseThrow(() -> new EntityNotFoundException("Assessment not found with ID: " + requestDTO.getAssessmentId()));
        
        if (!assessment.getIsActive()) {
            throw new BadRequestException("Cannot create progress tracker for inactive assessment");
        }
        
        if (!assessment.getStudentId().equals(requestDTO.getStudentId())) {
            throw new BadRequestException("Student ID in request does not match assessment's student ID");
        }

        progressTrackerRepository.findByAssessment_AssessmentIdAndIsActiveTrue(requestDTO.getAssessmentId())
                .ifPresent(tracker -> {
                    throw new BadRequestException("Progress tracker already exists for assessment ID: " + requestDTO.getAssessmentId());
                });

        List<Grade> grades = gradeRepository.findByStudentIdAndAssessment_ClassIdAndAssessment_SubjectIdAndIsActiveTrue(
                requestDTO.getStudentId(), assessment.getClassId(), assessment.getSubjectId());
        
        List<Double> percentages = grades.stream()
                .map(Grade::getPercentage)
                .filter(p -> p != null)
                .collect(Collectors.toList());
        
        if (percentages.isEmpty()) {
            throw new BadRequestException("No valid grades found for progress tracking");
        }

        double averageMarks = percentages.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        String progressStatus = calculateProgressStatus(averageMarks);

        ProgressTracker progressTracker = new ProgressTracker();
        progressTracker.setSchoolId(requestDTO.getSchoolId());
        progressTracker.setStudentId(requestDTO.getStudentId());
        progressTracker.setClassId(assessment.getClassId());
        progressTracker.setSubjectId(assessment.getSubjectId());
        progressTracker.setAssessment(assessment);
        progressTracker.setAverageMarks(averageMarks);
        progressTracker.setProgressStatus(progressStatus);
        progressTracker.setRemarks(requestDTO.getRemarks());
        progressTracker.setIsActive(true);
        progressTracker.setCreatedAt(LocalDateTime.now());
        
        ProgressTracker savedTracker = progressTrackerRepository.save(progressTracker);
        return ResponseEntity.ok(convertToProgressTrackerResponse(savedTracker));
    }

    public ResponseEntity<ProgressTrackerResponseDTO> updateProgressTracker(Long trackerId, ProgressTrackerRequestDTO requestDTO) {
        log.info("Updating progress tracker with ID: {}", trackerId);
        
        ProgressTracker existingTracker = progressTrackerRepository.findById(trackerId)
                .orElseThrow(() -> new EntityNotFoundException("Progress tracker not found with ID: " + trackerId));
        
        if (!existingTracker.getIsActive()) {
            throw new BadRequestException("Progress tracker is inactive");
        }
        
        Assessment assessment = existingTracker.getAssessment();
        if (requestDTO.getAssessmentId() != null && 
                !requestDTO.getAssessmentId().equals(assessment.getAssessmentId())) {
            assessment = assessmentRepository.findById(requestDTO.getAssessmentId())
                    .orElseThrow(() -> new EntityNotFoundException("Assessment not found with ID: " + requestDTO.getAssessmentId()));
            if (!assessment.getIsActive()) {
                throw new BadRequestException("Cannot update to inactive assessment");
            }
            if (!assessment.getStudentId().equals(requestDTO.getStudentId())) {
                throw new BadRequestException("Student ID in request does not match new assessment's student ID");
            }
            progressTrackerRepository.findByAssessment_AssessmentIdAndIsActiveTrue(requestDTO.getAssessmentId())
                    .ifPresent(tracker -> {
                        if (!tracker.getProgressTrackerId().equals(trackerId)) {
                            throw new BadRequestException("Progress tracker already exists for assessment ID: " + requestDTO.getAssessmentId());
                        }
                    });
            existingTracker.setAssessment(assessment);
        }

        List<Grade> grades = gradeRepository.findByStudentIdAndAssessment_ClassIdAndAssessment_SubjectIdAndIsActiveTrue(
                requestDTO.getStudentId() != null ? requestDTO.getStudentId() : existingTracker.getStudentId(),
                assessment.getClassId(), assessment.getSubjectId());
        
        List<Double> percentages = grades.stream()
                .map(Grade::getPercentage)
                .filter(p -> p != null)
                .collect(Collectors.toList());
        
        double averageMarks = percentages.isEmpty() ? 0.0 : percentages.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        String progressStatus = calculateProgressStatus(averageMarks);

        existingTracker.setSchoolId(requestDTO.getSchoolId() != null ? 
                requestDTO.getSchoolId() : existingTracker.getSchoolId());
        existingTracker.setStudentId(requestDTO.getStudentId() != null ? 
                requestDTO.getStudentId() : existingTracker.getStudentId());
        existingTracker.setClassId(assessment.getClassId());
        existingTracker.setSubjectId(assessment.getSubjectId());
        existingTracker.setAverageMarks(averageMarks);
        existingTracker.setProgressStatus(progressStatus);
        existingTracker.setRemarks(requestDTO.getRemarks() != null ? 
                requestDTO.getRemarks() : existingTracker.getRemarks());
        existingTracker.setUpdatedAt(LocalDateTime.now());
        existingTracker.setUpdatedBy("admin");
        
        ProgressTracker updatedTracker = progressTrackerRepository.save(existingTracker);
        return ResponseEntity.ok(convertToProgressTrackerResponse(updatedTracker));
    }

    public ResponseEntity<String> deleteProgressTracker(Long trackerId) {
        log.info("Deleting progress tracker with ID: {}", trackerId);
        
        ProgressTracker tracker = progressTrackerRepository.findById(trackerId)
                .orElseThrow(() -> new EntityNotFoundException("Progress tracker not found with ID: " + trackerId));
        
        tracker.setIsActive(false);
        tracker.setUpdatedAt(LocalDateTime.now());
        tracker.setUpdatedBy("admin");
        
        progressTrackerRepository.save(tracker);
        return ResponseEntity.ok("Progress tracker with ID " + trackerId + " deleted successfully");
    }

    public ResponseEntity<ProgressTrackerResponseDTO> getProgressTrackerById(Long trackerId) {
        log.info("Fetching progress tracker with ID: {}", trackerId);
        
        ProgressTracker tracker = progressTrackerRepository.findById(trackerId)
                .orElseThrow(() -> new EntityNotFoundException("Progress tracker not found with ID: " + trackerId));
        
        if (!tracker.getIsActive()) {
            throw new BadRequestException("Progress tracker is inactive");
        }
        
        return ResponseEntity.ok(convertToProgressTrackerResponse(tracker));
    }

    public ResponseEntity<ProgressTrackerResponseDTO> getProgressTrackerByAssessmentId(Long assessmentId) {
        log.info("Fetching progress tracker for assessment ID: {}", assessmentId);
        
        ProgressTracker tracker = progressTrackerRepository.findByAssessment_AssessmentIdAndIsActiveTrue(assessmentId)
                .orElseThrow(() -> new EntityNotFoundException("Progress tracker not found for assessment ID: " + assessmentId));
        
        return ResponseEntity.ok(convertToProgressTrackerResponse(tracker));
    }

    public ResponseEntity<List<ProgressTrackerResponseDTO>> getAllActiveProgressTrackers() {
        log.info("Fetching all active progress trackers");
        
        List<ProgressTracker> activeTrackers = progressTrackerRepository.findAllActiveProgressTrackers();
        List<ProgressTrackerResponseDTO> responseDTOs = activeTrackers.stream()
                .map(this::convertToProgressTrackerResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responseDTOs);
    }

    public ResponseEntity<List<ProgressTrackerResponseDTO>> getProgressTrackersByStudentId(String studentId) {
        log.info("Fetching progress trackers for student ID: {}", studentId);
        
        List<ProgressTracker> trackers = progressTrackerRepository.findByStudentIdAndIsActiveTrue(studentId);
        List<ProgressTrackerResponseDTO> responseDTOs = trackers.stream()
                .map(this::convertToProgressTrackerResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responseDTOs);
    }

    public ResponseEntity<List<ProgressTrackerResponseDTO>> getProgressTrackersBySchoolId(String schoolId) {
        log.info("Fetching progress trackers for school ID: {}", schoolId);
        
        List<ProgressTracker> trackers = progressTrackerRepository.findBySchoolIdAndIsActiveTrue(schoolId);
        List<ProgressTrackerResponseDTO> responseDTOs = trackers.stream()
                .map(this::convertToProgressTrackerResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responseDTOs);
    }

    public ResponseEntity<List<ProgressTrackerResponseDTO>> getProgressTrackersByClassId(Long classId) {
        log.info("Fetching progress trackers for class ID: {}", classId);
        
        List<ProgressTracker> trackers = progressTrackerRepository.findByClassIdAndIsActiveTrue(classId);
        List<ProgressTrackerResponseDTO> responseDTOs = trackers.stream()
                .map(this::convertToProgressTrackerResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responseDTOs);
    }

    public ResponseEntity<List<ProgressTrackerResponseDTO>> getProgressTrackersBySubjectId(Long subjectId) {
        log.info("Fetching progress trackers for subject ID: {}", subjectId);
        
        List<ProgressTracker> trackers = progressTrackerRepository.findBySubjectIdAndIsActiveTrue(subjectId);
        List<ProgressTrackerResponseDTO> responseDTOs = trackers.stream()
                .map(this::convertToProgressTrackerResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responseDTOs);
    }

    public ResponseEntity<List<ProgressTrackerResponseDTO>> getProgressTrackersByFilters(
        String schoolId, String studentId, Long classId, Long subjectId) {
        log.info("Fetching progress trackers with filters - schoolId: {}, studentId: {}, classId: {}, subjectId: {}",
                schoolId, studentId, classId, subjectId);

        List<ProgressTracker> trackers = progressTrackerRepository.findByFiltersAndIsActiveTrue(
                schoolId, studentId, classId, subjectId);
        List<ProgressTrackerResponseDTO> responseDTOs = trackers.stream()
                .map(this::convertToProgressTrackerResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responseDTOs);
    }

    private String calculateProgressStatus(Double averageMarks) {
        if (averageMarks >= 90) return "Excellent";
        else if (averageMarks >= 80) return "Good";
        else if (averageMarks >= 70) return "Satisfactory";
        else if (averageMarks >= 60) return "Needs Improvement";
        else return "Unsatisfactory";
    }

    private ProgressTrackerResponseDTO convertToProgressTrackerResponse(ProgressTracker tracker) {
        return ProgressTrackerResponseDTO.builder()
                .progressTrackerId(tracker.getProgressTrackerId())
                .schoolId(tracker.getSchoolId())
                .studentId(tracker.getStudentId())
                .classId(tracker.getClassId())
                .subjectId(tracker.getSubjectId())
                .assessment(assessmentService.convertToAssessmentResponse(tracker.getAssessment()))
                .averageMarks(tracker.getAverageMarks())
                .progressStatus(tracker.getProgressStatus())
                .remarks(tracker.getRemarks())
                .isActive(tracker.getIsActive())
                .createdAt(tracker.getCreatedAt())
                .createdBy(tracker.getCreatedBy())
                .updatedAt(tracker.getUpdatedAt())
                .updatedBy(tracker.getUpdatedBy())
                .build();
    }
}