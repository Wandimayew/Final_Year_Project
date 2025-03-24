package com.schoolmanagement.User_Service.controller;

import com.schoolmanagement.User_Service.dto.AssignPermissionsRequest;
import com.schoolmanagement.User_Service.dto.RemoveRoleRequest;
import com.schoolmanagement.User_Service.dto.RoleRequest;
import com.schoolmanagement.User_Service.model.Role;
import com.schoolmanagement.User_Service.model.User;
import com.schoolmanagement.User_Service.service.RoleService;
import com.schoolmanagement.User_Service.config.CustomUserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/auth/api/{schoolId}/roles")
@RequiredArgsConstructor
@Slf4j
public class RoleController {

    private final RoleService roleService;

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

    @GetMapping("/{roleId}")
    public ResponseEntity<Role> getRoleById(@PathVariable String schoolId, @PathVariable Long roleId) {
        log.debug("Fetching role with ID: {} for schoolId: {}", roleId, schoolId);
        validateSchoolId(schoolId);
        return roleService.getRoleById(roleId, schoolId);
    }

    @GetMapping
    public ResponseEntity<List<Role>> getAllRoles(@PathVariable String schoolId) {
        log.debug("Fetching all roles for schoolId: {}", schoolId);
        validateSchoolId(schoolId);
        return roleService.getAllRoles(schoolId);
    }

    @PostMapping
    public ResponseEntity<Role> createRole(@Valid @RequestBody RoleRequest roleRequest, @PathVariable String schoolId) {
        log.info("Creating role with name: {} for schoolId: {}", roleRequest.getName(), schoolId);
        validateSchoolId(schoolId);
        CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        String userId = principal.getUserId();
        return roleService.createRole(roleRequest, userId);
    }

    @PutMapping("/{roleId}")
    public ResponseEntity<Role> updateRole(@PathVariable String schoolId, @PathVariable Long roleId,
            @Valid @RequestBody RoleRequest roleRequest) {
        log.info("Updating role with ID: {} for schoolId: {}", roleId, schoolId);
        validateSchoolId(schoolId);
        CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        String userId = principal.getUserId();
        return roleService.updateRole(roleId, roleRequest, schoolId, userId);
    }

    @DeleteMapping("/{roleId}")
    public ResponseEntity<String> deleteRole(@PathVariable String schoolId, @PathVariable Long roleId) {
        log.info("Deleting role with ID: {} for schoolId: {}", roleId, schoolId);
        validateSchoolId(schoolId);
        CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        String userId = principal.getUserId();
        return roleService.deleteRole(roleId, schoolId, userId);
    }

    @PostMapping("/{roleId}/assign/{userId}")
    public ResponseEntity<User> assignRoleToUser(@PathVariable String schoolId, @PathVariable Long roleId,
            @PathVariable String userId) {
        log.info("Assigning role with ID: {} to userId: {} in schoolId: {}", roleId, userId, schoolId);
        validateSchoolId(schoolId);
        CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        String updaterUserId = principal.getUserId();
        return roleService.assignRoleToUser(roleId, userId, schoolId, updaterUserId);
    }

    @PostMapping("/assign-permissions")
    public ResponseEntity<String> assignPermissionsToUserForRole(@PathVariable String schoolId,
            @Valid @RequestBody AssignPermissionsRequest request) {
        log.info("Assigning permissions to userId: {} for roleId: {} in schoolId: {}", request.getUserId(),
                request.getRoleId(), schoolId);
        validateSchoolId(schoolId);
        CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        String updaterUserId = principal.getUserId();
        return roleService.assignPermissionsToUserForRole(request.getUserId(), request.getRoleId(),
                request.getPermissionIds(), schoolId, updaterUserId);
    }

    @DeleteMapping("/remove-role")
    public ResponseEntity<User> removeRoleFromUser(@PathVariable String schoolId,
            @Valid @RequestBody RemoveRoleRequest request) {
        log.info("Removing role with ID: {} from userId: {} in schoolId: {}", request.getRoleId(), request.getUserId(),
                schoolId);
        validateSchoolId(schoolId);
        CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        String updaterUserId = principal.getUserId();
        return roleService.removeRoleFromUser(request.getUserId(), schoolId, updaterUserId);
    }
}