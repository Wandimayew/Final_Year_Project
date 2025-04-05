
package com.schoolmanagement.Assessment_Service.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.schoolmanagement.Assessment_Service.dto.AssessmentRequestDTO;
import com.schoolmanagement.Assessment_Service.dto.AssessmentResponseDTO;
import com.schoolmanagement.Assessment_Service.service.AssessmentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/assessment/api/")
@RequiredArgsConstructor
public class AssessmentController {

    private final AssessmentService assessmentService;

    @PostMapping
    public ResponseEntity<AssessmentResponseDTO> createAssessment(@RequestBody AssessmentRequestDTO assessmentRequest) {
        return assessmentService.createAssessment(assessmentRequest);
    }

    @PutMapping("/{assessmentId}")
    public ResponseEntity<AssessmentResponseDTO> updateAssessment(
            @PathVariable Long assessmentId, @RequestBody AssessmentRequestDTO assessmentRequest) {
        return assessmentService.updateAssessment(assessmentId, assessmentRequest);
    }

    @DeleteMapping("/{assessmentId}")
    public ResponseEntity<String> deleteAssessment(@PathVariable Long assessmentId) {
        return assessmentService.deleteAssessment(assessmentId);
    }

    @GetMapping("/{assessmentId}")
    public ResponseEntity<AssessmentResponseDTO> getAssessmentById(@PathVariable Long assessmentId) {
        return assessmentService.getAssessmentById(assessmentId);
    }

    @GetMapping
    public ResponseEntity<List<AssessmentResponseDTO>> getAllActiveAssessments() {
        return assessmentService.getAllActiveAssessments();
    }

    @GetMapping("/school/{schoolId}")
    public ResponseEntity<List<AssessmentResponseDTO>> getAssessmentsBySchoolId(@PathVariable String schoolId) {
        return assessmentService.getAssessmentsBySchoolId(schoolId);
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<AssessmentResponseDTO>> getAssessmentsByStudentId(@PathVariable String studentId) {
        return assessmentService.getAssessmentsByStudentId(studentId);
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<AssessmentResponseDTO>> getAssessmentsByClassId(@PathVariable Long classId) {
        return assessmentService.getAssessmentsByClassId(classId);
    }

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<AssessmentResponseDTO>> getAssessmentsBySubjectId(@PathVariable Long subjectId) {
        return assessmentService.getAssessmentsBySubjectId(subjectId);
    }

    @GetMapping("/filter")
    public ResponseEntity<List<AssessmentResponseDTO>> getAssessmentsByFilters(
            @RequestParam(required = false) Long streamId,
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) Long sectionId,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) String studentId) {
        return assessmentService.getAssessmentsByFilters(streamId, classId, sectionId, subjectId, studentId);
    }
}