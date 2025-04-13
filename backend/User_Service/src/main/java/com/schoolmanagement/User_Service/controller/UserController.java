package com.schoolmanagement.User_Service.controller;

import com.schoolmanagement.User_Service.config.CustomUserPrincipal;
import com.schoolmanagement.User_Service.dto.SignupRequest;
import com.schoolmanagement.User_Service.dto.UserLoginActivityDTO;
import com.schoolmanagement.User_Service.dto.UserResponseDTO;
import com.schoolmanagement.User_Service.dto.UserRoleCountDTO;
import com.schoolmanagement.User_Service.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/auth/api")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

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

    @PutMapping("/{schoolId}/users/{userId}")
    public ResponseEntity<UserResponseDTO> updateUser(
            @PathVariable String schoolId,
            @PathVariable String userId,
            @Valid @RequestBody SignupRequest updatedUserDetails) {
        log.info("Updating user with ID: {} in schoolId: {}", userId, schoolId);
        validateSchoolId(schoolId);
        CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        String updaterUserId = principal.getUserId();
        return userService.updateUser(updatedUserDetails, userId, schoolId, updaterUserId);
    }

    @GetMapping("/{schoolId}/users/{userId}")
    public ResponseEntity<UserResponseDTO> getUserById(
            @PathVariable String schoolId,
            @PathVariable String userId) {
        log.debug("Fetching user with ID: {} in schoolId: {}", userId, schoolId);
        validateSchoolId(schoolId);
        return userService.getUserById(userId, schoolId);
    }

    @GetMapping("/{schoolId}/users/roles")
    public ResponseEntity<List<UserResponseDTO>> getUsersByRoles(
            @PathVariable String schoolId,
            @RequestParam("roleIds") List<Long> roleIds) {
        log.debug("Fetching users with roleIds: {} in schoolId: {}", roleIds, schoolId);
        validateSchoolId(schoolId);
        return userService.getUsersByRoles(roleIds, schoolId);
    }

    @DeleteMapping("/{schoolId}/users/{userId}")
    public ResponseEntity<String> deleteUserById(
            @PathVariable String schoolId,
            @PathVariable String userId) {
        log.info("Deleting user with ID: {} in schoolId: {}", userId, schoolId);
        validateSchoolId(schoolId);
        CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        String updaterUserId = principal.getUserId();
        return userService.deleteUserById(userId, schoolId, updaterUserId);
    }

    @GetMapping("/{schoolId}/users")
    public ResponseEntity<List<UserResponseDTO>> getUsersBySchool(
            @PathVariable String schoolId) {
        log.debug("Fetching all users for schoolId: {}", schoolId);
        validateSchoolId(schoolId);
        return userService.getUsersBySchool(schoolId);
    }

    @GetMapping("/{schoolId}/users/{userId}/email")
    public ResponseEntity<String> getUserEmail(
            @PathVariable String schoolId,
            @PathVariable String userId) {
        log.debug("Fetching email for userId: {} in schoolId: {}", userId, schoolId);
        validateSchoolId(schoolId);
        String email = userService.getEmailByUserId(schoolId, userId);
        return email != null ? ResponseEntity.ok(email) : ResponseEntity.notFound().build();
    }

    @GetMapping("/{schoolId}/users/role")
    public ResponseEntity<List<String>> getUserIdsByRole(
            @PathVariable String schoolId,
            @RequestParam String role) {
        log.warn("Fetching user IDs with role: {} in schoolId: {}", role, schoolId);
        validateSchoolId(schoolId);
        List<String> userIds = userService.getUserIdsByRole(role, schoolId);
        return ResponseEntity.ok(userIds);
    }

    @PutMapping("/{schoolId}/change-password")
    public ResponseEntity<UserResponseDTO> changePassword(
            @PathVariable String schoolId,
            @RequestParam String currentPassword,
            @RequestParam String newPassword) {
        log.info("Changing password for user in schoolId: {}", schoolId);
        validateSchoolId(schoolId);
        CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        String userId = principal.getUserId();
        return userService.changePassword(userId, schoolId, currentPassword, newPassword);
    }

    @GetMapping("/{schoolId}/users-counts")
    public ResponseEntity<UserRoleCountDTO> getUserCountsByRole(
            @PathVariable String schoolId) {
        log.debug("Fetching user counts by role for schoolId: {}", schoolId);
        // validateSchoolId(schoolId);
        UserRoleCountDTO roleCounts = userService.getUserCountsByRole(schoolId);
        return ResponseEntity.ok(roleCounts);
    }

    @GetMapping("/getAllAdminActivity")
    public ResponseEntity<UserLoginActivityDTO> getAllAdminActivity() {
        // validateSchoolId(schoolId);
        UserLoginActivityDTO getAdminsActivity = userService.getAllAdminActivity();
        return ResponseEntity.ok(getAdminsActivity);
    }

    @GetMapping("/getAllAdmins")
    public ResponseEntity<UserLoginActivityDTO> getAllAdmins() {
        // validateSchoolId(schoolId);
        UserLoginActivityDTO getAdmins = userService.getAllAdmins();
        return ResponseEntity.ok(getAdmins);
    }

    @DeleteMapping("/{schoolId}/user/remove-permissions/{userId}/{permissionId}")
    public ResponseEntity<String> removePermissionFromUser(
            @PathVariable String schoolId,
            @PathVariable String userId,
            @PathVariable Long permissionId) {
        log.info("removing permission with ID: {} from userId :{} in schoolId: {}", permissionId, userId, schoolId);
        validateSchoolId(schoolId);
        CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        String updaterUserId = principal.getUserId();
        return userService.removePermissionFromUser(userId, schoolId, permissionId, updaterUserId);
    }
}