package com.schoolmanagement.communication_service.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.schoolmanagement.communication_service.config.CustomUserPrincipal;
import com.schoolmanagement.communication_service.dto.request.CommunicationPreferenceRequest;
import com.schoolmanagement.communication_service.dto.response.ApiResponse;
import com.schoolmanagement.communication_service.dto.response.CommunicationPreferenceResponse;
import com.schoolmanagement.communication_service.service.CommunicationPreferenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@RequestMapping("/communication/api")
@RequiredArgsConstructor
public class CommunicationPreferenceController {

    private final CommunicationPreferenceService communicationPreferenceService;

    /**
     * Validates that the schoolId from the path matches the schoolId in the JWT
     * token.
     *
     * @param schoolId the school ID from the path
     * @param token    the JWT token from the request header
     * @throws SecurityException if the school IDs do not match
     */
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


    @GetMapping("/{schoolId}/getCommunicationPreferenceById/{communicationPreference_id}")
    public ResponseEntity<ApiResponse<CommunicationPreferenceResponse>> getCommunicationPreferenceById(
            @PathVariable String schoolId,
            @PathVariable("communicationPreference_id") Long communicationPreferenceId) {
        validateSchoolId(schoolId);
        String userId = getUserIdFromSecurityContext();
        log.info("Fetching communication preference for user id : {}", userId);
        return communicationPreferenceService.getPreferenceById(schoolId, communicationPreferenceId, userId);
    }

    @GetMapping("/{schoolId}/getCommunicationPreferenceByUserId")
    public ResponseEntity<ApiResponse<CommunicationPreferenceResponse>> getCommunicationPreferenceByUserId(
            @PathVariable String schoolId) {
        validateSchoolId(schoolId);
        String userId = getUserIdFromSecurityContext();
        log.info("Fetching communication preference for user id : {}", userId);
        return communicationPreferenceService.getCommunicationPreferenceByUserId(schoolId, userId);
    }

    @GetMapping("/{schoolId}/getAllCommunicationPreference")
    public ResponseEntity<ApiResponse<List<CommunicationPreferenceResponse>>> getAllCommunicationPreference(
            @PathVariable String schoolId) {
        return communicationPreferenceService.getAllPreferences(schoolId);
    }

    @PostMapping("/{schoolId}/createCommunicationPreference")
    public ResponseEntity<ApiResponse<CommunicationPreferenceResponse>> createCommunicationPreference(
            @PathVariable String schoolId,
            @RequestBody CommunicationPreferenceRequest communicationPreferenceRequest) {
        return communicationPreferenceService.addPreference(schoolId, communicationPreferenceRequest);
    }

    @PutMapping("/{schoolId}/updateCommunicationPreference/{userId}")
    public ResponseEntity<ApiResponse<CommunicationPreferenceResponse>> updateCommunicationPreference(
            @PathVariable String schoolId,
            @PathVariable String userId,
            @RequestBody CommunicationPreferenceRequest communicationPreferenceRequest) {
        return communicationPreferenceService.updatePreference(schoolId, userId,
                communicationPreferenceRequest);
    }

    @DeleteMapping("/{schoolId}/deleteCommunicationPreference/{communicationPreference_id}")
    public ResponseEntity<ApiResponse<CommunicationPreferenceResponse>> deleteCommunicationPreference(
            @PathVariable String schoolId,
            @PathVariable Long communicationPreferenceId) {
        return communicationPreferenceService.deletePreference(schoolId, communicationPreferenceId);
    }
}
