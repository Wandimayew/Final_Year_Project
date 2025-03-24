package com.schoolmanagement.User_Service.controller;

import com.schoolmanagement.User_Service.config.CustomUserPrincipal;
import com.schoolmanagement.User_Service.dto.PermissionCheckRequest;
import com.schoolmanagement.User_Service.dto.PermissionCheckResponse;
import com.schoolmanagement.User_Service.service.PermissionService;
import com.schoolmanagement.User_Service.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/api/internal")
@RequiredArgsConstructor
@Slf4j
public class PermissionCheckController {

    private final PermissionService permissionService;
    private final JwtUtil jwtUtil;

    private static final String SERVICE_TOKEN = "this-is-me-do-you-remember-me"; // Hardcoded for simplicity; use config in
                                                                             // production

    /**
     * Validates the service token provided by the calling service.
     */
    private void validateServiceToken(String serviceToken) {
        if (!SERVICE_TOKEN.equals(serviceToken)) {
            log.error("Invalid service token: {}", serviceToken);
            throw new SecurityException("Unauthorized service");
        }
    }

    /**
     * Validates that the schoolId from the request matches the schoolId in the
     * authenticated user's context.
     */
    private void validateSchoolId(String schoolId) {
        CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        String tokenSchoolId = principal.getSchoolId();
        if (!schoolId.equals(tokenSchoolId)) {
            log.error("School ID mismatch: Request schoolId={}, Token schoolId={}", schoolId, tokenSchoolId);
            throw new SecurityException("Unauthorized: School ID mismatch");
        }
    }

    @PostMapping("/check-permission")
    public ResponseEntity<PermissionCheckResponse> checkUserPermission(
            @RequestBody PermissionCheckRequest request,
            @RequestHeader("Authorization") String userToken, // User JWT
            @RequestHeader("X-Service-Token") String serviceToken) { // Service-specific token
        log.info("Checking permission for userId: {} on endpoint: {} with method: {} in schoolId: {}",
                request.getUserId(), request.getEndpoint(), request.getHttpMethod(), request.getSchoolId());

        // Validate service token first
        validateServiceToken(serviceToken);

        // Validate user token and set SecurityContext (assuming JwtAuthenticationFilter
        // runs first)
        if (!jwtUtil.validateToken(userToken.replace("Bearer ", ""))) {
            log.warn("Invalid user token for userId: {}", request.getUserId());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(PermissionCheckResponse.builder()
                            .userId(request.getUserId())
                            .endpoint(request.getEndpoint())
                            .httpMethod(request.getHttpMethod())
                            .schoolId(request.getSchoolId())
                            .hasPermission(false)
                            .build());
        }

        // Validate schoolId
        validateSchoolId(request.getSchoolId());

        boolean hasPermission = permissionService.checkUserPermission(
                request.getUserId(), request.getSchoolId(), request.getEndpoint(), request.getHttpMethod());

        PermissionCheckResponse response = PermissionCheckResponse.builder()
                .userId(request.getUserId())
                .endpoint(request.getEndpoint())
                .httpMethod(request.getHttpMethod())
                .schoolId(request.getSchoolId())
                .hasPermission(hasPermission)
                .build();

        return ResponseEntity.ok(response);
    }
}