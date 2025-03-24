package com.schoolmanagement.User_Service.controller;

import com.schoolmanagement.User_Service.config.CustomUserPrincipal;
import com.schoolmanagement.User_Service.dto.PermissionDTO;
import com.schoolmanagement.User_Service.dto.PermissionRequest;
import com.schoolmanagement.User_Service.dto.PermissionRoleResponse;
import com.schoolmanagement.User_Service.model.Permission;
import com.schoolmanagement.User_Service.service.PermissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/auth/api/{schoolId}/permissions")
@RequiredArgsConstructor
@Slf4j
public class PermissionController {

    private final PermissionService permissionService;

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

    @GetMapping
    public ResponseEntity<List<PermissionDTO>> getAllPermissions(@PathVariable String schoolId) {
        log.debug("Fetching all permissions for schoolId: {}", schoolId);
        validateSchoolId(schoolId);
        return ResponseEntity.ok(permissionService.getAllPermissions(schoolId));
    }

    @GetMapping("/{permissionId}")
    public ResponseEntity<PermissionDTO> getPermissionById(@PathVariable String schoolId,
            @PathVariable Long permissionId) {
        log.debug("Fetching permission with ID: {} for schoolId: {}", permissionId, schoolId);
        validateSchoolId(schoolId);
        return ResponseEntity.ok(permissionService.getPermissionById(permissionId, schoolId));
    }

    @PostMapping
    public ResponseEntity<Permission> createPermission(@Valid @RequestBody PermissionRequest permissionRequest,
            @PathVariable String schoolId) {
        log.info("Creating permission with name: {} for schoolId: {}", permissionRequest.getName(), schoolId);
        validateSchoolId(schoolId);
        CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        String userId = principal.getUserId();
        return permissionService.createPermission(permissionRequest, schoolId, userId);
    }

    @PutMapping("/{permissionId}")
    public ResponseEntity<Permission> updatePermission(@PathVariable String schoolId, @PathVariable Long permissionId,
            @Valid @RequestBody PermissionRequest permissionRequest) {
        log.info("Updating permission with ID: {} for schoolId: {}", permissionId, schoolId);
        validateSchoolId(schoolId);
        CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        String userId = principal.getUserId();
        return permissionService.updatePermission(permissionId, permissionRequest, schoolId, userId);
    }

    @DeleteMapping("/{permissionId}")
    public ResponseEntity<String> deletePermission(@PathVariable String schoolId, @PathVariable Long permissionId) {
        log.info("Deleting permission with ID: {} for schoolId: {}", permissionId, schoolId);
        validateSchoolId(schoolId);
        CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        String userId = principal.getUserId();
        return permissionService.deletePermission(permissionId, schoolId, userId);
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<Permission> getPermissionByName(@PathVariable String schoolId, @PathVariable String name) {
        log.debug("Fetching permission with name: {} for schoolId: {}", name, schoolId);
        validateSchoolId(schoolId);
        return permissionService.getPermissionByName(name, schoolId);
    }

    @GetMapping("/by-role/{roleId}")
    public ResponseEntity<PermissionRoleResponse> getPermissionByRole(@PathVariable String schoolId,
            @PathVariable Long roleId) {
        log.debug("Fetching permission with roleId: {} for schoolId: {}", roleId, schoolId);
        validateSchoolId(schoolId);
        return permissionService.getPermissionByRole(roleId, schoolId);
    }
    @GetMapping("/by-user/{userId}")
    public ResponseEntity<PermissionRoleResponse> getPermissionForUser(@PathVariable String schoolId,
            @PathVariable String userId) {
        log.debug("Fetching permission with userId: {} for schoolId: {}", userId, schoolId);
        validateSchoolId(schoolId);
        return permissionService.getPermissionForUser(userId, schoolId);
    }
}