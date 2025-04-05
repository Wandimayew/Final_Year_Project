package com.schoolmanagement.Assessment_Service.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.schoolmanagement.Assessment_Service.dto.ProgressTrackerRequestDTO;
import com.schoolmanagement.Assessment_Service.dto.ProgressTrackerResponseDTO;
import com.schoolmanagement.Assessment_Service.service.ProgressTrackerService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/assessment/api/progress-trackers")
@RequiredArgsConstructor
public class ProgressTrackerController {

    private final ProgressTrackerService progressTrackerService;

    @PostMapping
    public ResponseEntity<ProgressTrackerResponseDTO> createProgressTracker(@Valid @RequestBody ProgressTrackerRequestDTO requestDTO) {
        return progressTrackerService.createProgressTracker(requestDTO);
    }

    @PutMapping("/{trackerId}")
    public ResponseEntity<ProgressTrackerResponseDTO> updateProgressTracker(
            @PathVariable Long trackerId, @Valid @RequestBody ProgressTrackerRequestDTO requestDTO) {
        return progressTrackerService.updateProgressTracker(trackerId, requestDTO);
    }

    @DeleteMapping("/{trackerId}")
    public ResponseEntity<String> deleteProgressTracker(@PathVariable Long trackerId) {
        return progressTrackerService.deleteProgressTracker(trackerId);
    }

    @GetMapping("/{trackerId}")
    public ResponseEntity<ProgressTrackerResponseDTO> getProgressTrackerById(@PathVariable Long trackerId) {
        return progressTrackerService.getProgressTrackerById(trackerId);
    }

    @GetMapping("/assessment/{assessmentId}")
    public ResponseEntity<ProgressTrackerResponseDTO> getProgressTrackerByAssessmentId(@PathVariable Long assessmentId) {
        return progressTrackerService.getProgressTrackerByAssessmentId(assessmentId);
    }

    @GetMapping
    public ResponseEntity<List<ProgressTrackerResponseDTO>> getAllActiveProgressTrackers() {
        return progressTrackerService.getAllActiveProgressTrackers();
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<ProgressTrackerResponseDTO>> getProgressTrackersByStudentId(@PathVariable String studentId) {
        return progressTrackerService.getProgressTrackersByStudentId(studentId);
    }

    @GetMapping("/school/{schoolId}")
    public ResponseEntity<List<ProgressTrackerResponseDTO>> getProgressTrackersBySchoolId(@PathVariable String schoolId) {
        return progressTrackerService.getProgressTrackersBySchoolId(schoolId);
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<ProgressTrackerResponseDTO>> getProgressTrackersByClassId(@PathVariable Long classId) {
        return progressTrackerService.getProgressTrackersByClassId(classId);
    }

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<ProgressTrackerResponseDTO>> getProgressTrackersBySubjectId(@PathVariable Long subjectId) {
        return progressTrackerService.getProgressTrackersBySubjectId(subjectId);
    }

    @GetMapping("/filter")
    public ResponseEntity<List<ProgressTrackerResponseDTO>> getProgressTrackersByFilters(
            @RequestParam(required = false) String schoolId,
            @RequestParam(required = false) String studentId,
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) Long subjectId) {
        return progressTrackerService.getProgressTrackersByFilters(schoolId, studentId, classId, subjectId);
    }
}