package com.schoolmanagement.User_Service.controller;

import com.schoolmanagement.User_Service.config.CustomUserPrincipal;
import com.schoolmanagement.User_Service.service.SchoolPermissionBootstrapService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/api/internal/schools")
@RequiredArgsConstructor
@Slf4j
public class SchoolPermissionController {

    private final SchoolPermissionBootstrapService bootstrapService;

    /**
     * Validates that the schoolId from the path matches the schoolId in the
     * authenticated user's context.
     */
    private void validateSchoolId(String schoolId) {
        CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        String tokenSchoolId = principal.getSchoolId();
        if (!schoolId.equals(tokenSchoolId)) {
            log.error("School ID mismatch: Path schoolId={}, Token schoolId={}", schoolId, tokenSchoolId);
            throw new SecurityException("Unauthorized: School ID mismatch");
        }
    }

    @PostMapping("/{schoolId}/bootstrap-permissions")
    public ResponseEntity<String> bootstrapPermissionsForSchool(@PathVariable String schoolId) {
        log.info("Bootstrapping permissions for schoolId: {}", schoolId);
        validateSchoolId(schoolId);
        bootstrapService.bootstrapPermissions(schoolId);
        return ResponseEntity.ok("Permissions successfully bootstrapped for school: " + schoolId);
    }
}