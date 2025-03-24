package com.schoolmanagement.User_Service.controller;

import com.schoolmanagement.User_Service.dto.SignupRequest;
import com.schoolmanagement.User_Service.dto.UserResponseDTO;
import com.schoolmanagement.User_Service.model.User;
import com.schoolmanagement.User_Service.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/auth/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    // Update user details
    @PutMapping("/{userId}")
    public ResponseEntity<UserResponseDTO> updateUser(@PathVariable String userId,
            @Valid @RequestBody SignupRequest updatedUserDetails) {
        return userService.updateUser(updatedUserDetails, userId);
    }

    // Get user by ID
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable String userId) {
        return userService.getUserById(userId);
    }

    // Get all users by roles
    @GetMapping("/roles")
    public ResponseEntity<List<UserResponseDTO>> getUsersByRoles(@RequestParam List<Long> roleId) {
        return userService.getUsersByRoles(roleId);
    }

    // Delete user by ID (soft delete)
    @DeleteMapping("/{userId}")
    public ResponseEntity<String> deleteUserById(@PathVariable String userId) {
        return userService.deleteUserById(userId);
    }

    // Get all users by school ID
    @GetMapping("/school/{schoolId}")
    public ResponseEntity<List<UserResponseDTO>> getUsersBySchool(@PathVariable String schoolId) {
        return userService.getUsersBySchool(schoolId);
    }

    // Get user Email by userId
    @GetMapping("/{schoolId}/{userId}/email")
    public String getUserEmail(@PathVariable String schoolId, @PathVariable String userId) {
        return userService.getEmailByUserId(schoolId, userId);
    }

    @GetMapping("/{schoolId}/role")
    List<String> getUserIdsByRole(
            @PathVariable String schoolId,
            @RequestParam String role) {
        log.info("data that comes from communication service school Id is {} and thier roles {}", schoolId, role);
        return userService.getUserIdsByRole(role, schoolId);
    }

    // Change user password
    @PutMapping("/{userId}/change-password")
    public ResponseEntity<UserResponseDTO> changePassword(@PathVariable String userId,
            @RequestParam String currentPassword, @RequestParam String newPassword) {
        return userService.changePassword(userId, currentPassword, newPassword);
    }

}
