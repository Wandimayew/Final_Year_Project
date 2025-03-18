// com.schoolmanagement.Assesment_Service.controller.AssessmentAnalyticsController.java
package com.schoolmanagement.Assesment_Service.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.schoolmanagement.Assesment_Service.dto.AssessmentAnalyticsRequestDTO;
import com.schoolmanagement.Assesment_Service.dto.AssessmentAnalyticsResponseDTO;
import com.schoolmanagement.Assesment_Service.service.AssessmentAnalyticsService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AssessmentAnalyticsController {

    private final AssessmentAnalyticsService analyticsService;

    @PostMapping
    public ResponseEntity<AssessmentAnalyticsResponseDTO> createAnalytics(@Valid @RequestBody AssessmentAnalyticsRequestDTO requestDTO) {
        return analyticsService.createAnalytics(requestDTO);
    }

    @PutMapping("/{analyticsId}")
    public ResponseEntity<AssessmentAnalyticsResponseDTO> updateAnalytics(
            @PathVariable Long analyticsId, @Valid @RequestBody AssessmentAnalyticsRequestDTO requestDTO) {
        return analyticsService.updateAnalytics(analyticsId, requestDTO);
    }

    @DeleteMapping("/{analyticsId}")
    public ResponseEntity<String> deleteAnalytics(@PathVariable Long analyticsId) {
        return analyticsService.deleteAnalytics(analyticsId);
    }

    @GetMapping("/{analyticsId}")
    public ResponseEntity<AssessmentAnalyticsResponseDTO> getAnalyticsById(@PathVariable Long analyticsId) {
        return analyticsService.getAnalyticsById(analyticsId);
    }

    @GetMapping("/filter")
    public ResponseEntity<List<AssessmentAnalyticsResponseDTO>> getAnalyticsByFilters(
            @RequestParam(required = false) String schoolId,
            @RequestParam(required = false) String studentId) {
        return analyticsService.getAnalyticsByFilters(schoolId, studentId);
    }

    @GetMapping("/roster")
    public ResponseEntity<List<AssessmentAnalyticsResponseDTO>> getRosterAnalyticsByFilters(
            @RequestParam Long streamId,
            @RequestParam Long classId,
            @RequestParam Long sectionId,
            @RequestParam(required = false, defaultValue = "1st") String semester) {
        return analyticsService.getRosterAnalyticsByFilters(streamId, classId, sectionId, semester);
    }
}