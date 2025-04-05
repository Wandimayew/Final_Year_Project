package com.schoolmanagement.User_Service.service;

import com.schoolmanagement.User_Service.config.CustomUserPrincipal;
import com.schoolmanagement.User_Service.dto.SignupRequest;
import com.schoolmanagement.User_Service.dto.UserLoginActivityDTO;
import com.schoolmanagement.User_Service.dto.UserResponseDTO;
import com.schoolmanagement.User_Service.dto.UserRoleCountDTO;
import com.schoolmanagement.User_Service.exception.BadRequestException;
import com.schoolmanagement.User_Service.model.Role;
import com.schoolmanagement.User_Service.model.User;
import com.schoolmanagement.User_Service.model.UserActivity;
import com.schoolmanagement.User_Service.model.UserRolePermission;
import com.schoolmanagement.User_Service.repository.UserActivityRepository;
import com.schoolmanagement.User_Service.repository.UserRepository;
import com.schoolmanagement.User_Service.repository.UserRolePermissionRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class UserService implements UserDetailsService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserActivityRepository userActivityRepository;
    private final UserRolePermissionRepository userRolePermissionRepository; // Added for permission management
    private final PermissionService permissionService; // Added for cache eviction

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.info("Loading user by username: {}", username);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        log.info("User fetched: {}", user);

        // Avoid forcing role initialization here; let AuthService handle roles
        Set<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        log.info("Roles from User entity: {}", roles);
        return new CustomUserPrincipal(user.getUsername(), user.getPassword(), user.getUserId(), user.getSchoolId(),
                roles);
    }

    // Other methods unchanged
    public ResponseEntity<UserResponseDTO> updateUser(SignupRequest updatedUserDetails, String userId, String schoolId,
            String userToUpdate) {
        log.info("Updating user with ID: {} in schoolId: {}", userId, schoolId);
        User existingUser = userRepository.findBySchoolIdAndUserId(schoolId, userId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "User not found with ID: " + userId + " in school: " + schoolId));

        if (!existingUser.getIsActive()) {
            throw new EntityNotFoundException("Account is inactive for ID: " + userId);
        }

        existingUser.setEmail(
                updatedUserDetails.getEmail() != null ? updatedUserDetails.getEmail() : existingUser.getEmail());
        existingUser.setUsername(updatedUserDetails.getUsername() != null ? updatedUserDetails.getUsername()
                : existingUser.getUsername());
        existingUser.setPassword(
                updatedUserDetails.getPassword() != null ? passwordEncoder.encode(updatedUserDetails.getPassword())
                        : existingUser.getPassword());
        existingUser.setUpdatedAt(LocalDateTime.now());
        existingUser.setUpdatedBy(userToUpdate);

        User updatedUser = userRepository.save(existingUser);
        log.info("User updated with ID: {} in schoolId: {}", userId, schoolId);
        return ResponseEntity.ok(convertToUserResponse(updatedUser));
    }

    public ResponseEntity<UserResponseDTO> getUserById(String userId, String schoolId) {
        log.debug("Fetching user with ID: {} in schoolId: {}", userId, schoolId);
        User existingUser = userRepository.findBySchoolIdAndUserId(schoolId, userId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "User not found with ID: " + userId + " in school: " + schoolId));
        if (!existingUser.getIsActive()) {
            throw new EntityNotFoundException("Account is inactive for ID: " + userId);
        }
        return ResponseEntity.ok(convertToUserResponse(existingUser));
    }

    public ResponseEntity<List<UserResponseDTO>> getUsersByRoles(List<Long> roleIds, String schoolId) {
        log.debug("Fetching users with roles: {} in schoolId: {}", roleIds, schoolId);
        List<User> users = userRepository.findByRolesAndSchoolId(roleIds, schoolId);
        return ResponseEntity.ok(users.stream().map(this::convertToUserResponse).collect(Collectors.toList()));
    }

    public ResponseEntity<String> deleteUserById(String userId, String schoolId, String userToUpdate) {
        log.info("Deleting user with ID: {} in schoolId: {}", userId, schoolId);
        User existingUser = userRepository.findBySchoolIdAndUserId(schoolId, userId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "User not found with ID: " + userId + " in school: " + schoolId));

        existingUser.setIsActive(false);
        existingUser.setUpdatedBy(userToUpdate);
        existingUser.setUpdatedAt(LocalDateTime.now());
        userRepository.save(existingUser);
        log.info("User with ID: {} marked as inactive in schoolId: {}", userId, schoolId);
        return ResponseEntity.ok("User with ID: " + userId + " in school: " + schoolId + " deleted successfully.");
    }

    public ResponseEntity<List<UserResponseDTO>> getUsersBySchool(String schoolId) {
        log.debug("Fetching all users for schoolId: {}", schoolId);
        List<User> users = userRepository.findBySchoolId(schoolId);
        return ResponseEntity.ok(users.stream().map(this::convertToUserResponse).collect(Collectors.toList()));
    }

    public ResponseEntity<UserResponseDTO> changePassword(String userId, String schoolId, String currentPassword,
            String newPassword) {
        log.info("Changing password for userId: {} in schoolId: {}", userId, schoolId);
        User user = userRepository.findBySchoolIdAndUserId(schoolId, userId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "User not found with ID: " + userId + " in school: " + schoolId));

        if (!user.getIsActive()) {
            throw new EntityNotFoundException("Account is inactive for ID: " + userId);
        }

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        User updatedUser = userRepository.save(user);
        log.info("Password changed for userId: {} in schoolId: {}", userId, schoolId);
        return ResponseEntity.ok(convertToUserResponse(updatedUser));
    }

    private UserResponseDTO convertToUserResponse(User user) {
        return UserResponseDTO.builder()
                .userId(user.getUserId())
                .schoolId(user.getSchoolId())
                .username(user.getUsername())
                .email(user.getEmail())
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                .isActive(user.getIsActive())
                .lastLogin(user.getLastLogin())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    public String getEmailByUserId(String schoolId, String userId) {
        log.debug("Fetching email for userId: {} in schoolId: {}", userId, schoolId);
        User existingUser = userRepository.findBySchoolIdAndUserId(schoolId, userId).orElse(null);

        if (existingUser == null || !existingUser.getIsActive()) {
            log.info("Active user not found for ID: {} in school: {}", userId, schoolId);
            return null;
        }

        return existingUser.getEmail();
    }

    public List<String> getUserIdsByRole(String role, String schoolId) {
        log.info("Fetching users with role: {} in school: {}", role, schoolId);
        List<User> users = userRepository.findByRoleNameAndSchoolId(role, schoolId);
        log.info("Found {} users with role: {} in school: {}", users.size(), role, schoolId);
        return users.stream()
                .map(user -> String.format("ID: %s, Email: %s", user.getUserId(), user.getEmail()))
                .collect(Collectors.toList());
    }

    public UserRoleCountDTO getUserCountsByRole(String schoolId) {
        log.info("Calculating user counts by role for schoolId: {}", schoolId);

        // Fetch all users for the school
        List<User> users = userRepository.findBySchoolId(schoolId);
        if (users == null || users.isEmpty()) {
            log.warn("No users found for schoolId: {}", schoolId);
            return new UserRoleCountDTO(0L, 0L, 0L, 0L);
        }

        // Count users by role category
        long students = 0L;
        long parents = 0L;
        long teachers = 0L;
        long staff = 0L;

        for (User user : users) {
            Set<Role> roles = user.getRoles();
            for (Role role : roles) {
                String roleName = role.getName().toUpperCase();
                if (roleName.contains("ROLE_STUDENT")) {
                    students++;
                } else if (roleName.contains("ROLE_PARENT")) {
                    parents++;
                } else if (roleName.contains("ROLE_TEACHER")) {
                    teachers++;
                } else if (roleName.contains("ROLE_ADMIN")) {
                    staff++;
                }
            }
        }

        UserRoleCountDTO result = new UserRoleCountDTO(students, parents, teachers, staff);
        log.debug("User counts for schoolId {}: {}", schoolId, result);
        return result;
    }

    public UserLoginActivityDTO getAllAdmins() {
        log.info("Fetching all admin users across all schools");
        String roleName = "ROLE_ADMIN";

        List<User> admins = userRepository.findByRoleNameAndSchool(roleName);
        log.info("Fetching all admin login activity from response {}", admins);

        if (admins.isEmpty()) {
            log.warn("No admins found");
            return new UserLoginActivityDTO(List.of(), "No admin users found");
        }

        List<UserResponseDTO> adminDTOs = admins.stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());

        log.info("Found {} admin users", adminDTOs.size());
        return new UserLoginActivityDTO(adminDTOs, "Admin users retrieved successfully");
    }

    public UserLoginActivityDTO getAllAdminActivity() {
        log.info("Fetching all admin login activity");
        String roleName = "ROLE_ADMIN";
        List<User> admins = userRepository.findByRoleNameAndSchool(roleName);
        log.info("Fetching all admin login activity from response {}", admins);

        if (admins.isEmpty()) {
            log.warn("No admins found for activity retrieval");
            return new UserLoginActivityDTO(List.of(), "No admin activity found");
        }

        List<String> userIds = admins.stream()
                .map(User::getUserId)
                .collect(Collectors.toList());

        // Corrected to use UserActivity instead of UserLoginActivity
        List<UserActivity> activities = userActivityRepository.findByUserIds(userIds);

        log.info("login activity found for admins {}", activities);

        if (activities.isEmpty()) {
            log.warn("No login activity found for admins");
            return new UserLoginActivityDTO(List.of(), "No admin activity found");
        }

        List<UserResponseDTO> activityDTOs = activities.stream()
                .map(activity -> {
                    User user = userRepository.findById(activity.getUserId()).orElse(null);
                    if (user != null) {
                        UserResponseDTO dto = convertToUserResponse(user);
                        dto.setLastLogin(activity.getTimestamp()); // Use activity timestamp
                        return dto;
                    }
                    return null;
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());

        log.info("Found {} admin login activities", activityDTOs.size());
        return new UserLoginActivityDTO(activityDTOs, "Admin login activities retrieved successfully");
    }

    public ResponseEntity<String> removePermissionFromUser(String userId, String schoolId, Long permissionId,
            String updaterUserId) {
        log.info("Removing permission with ID: {} from userId: {} in schoolId: {}", permissionId, userId, schoolId);

        // Step 1: Validate the user exists, is active, and belongs to the school
        User user = userRepository.findBySchoolIdAndUserId(schoolId, userId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "User not found with ID: " + userId + " in school: " + schoolId));

        if (!user.getIsActive()) {
            throw new EntityNotFoundException("Account is inactive for ID: " + userId);
        }

        // Step 2: Find and soft-delete the UserRolePermission entries for this user and
        // permission
        List<UserRolePermission> permissionsToRemove = userRolePermissionRepository
                .findByUserAndPermissionIdAndSchoolId(user, permissionId, schoolId);

        log.info(" active permission with ID: {} found for userId: {} in school: {}", permissionId, userId, schoolId);

        if (permissionsToRemove.isEmpty()) {
            log.warn("No active permission with ID: {} found for userId: {} in school: {}", permissionId, userId,
                    schoolId);
            return ResponseEntity.ok("No permission found to remove for this user.");
        }

        permissionsToRemove.forEach(urp -> {
            urp.setIsActive(false);
            urp.setUpdatedAt(LocalDateTime.now());
            urp.setUpdatedBy(updaterUserId);
            userRolePermissionRepository.save(urp);
        });

        // Step 3: Evict permissions cache for the user
        permissionService.evictUserPermissionsCache(userId, schoolId);

        log.info("Permission with ID: {} removed from userId: {} in schoolId: {}", permissionId, userId, schoolId);
        return ResponseEntity
                .ok("Permission with ID: " + permissionId + " removed from user with ID: " + userId + " successfully.");
    }
}