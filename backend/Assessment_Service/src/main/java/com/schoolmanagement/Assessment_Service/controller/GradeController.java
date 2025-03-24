package com.schoolmanagement.Assessment_Service.controller;

import com.schoolmanagement.Assessment_Service.dto.GradeRequestDTO;
import com.schoolmanagement.Assessment_Service.dto.GradeResponseDTO;
import com.schoolmanagement.Assessment_Service.service.GradeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/assessment/api/grades")
@Slf4j
@RequiredArgsConstructor
public class GradeController {

    private final GradeService gradeService;

    // Create a new Grade
    @PostMapping
    public ResponseEntity<GradeResponseDTO> createGrade(
            @Valid @RequestBody GradeRequestDTO requestDTO) {
        log.info("Received request to create grade for student ID: {} and assessment ID: {}", 
                requestDTO.getStudentId(), requestDTO.getAssessmentId());
        GradeResponseDTO responseDTO = gradeService.createGrade(requestDTO).getBody();
        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }

    // Update an existing Grade
    @PutMapping("/{gradeId}")
    public ResponseEntity<GradeResponseDTO> updateGrade(
            @PathVariable Long gradeId,
            @Valid @RequestBody GradeRequestDTO requestDTO) {
        log.info("Received request to update grade with ID: {}", gradeId);
        GradeResponseDTO responseDTO = gradeService.updateGrade(gradeId, requestDTO).getBody();
        return ResponseEntity.ok(responseDTO);
    }

    // Delete a Grade
    @DeleteMapping("/{gradeId}")
    public ResponseEntity<String> deleteGrade(@PathVariable Long gradeId) {
        log.info("Received request to delete grade with ID: {}", gradeId);
        String response = gradeService.deleteGrade(gradeId).getBody();
        return ResponseEntity.ok(response);
    }

    // Get a Grade by ID
    @GetMapping("/{gradeId}")
    public ResponseEntity<GradeResponseDTO> getGradeById(@PathVariable Long gradeId) {
        log.info("Received request to fetch grade with ID: {}", gradeId);
        GradeResponseDTO responseDTO = gradeService.getGradeById(gradeId).getBody();
        return ResponseEntity.ok(responseDTO);
    }

    // Get all active Grades
    @GetMapping
    public ResponseEntity<List<GradeResponseDTO>> getAllActiveGrades() {
        log.info("Received request to fetch all active grades");
        List<GradeResponseDTO> responseDTOs = gradeService.getAllActiveGrades().getBody();
        return ResponseEntity.ok(responseDTOs);
    }

    // Get Grades by School ID
    @GetMapping("/school/{schoolId}")
    public ResponseEntity<List<GradeResponseDTO>> getGradesBySchoolId(@PathVariable String schoolId) {
        log.info("Received request to fetch grades for school ID: {}", schoolId);
        List<GradeResponseDTO> responseDTOs = gradeService.getGradesBySchoolId(schoolId).getBody();
        return ResponseEntity.ok(responseDTOs);
    }

    // Get Grades by Student ID
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<GradeResponseDTO>> getGradesByStudentId(@PathVariable String studentId) {
        log.info("Received request to fetch grades for student ID: {}", studentId);
        List<GradeResponseDTO> responseDTOs = gradeService.getGradesByStudentId(studentId).getBody();
        return ResponseEntity.ok(responseDTOs);
    }

    // Get Grades by Assessment ID
    @GetMapping("/assessment/{assessmentId}")
    public ResponseEntity<List<GradeResponseDTO>> getGradesByAssessmentId(@PathVariable Long assessmentId) {
        log.info("Received request to fetch grades for assessment ID: {}", assessmentId);
        List<GradeResponseDTO> responseDTOs = gradeService.getGradesByAssessmentId(assessmentId).getBody();
        return ResponseEntity.ok(responseDTOs);
    }

    // Get Grade by Student ID and Assessment ID
    @GetMapping("/student/{studentId}/assessment/{assessmentId}")
    public ResponseEntity<GradeResponseDTO> getGradeByStudentAndAssessment(
            @PathVariable String studentId, @PathVariable Long assessmentId) {
        log.info("Received request to fetch grade for student ID: {} and assessment ID: {}", studentId, assessmentId);
        GradeResponseDTO responseDTO = gradeService.getGradeByStudentAndAssessment(studentId, assessmentId).getBody();
        return ResponseEntity.ok(responseDTO);
    }
}
