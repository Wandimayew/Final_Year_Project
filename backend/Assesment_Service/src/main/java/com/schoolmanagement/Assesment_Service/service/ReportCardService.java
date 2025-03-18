package com.schoolmanagement.Assesment_Service.service;

import java.time.LocalDateTime;
import java.time.Month;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.schoolmanagement.Assesment_Service.dto.AssessmentResponseDTO;
import com.schoolmanagement.Assesment_Service.dto.ReportCardRequestDTO;
import com.schoolmanagement.Assesment_Service.dto.ReportCardResponseDTO;
import com.schoolmanagement.Assesment_Service.exception.BadRequestException;
import com.schoolmanagement.Assesment_Service.model.Assessment;
import com.schoolmanagement.Assesment_Service.model.AssessmentAnalytics;
import com.schoolmanagement.Assesment_Service.model.ReportCard;
import com.schoolmanagement.Assesment_Service.repository.AssessmentRepository;
import com.schoolmanagement.Assesment_Service.repository.ReportCardRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class ReportCardService {

    private final ReportCardRepository reportCardRepository;
    private final AssessmentRepository assessmentRepository;
    private final AssessmentService assessmentService;

    public ResponseEntity<ReportCardResponseDTO> createReportCard(ReportCardRequestDTO requestDTO) {
        log.info("Creating report card for student ID: {}", requestDTO.getStudentId());

        if (requestDTO.getStudentId() == null || requestDTO.getSchoolId() == null) {
            throw new BadRequestException("Student ID and School ID are required");
        }

        if (requestDTO.getClassId() == null || requestDTO.getClassId() < 0) {
            throw new BadRequestException("Class ID must be greater than or equal to 0.");
        }

        if (requestDTO.getAssessmentId() == null || requestDTO.getAssessmentId().isEmpty()) {
            throw new BadRequestException("At least one Assessment ID is required.");
        }

        // Fetch assessments by IDs
        List<Assessment> assessments = assessmentRepository.findAllById(requestDTO.getAssessmentId())
                .stream()
                .filter(Assessment::getIsActive)
                .collect(Collectors.toList());

        if (assessments.isEmpty()) {
            throw new BadRequestException("No active assessments found for the provided IDs.");
        }

        // Validate assessments belong to the student and school
        boolean validAssessments = assessments.stream().allMatch(a -> 
            a.getStudentId().equals(requestDTO.getStudentId()) && 
            a.getSchoolId().equals(requestDTO.getSchoolId())
        );
        if (!validAssessments) {
            throw new BadRequestException("Assessments must belong to the specified student and school.");
        }

        // Classify assessments into semesters (Ethiopian academic year: Sep-Feb = First, Mar-Aug = Second)
        List<Assessment> firstSemesterAssessments = assessments.stream()
                .filter(a -> {
                    Month month = a.getAssessmentDate().getMonth();
                    return month.getValue() >= 9 || month.getValue() <= 2;
                })
                .collect(Collectors.toList());

        List<Assessment> secondSemesterAssessments = assessments.stream()
                .filter(a -> {
                    Month month = a.getAssessmentDate().getMonth();
                    return month.getValue() >= 3 && month.getValue() <= 8;
                })
                .collect(Collectors.toList());

        // Calculate totals and averages per semester
        double totalMarksFirst = firstSemesterAssessments.stream()
                .mapToDouble(a -> a.getScore() != null ? a.getScore() : 0.0)
                .sum();
        double totalMarksSecond = secondSemesterAssessments.stream()
                .mapToDouble(a -> a.getScore() != null ? a.getScore() : 0.0)
                .sum();

        double averageGradeFirst = firstSemesterAssessments.isEmpty() ? 0.0 : totalMarksFirst / firstSemesterAssessments.size();
        double averageGradeSecond = secondSemesterAssessments.isEmpty() ? 0.0 : totalMarksSecond / secondSemesterAssessments.size();

        // Calculate pass/fail status per semester
        String firstSemesterStatus = averageGradeFirst >= 50.0 ? "PASS" : "FAIL";
        String secondSemesterStatus = averageGradeSecond >= 50.0 ? "PASS" : "FAIL";

        // Calculate overall average and status
        double overallAverage = assessments.isEmpty() ? 0.0 : 
                (totalMarksFirst + totalMarksSecond) / assessments.size();
        String overallStatus = overallAverage >= 50.0 ? "PASS" : "FAIL";

        // Create AssessmentAnalytics entity (simplified)
        AssessmentAnalytics analytics = new AssessmentAnalytics();
        analytics.setSchoolId(requestDTO.getSchoolId());
        analytics.setStudentId(requestDTO.getStudentId());
        analytics.setAssessments(assessments);
        analytics.setAverageMarks(overallAverage);
        analytics.setHighestMarks(assessments.stream().mapToDouble(a -> a.getScore() != null ? a.getScore() : 0.0).max().orElse(0.0));
        analytics.setLowestMarks(assessments.stream().mapToDouble(a -> a.getScore() != null ? a.getScore() : 0.0).min().orElse(0.0));
        analytics.setTotalMarks(totalMarksFirst + totalMarksSecond);
        analytics.setRemarks("Generated for report card");
        analytics.setActive(true);
        analytics.setCreatedAt(LocalDateTime.now());

        // Create ReportCard entity
        ReportCard reportCard = new ReportCard();
        reportCard.setStudentId(requestDTO.getStudentId());
        reportCard.setSchoolId(requestDTO.getSchoolId());
        reportCard.setStreamId(requestDTO.getStreamId());
        reportCard.setClassId(requestDTO.getClassId());
        reportCard.setSectionId(requestDTO.getSectionId());
        reportCard.setAssessments(assessments);
        reportCard.setAnalytics(analytics);
        reportCard.setTotalMarksFirstSemester(totalMarksFirst);
        reportCard.setTotalMarksSecondSemester(totalMarksSecond);
        reportCard.setAverageGradeFirstSemester(averageGradeFirst);
        reportCard.setAverageGradeSecondSemester(averageGradeSecond);
        reportCard.setFirstSemesterStatus(firstSemesterStatus);
        reportCard.setSecondSemesterStatus(secondSemesterStatus);
        reportCard.setAcademicYear(requestDTO.getAcademicYear());
        reportCard.setOverallStatus(overallStatus);
        reportCard.setRemarks(requestDTO.getRemarks());
        reportCard.setIsActive(true);
        reportCard.setCreatedAt(LocalDateTime.now());

        ReportCard savedReportCard = reportCardRepository.save(reportCard);
        return ResponseEntity.ok(convertToReportCardResponse(savedReportCard));
    }

    public ResponseEntity<ReportCardResponseDTO> updateReportCard(Long reportCardId, ReportCardRequestDTO requestDTO) {
        log.info("Updating report card with ID: {}", reportCardId);

        ReportCard existingReportCard = reportCardRepository.findById(reportCardId)
                .orElseThrow(() -> new EntityNotFoundException("Report card not found with ID: " + reportCardId));

        if (!existingReportCard.getIsActive()) {
            throw new BadRequestException("Report card is inactive");
        }

        // Update fields if provided
        existingReportCard.setStudentId(requestDTO.getStudentId() != null ? 
                requestDTO.getStudentId() : existingReportCard.getStudentId());
        existingReportCard.setSchoolId(requestDTO.getSchoolId() != null ? 
                requestDTO.getSchoolId() : existingReportCard.getSchoolId());
        existingReportCard.setStreamId(requestDTO.getStreamId() != null ? 
                requestDTO.getStreamId() : existingReportCard.getStreamId());
        existingReportCard.setClassId(requestDTO.getClassId() != null ? 
                requestDTO.getClassId() : existingReportCard.getClassId());
        existingReportCard.setSectionId(requestDTO.getSectionId() != null ? 
                requestDTO.getSectionId() : existingReportCard.getSectionId());
        existingReportCard.setRemarks(requestDTO.getRemarks() != null ? 
                requestDTO.getRemarks() : existingReportCard.getRemarks());

        // Update assessments if provided
        List<Assessment> assessments = existingReportCard.getAssessments();
        if (requestDTO.getAssessmentId() != null && !requestDTO.getAssessmentId().isEmpty()) {
            assessments = assessmentRepository.findAllById(requestDTO.getAssessmentId())
                    .stream()
                    .filter(Assessment::getIsActive)
                    .collect(Collectors.toList());

            if (assessments.isEmpty()) {
                throw new BadRequestException("No active assessments found for the provided IDs.");
            }

            boolean validAssessments = assessments.stream().allMatch(a -> 
                a.getStudentId().equals(existingReportCard.getStudentId()) && 
                a.getSchoolId().equals(existingReportCard.getSchoolId())
            );
            if (!validAssessments) {
                throw new BadRequestException("Assessments must belong to the specified student and school.");
            }
            existingReportCard.setAssessments(assessments);
        }

        // Recalculate totals, averages, and statuses
        List<Assessment> firstSemesterAssessments = assessments.stream()
                .filter(a -> {
                    Month month = a.getAssessmentDate().getMonth();
                    return month.getValue() >= 9 || month.getValue() <= 2;
                })
                .collect(Collectors.toList());

        List<Assessment> secondSemesterAssessments = assessments.stream()
                .filter(a -> {
                    Month month = a.getAssessmentDate().getMonth();
                    return month.getValue() >= 3 && month.getValue() <= 8;
                })
                .collect(Collectors.toList());

        double totalMarksFirst = firstSemesterAssessments.stream()
                .mapToDouble(a -> a.getScore() != null ? a.getScore() : 0.0)
                .sum();
        double totalMarksSecond = secondSemesterAssessments.stream()
                .mapToDouble(a -> a.getScore() != null ? a.getScore() : 0.0)
                .sum();

        double averageGradeFirst = firstSemesterAssessments.isEmpty() ? 0.0 : totalMarksFirst / firstSemesterAssessments.size();
        double averageGradeSecond = secondSemesterAssessments.isEmpty() ? 0.0 : totalMarksSecond / secondSemesterAssessments.size();

        // Calculate pass/fail status per semester
        String firstSemesterStatus = averageGradeFirst >= 50.0 ? "PASS" : "FAIL";
        String secondSemesterStatus = averageGradeSecond >= 50.0 ? "PASS" : "FAIL";

        // Calculate overall average and status
        double overallAverage = assessments.isEmpty() ? 0.0 : 
                (totalMarksFirst + totalMarksSecond) / assessments.size();
        String overallStatus = overallAverage >= 50.0 ? "PASS" : "FAIL";

        // Update AssessmentAnalytics
        AssessmentAnalytics analytics = existingReportCard.getAnalytics();
        analytics.setSchoolId(existingReportCard.getSchoolId());
        analytics.setStudentId(existingReportCard.getStudentId());
        analytics.setAssessments(assessments);
        analytics.setAverageMarks(overallAverage);
        analytics.setHighestMarks(assessments.stream().mapToDouble(a -> a.getScore() != null ? a.getScore() : 0.0).max().orElse(0.0));
        analytics.setLowestMarks(assessments.stream().mapToDouble(a -> a.getScore() != null ? a.getScore() : 0.0).min().orElse(0.0));
        analytics.setTotalMarks(totalMarksFirst + totalMarksSecond);
        analytics.setUpdatedAt(LocalDateTime.now());

        existingReportCard.setTotalMarksFirstSemester(totalMarksFirst);
        existingReportCard.setTotalMarksSecondSemester(totalMarksSecond);
        existingReportCard.setAverageGradeFirstSemester(averageGradeFirst);
        existingReportCard.setAverageGradeSecondSemester(averageGradeSecond);
        existingReportCard.setFirstSemesterStatus(firstSemesterStatus);
        existingReportCard.setSecondSemesterStatus(secondSemesterStatus);
        existingReportCard.setOverallStatus(overallStatus);
        existingReportCard.setUpdatedAt(LocalDateTime.now());

        ReportCard updatedReportCard = reportCardRepository.save(existingReportCard);
        return ResponseEntity.ok(convertToReportCardResponse(updatedReportCard));
    }

    public ResponseEntity<String> deleteReportCard(Long reportCardId) {
        log.info("Deleting report card with ID: {}", reportCardId);

        ReportCard reportCard = reportCardRepository.findById(reportCardId)
                .orElseThrow(() -> new EntityNotFoundException("Report card not found with ID: " + reportCardId));

        reportCard.setIsActive(false);
        reportCard.setUpdatedAt(LocalDateTime.now());
        reportCard.getAnalytics().setActive(false);
        reportCard.getAnalytics().setUpdatedAt(LocalDateTime.now());

        reportCardRepository.save(reportCard);
        return ResponseEntity.ok("Report card with ID " + reportCardId + " deleted successfully");
    }

    public ResponseEntity<ReportCardResponseDTO> getReportCardById(Long reportCardId) {
        log.info("Fetching report card with ID: {}", reportCardId);

        ReportCard reportCard = reportCardRepository.findById(reportCardId)
                .orElseThrow(() -> new EntityNotFoundException("Report card not found with ID: " + reportCardId));

        if (!reportCard.getIsActive()) {
            throw new BadRequestException("Report card is inactive");
        }

        return ResponseEntity.ok(convertToReportCardResponse(reportCard));
    }

    public ResponseEntity<List<ReportCardResponseDTO>> getAllActiveReportCards() {
        log.info("Fetching all active report cards");

        List<ReportCard> activeReportCards = reportCardRepository.findAllActiveReportCards();
        List<ReportCardResponseDTO> responseDTOs = activeReportCards.stream()
                .map(this::convertToReportCardResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responseDTOs);
    }

    public ResponseEntity<List<ReportCardResponseDTO>> getReportCardsByStudentId(String studentId) {
        log.info("Fetching report cards for student ID: {}", studentId);

        List<ReportCard> reportCards = reportCardRepository.findByStudentIdAndIsActiveTrue(studentId);
        List<ReportCardResponseDTO> responseDTOs = reportCards.stream()
                .map(this::convertToReportCardResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responseDTOs);
    }

    public ResponseEntity<ReportCardResponseDTO> getReportCardForStudent(String studentId, String academicYear) {
        log.info("Fetching report card for student ID: {} and academic year: {}", studentId, academicYear);

        ReportCard reportCard = reportCardRepository.findByStudentIdAndAcademicYearAndIsActiveTrue(studentId, academicYear)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No report card found for student ID " + studentId + " and academic year " + academicYear));

        return ResponseEntity.ok(convertToReportCardResponse(reportCard));
    }

    public ResponseEntity<List<ReportCardResponseDTO>> getReportCardsBySchoolId(String schoolId) {
        log.info("Fetching report cards for school ID: {}", schoolId);

        List<ReportCard> reportCards = reportCardRepository.findBySchoolIdAndIsActiveTrue(schoolId);
        List<ReportCardResponseDTO> responseDTOs = reportCards.stream()
                .map(this::convertToReportCardResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responseDTOs);
    }

    public ResponseEntity<List<ReportCardResponseDTO>> getReportCardsByClassId(Long classId) {
        log.info("Fetching report cards for class ID: {}", classId);

        List<ReportCard> reportCards = reportCardRepository.findByClassIdAndIsActiveTrue(classId);
        List<ReportCardResponseDTO> responseDTOs = reportCards.stream()
                .map(this::convertToReportCardResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responseDTOs);
    }

    public ResponseEntity<List<ReportCardResponseDTO>> getReportCardsByAssessmentId(Long assessmentId) {
        log.info("Fetching report cards for assessment ID: {}", assessmentId);

        List<ReportCard> reportCards = reportCardRepository.findAll().stream()
                .filter(rc -> rc.getIsActive() && rc.getAssessments().stream()
                        .anyMatch(a -> a.getAssessmentId().equals(assessmentId) && a.getIsActive()))
                .collect(Collectors.toList());

        List<ReportCardResponseDTO> responseDTOs = reportCards.stream()
                .map(this::convertToReportCardResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responseDTOs);
    }

    // Updated single method for response conversion
    private ReportCardResponseDTO convertToReportCardResponse(ReportCard reportCard) {
        List<Assessment> assessments = reportCard.getAssessments();

        List<AssessmentResponseDTO> firstSemesterAssessments = assessments.stream()
                .filter(a -> {
                    Month month = a.getAssessmentDate().getMonth();
                    return month.getValue() >= 9 || month.getValue() <= 2;
                })
                .map(assessmentService::convertToAssessmentResponse)
                .collect(Collectors.toList());

        List<AssessmentResponseDTO> secondSemesterAssessments = assessments.stream()
                .filter(a -> {
                    Month month = a.getAssessmentDate().getMonth();
                    return month.getValue() >= 3 && month.getValue() <= 8;
                })
                .map(assessmentService::convertToAssessmentResponse)
                .collect(Collectors.toList());

        return ReportCardResponseDTO.builder()
                .reportCardId(reportCard.getReportCardId())
                .studentId(reportCard.getStudentId())
                .schoolId(reportCard.getSchoolId())
                .streamId(reportCard.getStreamId())
                .classId(reportCard.getClassId())
                .sectionId(reportCard.getSectionId())
                .firstSemesterAssessments(firstSemesterAssessments)
                .secondSemesterAssessments(secondSemesterAssessments)
                .totalMarksFirstSemester(reportCard.getTotalMarksFirstSemester())
                .totalMarksSecondSemester(reportCard.getTotalMarksSecondSemester())
                .averageGradeFirstSemester(reportCard.getAverageGradeFirstSemester())
                .averageGradeSecondSemester(reportCard.getAverageGradeSecondSemester())
                .firstSemesterStatus(reportCard.getFirstSemesterStatus())
                .secondSemesterStatus(reportCard.getSecondSemesterStatus())
                .overallStatus(reportCard.getOverallStatus())
                .academicYear(reportCard.getAcademicYear())
                .remarks(reportCard.getRemarks())
                .isActive(reportCard.getIsActive())
                .createdAt(reportCard.getCreatedAt())
                .updatedAt(reportCard.getUpdatedAt())
                .build();
    }
}