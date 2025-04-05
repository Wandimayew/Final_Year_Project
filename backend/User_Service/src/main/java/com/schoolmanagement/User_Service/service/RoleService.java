package com.schoolmanagement.User_Service.service;

import com.schoolmanagement.User_Service.dto.RoleRequest;
import com.schoolmanagement.User_Service.exception.DuplicateResourceException;
import com.schoolmanagement.User_Service.model.Permission;
import com.schoolmanagement.User_Service.model.Role;
import com.schoolmanagement.User_Service.model.User;
import com.schoolmanagement.User_Service.model.UserRolePermission;
import com.schoolmanagement.User_Service.repository.PermissionRepository;
import com.schoolmanagement.User_Service.repository.RoleRepository;
import com.schoolmanagement.User_Service.repository.UserRepository;
import com.schoolmanagement.User_Service.repository.UserRolePermissionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class RoleService {

        private final RoleRepository roleRepository;
        private final PermissionRepository permissionRepository;
        private final UserRepository userRepository;
        private final UserRolePermissionRepository userRolePermissionRepository;
        private final PermissionService permissionService;

        public ResponseEntity<Role> getRoleById(Long roleId, String schoolId) {
                log.debug("Fetching role with ID: {} for schoolId: {}", roleId, schoolId);
                Role role = roleRepository.findById(roleId)
                                .filter(r -> r.getSchoolId().equals(schoolId))
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Role not found with ID: " + roleId + " in school: " + schoolId));
                return ResponseEntity.ok(role);
        }

        public ResponseEntity<List<Role>> getAllRoles(String schoolId) {
                log.debug("Fetching all roles for schoolId: {}", schoolId);
                List<Role> roles = roleRepository.findBySchoolId(schoolId);
                if (roles.isEmpty()) {
                        throw new EntityNotFoundException("No roles found for schoolId: " + schoolId);
                }
                return ResponseEntity.ok(roles);
        }

        public ResponseEntity<Role> createRole(RoleRequest roleRequest, String userId) {
                log.info("Creating role with name: {} for schoolId: {}", roleRequest.getName(),
                                roleRequest.getSchoolId());
                if (roleRepository.existsByNameAndSchoolId(roleRequest.getName(), roleRequest.getSchoolId())) {
                        throw new DuplicateResourceException("Role with name '" + roleRequest.getName()
                                        + "' already exists in school: " + roleRequest.getSchoolId());
                }

                Role role = new Role();
                role.setCreatedAt(LocalDateTime.now());
                role.setUpdatedAt(LocalDateTime.now());
                role.setCreatedBy(userId);
                role.setDescription(roleRequest.getDescription());
                role.setName(roleRequest.getName());
                role.setSchoolId(roleRequest.getSchoolId());
                role.setIsActive(true); // Default to active

                Role savedRole = roleRepository.save(role);
                log.info("Role created with ID: {} for schoolId: {}", savedRole.getRoleId(), roleRequest.getSchoolId());
                return ResponseEntity.ok(savedRole);
        }

        public ResponseEntity<Role> updateRole(Long roleId, RoleRequest roleRequest, String schoolId, String userId) {
                log.info("Updating role with ID: {} for schoolId: {}", roleId, schoolId);
                Role existingRole = roleRepository.findById(roleId)
                                .filter(r -> r.getSchoolId().equals(schoolId) && r.getIsActive())
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Role not found with ID: " + roleId + " in school: " + schoolId));

                if (!existingRole.getName().equals(roleRequest.getName()) &&
                                roleRepository.existsByNameAndSchoolId(roleRequest.getName(), schoolId)) {
                        throw new DuplicateResourceException(
                                        "Role with name '" + roleRequest.getName() + "' already exists in school: "
                                                        + schoolId);
                }

                existingRole.setName(roleRequest.getName());
                existingRole.setDescription(roleRequest.getDescription());
                existingRole.setUpdatedAt(LocalDateTime.now());
                existingRole.setUpdatedBy(userId);

                Role updatedRole = roleRepository.save(existingRole);
                log.info("Role updated with ID: {} for schoolId: {}", roleId, schoolId);
                return ResponseEntity.ok(updatedRole);
        }

        public ResponseEntity<String> deleteRole(Long roleId, String schoolId, String userId) {
                log.info("Deleting role with ID: {} for schoolId: {}", roleId, schoolId);
                Role existingRole = roleRepository.findById(roleId)
                                .filter(r -> r.getSchoolId().equals(schoolId) && r.getIsActive())
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Role not found with ID: " + roleId + " in school: " + schoolId));

                existingRole.setIsActive(false);
                existingRole.setUpdatedAt(LocalDateTime.now());
                existingRole.setUpdatedBy(userId);

                roleRepository.save(existingRole);
                log.info("Role with ID: {} marked as inactive for schoolId: {}", roleId, schoolId);
                return ResponseEntity
                                .ok("Role with ID: " + roleId + " in school: " + schoolId + " deleted successfully.");
        }

        public ResponseEntity<User> assignRoleToUser(Long roleId, String userId, String schoolId, String userToUpdate) {
                log.info("Assigning role with ID: {} to userId: {} in schoolId: {}", roleId, userId, schoolId);
                Role role = roleRepository.findById(roleId)
                                .filter(r -> r.getSchoolId().equals(schoolId) && r.getIsActive())
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Role not found with ID: " + roleId + " in school: " + schoolId));

                User user = userRepository.findById(userId)
                                .filter(u -> u.getSchoolId().equals(schoolId) && u.getIsActive())
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "User with ID: " + userId + " not found in school: " + schoolId));

                user.getRoles().add(role);
                user.setUpdatedBy(userToUpdate);
                user.setUpdatedAt(LocalDateTime.now());

                User updatedUser = userRepository.save(user);
                permissionService.evictUserPermissionsCache(userId, schoolId); // Evict cache
                log.info("Role with ID: {} assigned to userId: {} in schoolId: {}", roleId, userId, schoolId);
                return ResponseEntity.ok(updatedUser);
        }

        public ResponseEntity<String> assignPermissionsToUserForRole(String userId, Long roleId,
                        Set<Long> permissionIds,
                        String schoolId, String userIdUpdater) {
                log.info("Assigning permissions to userId: {} for roleId: {} in schoolId: {}", userId, roleId,
                                schoolId);
                User user = userRepository.findById(userId)
                                .filter(u -> u.getSchoolId().equals(schoolId) && u.getIsActive())
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "User not found with ID: " + userId + " in school: " + schoolId));

                Role role = roleRepository.findById(roleId)
                                .filter(r -> r.getSchoolId().equals(schoolId) && r.getIsActive())
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Role not found with ID: " + roleId + " in school: " + schoolId));

                if (!user.getRoles().contains(role)) {
                        throw new IllegalArgumentException("User does not have the role with ID: " + roleId);
                }

                // userRolePermissionRepository.softDeleteByUserAndRole(userId, roleId,
                // schoolId); // Soft delete existing
                // permissions

                Set<UserRolePermission> newAssignments = permissionIds.stream()
                                .map(permissionId -> {
                                        Permission permission = permissionRepository.findById(permissionId)
                                                        .filter(p -> p.getSchoolId().equals(schoolId)
                                                                        && p.getIs_active())
                                                        .orElseThrow(() -> new EntityNotFoundException(
                                                                        "Permission not found with ID: " + permissionId
                                                                                        + " in school: " + schoolId));
                                        UserRolePermission urp = new UserRolePermission();
                                        urp.setUser(user);
                                        urp.setRole(role);
                                        urp.setPermission(permission);
                                        urp.setType("assigned");
                                        urp.setSchoolId(schoolId);
                                        urp.setCreatedAt(LocalDateTime.now());
                                        urp.setUpdatedAt(LocalDateTime.now());
                                        urp.setCreatedBy(userIdUpdater);
                                        urp.setIsActive(true);
                                        return urp;
                                })
                                .collect(Collectors.toSet());

                userRolePermissionRepository.saveAll(newAssignments);
                permissionService.evictUserPermissionsCache(userId, schoolId); // Evict cache
                log.info("Assigned {} permissions to userId: {} for roleId: {} in schoolId: {}", permissionIds.size(),
                                userId,
                                roleId, schoolId);
                return ResponseEntity.ok("Permissions assigned successfully.");
        }

        public ResponseEntity<User> removeRoleFromUser(String userId, String schoolId, String userUpdater) {
                log.info("Changing role to ROLE_USER for userId: {} in schoolId: {}", userId, schoolId);

                // Step 1: Find the "ROLE_USER" role by name and validate it exists, is active,
                // and belongs to the school
                Role userRole = roleRepository.findByNameAndSchoolId("ROLE_USER", schoolId)
                                .filter(Role::getIsActive)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Role 'ROLE_USER' not found in school: " + schoolId));

                // Step 2: Find the user by ID and validate they exist, are active, and belong
                // to the school
                User user = userRepository.findById(userId)
                                .filter(u -> u.getSchoolId().equals(schoolId) && u.getIsActive())
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "User with ID: " + userId + " not found in school: " + schoolId));

                // Step 3: Clear existing roles and assign "ROLE_USER"
                user.getRoles().clear(); // Remove all current roles
                user.getRoles().add(userRole); // Assign the "ROLE_USER" role

                // Step 4: Update user metadata
                user.setUpdatedBy(userUpdater);
                user.setUpdatedAt(LocalDateTime.now());

                // Step 5: Save the updated user
                User updatedUser = userRepository.save(user);

                // Step 6: Evict permissions cache (since roles affect permissions)
                permissionService.evictUserPermissionsCache(userId, schoolId);

                log.info("Role 'ROLE_USER' assigned to userId: {} in schoolId: {}", userId, schoolId);
                return ResponseEntity.ok(updatedUser);
        }

        public ResponseEntity<String> removePermissionFromRole(String schoolId, Long roleId, Long permissionId,
                        String updaterUserId) {
                log.info("Removing permission with ID: {} from roleId: {} in schoolId: {}", permissionId, roleId,
                                schoolId);

                // Step 1: Validate the role exists, is active, and belongs to the school
                Role role = roleRepository.findById(roleId)
                                .filter(r -> r.getSchoolId().equals(schoolId) && r.getIsActive())
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Role not found with ID: " + roleId + " in school: " + schoolId));

                log.info("Role with ID: {} found with data : {} in school id: {}", roleId, role, schoolId);
                // Step 2: Validate the permission exists, is active, and belongs to the school
                Permission permission = permissionRepository.findById(permissionId)
                                .filter(p -> p.getSchoolId().equals(schoolId) && p.getIs_active())
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Permission not found with ID: " + permissionId + " in school: "
                                                                + schoolId));

                log.info("Permission with ID: {} found with data : {} in school id: {}", permissionId, permission,
                                schoolId);

                // Step 3: Find all active UserRolePermission entries for this role and
                // permission
                List<UserRolePermission> permissionsToRemove = userRolePermissionRepository
                                .findPermissionsByRoleAndSchool(roleId, schoolId)
                                .stream()
                                .filter(urp -> urp.getPermission().getPermissionId().equals(permissionId))
                                .collect(Collectors.toList());

                if (permissionsToRemove.isEmpty()) {
                        log.warn("No active permission with ID: {} found for roleId: {} in school: {}", permissionId,
                                        roleId, schoolId);
                        return ResponseEntity.ok("No permission found to remove for this role.");
                }

                // Step 4: Soft-delete the found UserRolePermission entries
                permissionsToRemove.forEach(urp -> {
                        urp.setIsActive(false);
                        urp.setUpdatedAt(LocalDateTime.now());
                        urp.setUpdatedBy(updaterUserId);
                        userRolePermissionRepository.save(urp);
                });

                // Step 5: Evict permissions cache for all users with this role
                List<User> affectedUsers = userRepository.findByRolesAndSchoolId(List.of(roleId), schoolId);
                affectedUsers.forEach(user -> permissionService.evictUserPermissionsCache(user.getUserId(), schoolId));

                log.info("Permission with ID: {} removed from roleId: {} in schoolId: {}", permissionId, roleId,
                                schoolId);
                return ResponseEntity.ok("Permission with ID: " + permissionId +
                                " removed from role with ID: " + roleId +
                                " successfully.");
        }
}