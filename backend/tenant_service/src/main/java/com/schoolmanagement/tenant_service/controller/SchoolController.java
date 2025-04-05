package com.schoolmanagement.tenant_service.controller;

import com.schoolmanagement.tenant_service.config.CustomUserPrincipal;
import com.schoolmanagement.tenant_service.dto.SchoolRequest;
import com.schoolmanagement.tenant_service.dto.SchoolResponse;
import com.schoolmanagement.tenant_service.dto.SchoolStatsDTO; 
import com.schoolmanagement.tenant_service.service.SchoolService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tenant/api")
@RequiredArgsConstructor
@Slf4j
public class SchoolController {

    private final SchoolService schoolService;

    private String getUserIdFromSecurityContext() {
        CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return principal.getUserId();
    }

    private void validateSchoolId(String schoolId) {
        CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        String tokenSchoolId = principal.getSchoolId();
        if (!schoolId.equals(tokenSchoolId)) {
            log.error("School ID mismatch: Path schoolId={}, Token schoolId={}", schoolId, tokenSchoolId);
            throw new SecurityException("Unauthorized: School ID mismatch");
        }
    }

    @PostMapping(value = "/addNewSchool", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SchoolResponse> addNewSchool(@ModelAttribute SchoolRequest schoolRequest) {
        log.info("Received request to add new school with name: {}", schoolRequest.getSchool_name());
        String userId = getUserIdFromSecurityContext();
        log.info("User ID from request: {}", userId);
        return schoolService.addNewSchool(schoolRequest);
    }

    @PutMapping(value = "/editSchoolById/{school_id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SchoolResponse> editSchoolById(
            @PathVariable("school_id") String schoolId,
            @ModelAttribute SchoolRequest schoolRequest) {
        log.info("Editing school with ID: {}", schoolId);
        validateSchoolId(schoolId);
        return schoolService.editSchoolById(schoolRequest, schoolId);
    }

    @GetMapping("/getAllSchools")
    public ResponseEntity<List<SchoolResponse>> getAllSchools() {
        log.info("Fetching all schools");
        return schoolService.getAllSchools();
    }

    @GetMapping("/getSchoolById/{schoolId}")
    public ResponseEntity<SchoolResponse> getSchoolById(@PathVariable String schoolId) {
        log.info("Fetching school with ID: {}", schoolId);
        // validateSchoolId(schoolId);
        return schoolService.getSchoolById(schoolId);
    }

    @DeleteMapping("/deleteSchoolById/{school_id}")
    public ResponseEntity<String> deleteSchoolById(@PathVariable("school_id") String schoolId) {
        log.info("Deleting school with ID: {}", schoolId);
        validateSchoolId(schoolId);
        return schoolService.deleteSchoolById(schoolId);
    }

    // New endpoint for school stats
    // @GetMapping("/getSchoolStats/{school_id}")
    // public ResponseEntity<SchoolStatsDTO> getSchoolStats(@PathVariable("school_id") String schoolId) {
    //     log.info("Fetching stats for school with ID: {}", schoolId);
    //     validateSchoolId(schoolId);
    //     return schoolService.getSchoolStats(schoolId);
    // }

    @GetMapping("/getSchoolCount")
    public ResponseEntity<SchoolStatsDTO> getSchoolCount() {
        return schoolService.getSchoolCount();
    }

    @GetMapping("/getSchoolName")
    public ResponseEntity<List<String>> getSchoolName(@RequestBody List<String> schoolIds) {
        return schoolService.getSchoolName(schoolIds);
    }
}