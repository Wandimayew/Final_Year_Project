package com.schoolmanagement.Assessment_Service.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.schoolmanagement.Assessment_Service.dto.ReportCardRequestDTO;
import com.schoolmanagement.Assessment_Service.dto.ReportCardResponseDTO;
import com.schoolmanagement.Assessment_Service.service.ReportCardService;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/assessment/api/report-cards")
@RequiredArgsConstructor
public class ReportCardController {

    private final ReportCardService reportCardService;

    // Create a new report card
    @PostMapping
    public ResponseEntity<ReportCardResponseDTO> createReportCard(@RequestBody ReportCardRequestDTO requestDTO) {
        ReportCardResponseDTO responseDTO = reportCardService.createReportCard(requestDTO).getBody();
        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }

    // Update an existing report card
    @PutMapping("/{reportCardId}")
    public ResponseEntity<ReportCardResponseDTO> updateReportCard(
            @PathVariable Long reportCardId, 
            @RequestBody ReportCardRequestDTO requestDTO) {
        ReportCardResponseDTO responseDTO = reportCardService.updateReportCard(reportCardId, requestDTO).getBody();
        return new ResponseEntity<>(responseDTO, HttpStatus.OK);
    }

    // Delete a report card (soft delete)
    @DeleteMapping("/{reportCardId}")
    public ResponseEntity<String> deleteReportCard(@PathVariable Long reportCardId) {
        String response = reportCardService.deleteReportCard(reportCardId).getBody();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Get a report card by ID
    @GetMapping("/{reportCardId}")
    public ResponseEntity<ReportCardResponseDTO> getReportCardById(@PathVariable Long reportCardId) {
        ReportCardResponseDTO responseDTO = reportCardService.getReportCardById(reportCardId).getBody();
        return new ResponseEntity<>(responseDTO, HttpStatus.OK);
    }

    // Get all active report cards
    @GetMapping
    public ResponseEntity<List<ReportCardResponseDTO>> getAllActiveReportCards() {
        List<ReportCardResponseDTO> responseDTOs = reportCardService.getAllActiveReportCards().getBody();
        return new ResponseEntity<>(responseDTOs, HttpStatus.OK);
    }

    // Get report cards by student ID
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<ReportCardResponseDTO>> getReportCardsByStudentId(@PathVariable String studentId) {
        List<ReportCardResponseDTO> responseDTOs = reportCardService.getReportCardsByStudentId(studentId).getBody();
        return new ResponseEntity<>(responseDTOs, HttpStatus.OK);
    }

    // Get report cards by school ID
    @GetMapping("/school/{schoolId}")
    public ResponseEntity<List<ReportCardResponseDTO>> getReportCardsBySchoolId(@PathVariable String schoolId) {
        List<ReportCardResponseDTO> responseDTOs = reportCardService.getReportCardsBySchoolId(schoolId).getBody();
        return new ResponseEntity<>(responseDTOs, HttpStatus.OK);
    }

    // Get report cards by class ID
    @GetMapping("/class/{classId}")
    public ResponseEntity<List<ReportCardResponseDTO>> getReportCardsByClassId(@PathVariable Long classId) {
        List<ReportCardResponseDTO> responseDTOs = reportCardService.getReportCardsByClassId(classId).getBody();
        return new ResponseEntity<>(responseDTOs, HttpStatus.OK);
    }

    // Get report cards by assessment ID
    @GetMapping("/assessment/{assessmentId}")
    public ResponseEntity<List<ReportCardResponseDTO>> getReportCardsByAssessmentId(@PathVariable Long assessmentId) {
        List<ReportCardResponseDTO> responseDTOs = reportCardService.getReportCardsByAssessmentId(assessmentId).getBody();
        return new ResponseEntity<>(responseDTOs, HttpStatus.OK);
    }

    @GetMapping("/student/{studentId}/{academicYear}")
    public ResponseEntity<ReportCardResponseDTO> getReportCardForStudent(
            @PathVariable String studentId,
            @PathVariable String academicYear) {
        try {
            return reportCardService.getReportCardForStudent(studentId, academicYear);
        } catch (Exception e) {
            throw new EntityNotFoundException("Failed to fetch report card: " + e.getMessage());
        }
    }
}
