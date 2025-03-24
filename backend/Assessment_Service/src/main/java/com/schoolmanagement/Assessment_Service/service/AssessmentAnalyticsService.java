package com.schoolmanagement.Assessment_Service.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.schoolmanagement.Assessment_Service.dto.AssessmentAnalyticsRequestDTO;
import com.schoolmanagement.Assessment_Service.dto.AssessmentAnalyticsResponseDTO;
import com.schoolmanagement.Assessment_Service.dto.AssessmentResponseDTO;
import com.schoolmanagement.Assessment_Service.exception.BadRequestException;
import com.schoolmanagement.Assessment_Service.model.Assessment;
import com.schoolmanagement.Assessment_Service.model.AssessmentAnalytics;
import com.schoolmanagement.Assessment_Service.repository.AssessmentAnalyticsRepository;
import com.schoolmanagement.Assessment_Service.repository.AssessmentRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class AssessmentAnalyticsService {

    private final AssessmentAnalyticsRepository analyticsRepository;
    private final AssessmentRepository assessmentRepository;
    private final AssessmentService assessmentService;

    public ResponseEntity<AssessmentAnalyticsResponseDTO> createAnalytics(AssessmentAnalyticsRequestDTO requestDTO) {
        log.info("Creating assessment analytics for student ID: {}", requestDTO.getStudentId());

        if (requestDTO.getStudentId() == null || requestDTO.getSchoolId() == null) {
            throw new BadRequestException("Student ID and School ID are required");
        }

        List<Assessment> assessments = fetchAssessmentsForStudent(requestDTO);
        if (assessments.isEmpty()) {
            throw new BadRequestException("No active assessments found for student ID: " + requestDTO.getStudentId());
        }

        AssessmentAnalytics analytics = calculateAnalytics(assessments, requestDTO.getSchoolId(), requestDTO.getStudentId());
        analytics.setRemarks(requestDTO.getRemarks());
        analytics.setCreatedAt(LocalDateTime.now());

        assessments.forEach(assessment -> assessment.setAnalytics(analytics));

        AssessmentAnalytics savedAnalytics = analyticsRepository.save(analytics);
        return ResponseEntity.ok(convertToAnalyticsResponse(savedAnalytics));
    }

    public ResponseEntity<AssessmentAnalyticsResponseDTO> updateAnalytics(Long analyticsId,
            AssessmentAnalyticsRequestDTO requestDTO) {
        log.info("Updating assessment analytics with ID: {}", analyticsId);

        AssessmentAnalytics existingAnalytics = analyticsRepository.findById(analyticsId)
                .orElseThrow(() -> new EntityNotFoundException("Assessment analytics not found with ID: " + analyticsId));

        if (!existingAnalytics.isActive()) {
            throw new BadRequestException("Assessment analytics is inactive");
        }

        // Update only remarks if provided, preserve other fields
        if (requestDTO.getRemarks() != null) {
            existingAnalytics.setRemarks(requestDTO.getRemarks());
        }
        existingAnalytics.setUpdatedAt(LocalDateTime.now());
        existingAnalytics.setUpdatedBy("admin");

        AssessmentAnalytics updatedAnalytics = analyticsRepository.save(existingAnalytics);
        return ResponseEntity.ok(convertToAnalyticsResponse(updatedAnalytics));
    }

    public ResponseEntity<String> deleteAnalytics(Long analyticsId) {
        log.info("Deleting assessment analytics with ID: {}", analyticsId);

        AssessmentAnalytics analytics = analyticsRepository.findById(analyticsId)
                .orElseThrow(() -> new EntityNotFoundException("Assessment analytics not found with ID: " + analyticsId));

        analytics.setActive(false);
        analytics.setUpdatedAt(LocalDateTime.now());
        analytics.setUpdatedBy("admin");

        if (analytics.getAssessments() != null) {
            analytics.getAssessments().forEach(assessment -> assessment.setAnalytics(null));
        }

        analyticsRepository.save(analytics);
        return ResponseEntity.ok("Assessment analytics with ID " + analyticsId + " deleted successfully");
    }

    public ResponseEntity<AssessmentAnalyticsResponseDTO> getAnalyticsById(Long analyticsId) {
        log.info("Fetching assessment analytics with ID: {}", analyticsId);

        AssessmentAnalytics analytics = analyticsRepository.findById(analyticsId)
                .orElseThrow(() -> new EntityNotFoundException("Assessment analytics not found with ID: " + analyticsId));

        if (!analytics.isActive()) {
            throw new BadRequestException("Assessment analytics is inactive");
        }

        return ResponseEntity.ok(convertToAnalyticsResponse(analytics));
    }

    public ResponseEntity<List<AssessmentAnalyticsResponseDTO>> getAnalyticsByFilters(
        String schoolId, String studentId) {
        log.info("Fetching assessment analytics with filters - schoolId: {}, studentId: {}", schoolId, studentId);

        List<AssessmentAnalytics> analytics = analyticsRepository.findByFiltersAndIsActiveTrue(schoolId, studentId);
        List<AssessmentAnalyticsResponseDTO> responseDTOs = analytics.stream()
                .map(this::convertToAnalyticsResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responseDTOs);
    }

    public ResponseEntity<List<AssessmentAnalyticsResponseDTO>> getRosterAnalyticsByFilters(
            Long streamId, Long classId, Long sectionId, String semester) {
        log.info("Fetching roster analytics with filters - streamId: {}, classId: {}, sectionId: {}, semester: {}",
                streamId, classId, sectionId, semester);

        // Validate semester parameter
        if (semester == null || semester.trim().isEmpty()) {
            throw new BadRequestException("Semester parameter is required and cannot be empty");
        }

        // Fetch all active assessments for the given filters and filter by the selected semester
        List<Assessment> assessments = assessmentRepository.findByFiltersAndIsActiveTrue(
                streamId, classId, sectionId, null, null).stream()
                .filter(a -> a.getSemester() != null && !a.getSemester().trim().isEmpty() && a.getSemester().equals(semester))
                .collect(Collectors.toList());

        if (assessments.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        // Group by studentId to calculate analytics per student
        Map<String, List<Assessment>> studentAssessments = assessments.stream()
                .collect(Collectors.groupingBy(Assessment::getStudentId));

        List<AssessmentAnalyticsResponseDTO> analyticsList = new ArrayList<>();
        List<StudentScore> studentScores = new ArrayList<>();

        for (Map.Entry<String, List<Assessment>> entry : studentAssessments.entrySet()) {
            String studentId = entry.getKey();
            List<Assessment> studentAssess = entry.getValue();

            AssessmentAnalytics analytics = calculateAnalytics(studentAssess, null, studentId);
            analytics.setSemester(semester); // Set semester at AssessmentAnalytics level based on filter

            // Convert assessments to response DTOs with semester and subject details
            List<AssessmentResponseDTO> assessmentDTOs = studentAssess.stream()
                    .map(assessmentService::convertToAssessmentResponse)
                    .collect(Collectors.toList());
            analytics.setAssessments(studentAssess); // Keep filtered assessments

            AssessmentAnalyticsResponseDTO response = convertToAnalyticsResponse(analytics);
            response.setAssessments(assessmentDTOs); // Include only assessments for the selected semester
            analyticsList.add(response);
            studentScores.add(new StudentScore(studentId, response.getTotalMarks())); // Rank by total score
        }

        // Sort by totalMarks to assign ranks
        studentScores.sort((s1, s2) -> Double.compare(s2.getTotalMarks(), s1.getTotalMarks()));

        // Assign ranks
        Map<String, AssessmentAnalyticsResponseDTO> analyticsMap = analyticsList.stream()
                .collect(Collectors.toMap(AssessmentAnalyticsResponseDTO::getStudentId, a -> a));
        for (int i = 0; i < studentScores.size(); i++) {
            String studentId = studentScores.get(i).getStudentId();
            AssessmentAnalyticsResponseDTO analytics = analyticsMap.get(studentId);
            if (analytics != null) {
                analytics.setRank((long) (i + 1)); // Ensure rank is a Long
            }
        }

        return ResponseEntity.ok(analyticsList);
    }

    private AssessmentAnalytics calculateAnalytics(List<Assessment> assessments, String schoolId, String studentId) {
        double totalMarks = 0.0;
        int validAssessments = 0;
        double highestMarks = 0.0;
        double lowestMarks = Double.MAX_VALUE;

        for (Assessment assessment : assessments) {
            Double score = assessment.getScore();
            if (score != null) {
                totalMarks += score;
                validAssessments++;

                if (score > highestMarks) highestMarks = score;
                if (score < lowestMarks) lowestMarks = score;
            }
        }

        // Adjust lowestMarks to 0 if no valid scores
        lowestMarks = validAssessments == 0 ? 0.0 : lowestMarks == Double.MAX_VALUE ? 0.0 : lowestMarks;
        highestMarks = validAssessments == 0 ? 0.0 : highestMarks;

        // Calculate average (total out of valid assessments)
        double averageMarks = validAssessments > 0 ? totalMarks / validAssessments : 0.0;

        // Determine pass/fail based on individual assessments
        long passCount = assessments.stream()
                .filter(a -> a.getScore() != null && a.getScore() >= 50.0) // Assuming 50 is the passing score
                .count();
        double passPercentage = assessments.size() > 0 ? (passCount * 100.0) / assessments.size() : 0.0;
        double failPercentage = 100.0 - passPercentage;
        String status = passPercentage >= 50.0 ? "Pass" : "Fail"; // Overall status based on pass percentage

        AssessmentAnalytics analytics = new AssessmentAnalytics();
        analytics.setSchoolId(schoolId != null ? schoolId : assessments.get(0).getSchoolId());
        analytics.setStudentId(studentId != null ? studentId : assessments.get(0).getStudentId());
        analytics.setAssessments(assessments);
        analytics.setAverageMarks(averageMarks);
        analytics.setHighestMarks(highestMarks);
        analytics.setLowestMarks(lowestMarks);
        analytics.setTotalMarks(totalMarks);
        analytics.setPassPercentage(passPercentage);
        analytics.setFailPercentage(failPercentage);
        analytics.setStatus(status);
        analytics.setActive(true);

        return analytics;
    }

    private List<Assessment> fetchAssessmentsForStudent(AssessmentAnalyticsRequestDTO requestDTO) {
        if (requestDTO.getSubjectId() != null) {
            return assessmentRepository.findByStudentIdAndSubjectIdAndSchoolIdAndIsActiveTrue(
                    requestDTO.getStudentId(), requestDTO.getSubjectId(), requestDTO.getSchoolId());
        } else if (requestDTO.getClassId() != null) {
            return assessmentRepository.findByStudentIdAndClassIdAndSchoolIdAndIsActiveTrue(
                    requestDTO.getStudentId(), requestDTO.getClassId(), requestDTO.getSchoolId());
        } else {
            return assessmentRepository.findByStudentIdAndSchoolIdAndIsActiveTrue(
                    requestDTO.getStudentId(), requestDTO.getSchoolId());
        }
    }

    private AssessmentAnalyticsResponseDTO convertToAnalyticsResponse(AssessmentAnalytics analytics) {
        List<AssessmentResponseDTO> assessmentDTOs = analytics.getAssessments() != null
                ? analytics.getAssessments().stream()
                        .map(assessmentService::convertToAssessmentResponse)
                        .collect(Collectors.toList())
                : null;

        return AssessmentAnalyticsResponseDTO.builder()
                .assessmentAnalyticsId(analytics.getAssessmentAnalyticsId())
                .schoolId(analytics.getSchoolId())
                .studentId(analytics.getStudentId())
                .assessments(assessmentDTOs)
                .averageMarks(analytics.getAverageMarks())
                .highestMarks(analytics.getHighestMarks())
                .lowestMarks(analytics.getLowestMarks())
                .totalMarks(analytics.getTotalMarks())
                .passPercentage(analytics.getPassPercentage())
                .failPercentage(analytics.getFailPercentage())
                .remarks(analytics.getRemarks())
                .status(analytics.getStatus())
                .isActive(analytics.isActive())
                .createdAt(analytics.getCreatedAt())
                .createdBy(analytics.getCreatedBy())
                .updatedAt(analytics.getUpdatedAt())
                .updatedBy(analytics.getUpdatedBy())
                .rank(analytics.getRank())
                .build();
    }

    @Data
    static class StudentScore {
        private String studentId;
        private Double totalMarks;

        public StudentScore(String studentId, Double totalMarks) {
            this.studentId = studentId;
            this.totalMarks = totalMarks != null ? totalMarks : 0.0; // Handle null totalMarks
        }
    }
}