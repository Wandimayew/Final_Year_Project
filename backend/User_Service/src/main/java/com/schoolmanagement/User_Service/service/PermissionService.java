package com.schoolmanagement.User_Service.service;

import com.schoolmanagement.User_Service.dto.PermissionDTO;
import com.schoolmanagement.User_Service.dto.PermissionRequest;
import com.schoolmanagement.User_Service.dto.PermissionRoleResponse;
import com.schoolmanagement.User_Service.exception.DuplicateResourceException;
import com.schoolmanagement.User_Service.model.Permission;
import com.schoolmanagement.User_Service.model.UserRolePermission;
import com.schoolmanagement.User_Service.repository.PermissionRepository;
import com.schoolmanagement.User_Service.repository.UserRolePermissionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PermissionService {

    private final PermissionRepository permissionRepository;
    private final UserRolePermissionRepository userRolePermissionRepository;

    @Cacheable(value = "userPermissions", key = "#userId + '-' + #schoolId")
    public List<String> getUserPermissions(String userId, String schoolId) {
        log.debug("Fetching permissions for userId: {} in schoolId: {}", userId, schoolId);
        List<UserRolePermission> urps = userRolePermissionRepository.findActivePermissionsByUserIdAndSchoolId(userId,
                schoolId);
        List<String> permissions = urps.stream()
                .map(urp -> urp.getPermission().getName())
                .collect(Collectors.toList());
        log.debug("Found {} permissions for userId: {} in schoolId: {}", permissions.size(), userId, schoolId);
        return permissions;
    }

    @CacheEvict(value = "userPermissions", key = "#userId + '-' + #schoolId")
    public void evictUserPermissionsCache(String userId, String schoolId) {
        log.debug("Evicting permission cache for userId: {} in schoolId: {}", userId, schoolId);
    }

    public List<PermissionDTO> getAllPermissions(String schoolId) {
        log.debug("Fetching all permissions for schoolId: {}", schoolId);
        List<Permission> permissions = permissionRepository.findBySchoolId(schoolId);
        return permissions.stream().map(PermissionDTO::new).collect(Collectors.toList());
    }

    public PermissionDTO getPermissionById(Long permissionId, String schoolId) {
        log.debug("Fetching permission with ID: {} for schoolId: {}", permissionId, schoolId);
        Permission permission = permissionRepository.findById(permissionId)
                .filter(p -> p.getSchoolId().equals(schoolId))
                .orElseThrow(() -> new EntityNotFoundException(
                        "Permission not found with ID: " + permissionId + " in school: " + schoolId));
        return new PermissionDTO(permission);
    }

    public ResponseEntity<Permission> createPermission(PermissionRequest permissionRequest, String schoolId,
            String userId) {
        log.info("Creating permission with name: {} for schoolId: {}", permissionRequest.getName(), schoolId);
        if (permissionRepository.findByNameAndSchoolId(permissionRequest.getName(), schoolId).isPresent()) {
            throw new DuplicateResourceException(
                    "Permission with name '" + permissionRequest.getName() + "' already exists in school: " + schoolId);
        }

        Permission permission = new Permission();
        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
        permission.setCreatedAt(LocalDateTime.now());
        permission.setUpdatedAt(LocalDateTime.now());
        permission.setCreatedBy(currentUser);
        permission.setSchoolId(schoolId); // Use passed schoolId
        permission.setDescription(permissionRequest.getDescription());
        permission.setSchoolId(permissionRequest.getSchoolId());
        permission.setName(permissionRequest.getName());
        permission.setIsActive(true); // Default to active

        Permission savedPermission = permissionRepository.save(permission);
        log.info("Permission created with ID: {} for schoolId: {}", savedPermission.getPermissionId(), schoolId);
        return ResponseEntity.ok(savedPermission);
    }

    public ResponseEntity<Permission> updatePermission(Long permissionId, PermissionRequest permissionDetails,
            String schoolId, String userId) {
        log.info("Updating permission with ID: {} for schoolId: {}", permissionId, schoolId);
        Permission existingPermission = permissionRepository.findById(permissionId)
                .filter(p -> p.getSchoolId().equals(schoolId) && p.getIsActive())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Permission not found with ID: " + permissionId + " in school: " + schoolId));

        if (!existingPermission.getName().equals(permissionDetails.getName()) &&
                permissionRepository.findByNameAndSchoolId(permissionDetails.getName(), schoolId).isPresent()) {
            throw new DuplicateResourceException(
                    "Permission with name '" + permissionDetails.getName() + "' already exists in school: " + schoolId);
        }

        existingPermission.setName(permissionDetails.getName());
        existingPermission.setDescription(permissionDetails.getDescription());
        existingPermission.setUpdatedAt(LocalDateTime.now());
        existingPermission.setUpdatedBy(userId);

        Permission updatedPermission = permissionRepository.save(existingPermission);
        log.info("Permission updated with ID: {} for schoolId: {}", permissionId, schoolId);
        return ResponseEntity.ok(updatedPermission);
    }

    public ResponseEntity<String> deletePermission(Long permissionId, String schoolId, String userId) {
        log.info("Deleting permission with ID: {} for schoolId: {}", permissionId, schoolId);
        Permission existingPermission = permissionRepository.findById(permissionId)
                .filter(p -> p.getSchoolId().equals(schoolId) && p.getIsActive())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Permission not found with ID: " + permissionId + " in school: " + schoolId));

        existingPermission.setIsActive(false);
        existingPermission.setUpdatedAt(LocalDateTime.now());
        existingPermission.setUpdatedBy(userId);

        permissionRepository.save(existingPermission);
        log.info("Permission with ID: {} marked as inactive for schoolId: {}", permissionId, schoolId);
        return ResponseEntity.ok("Permission deleted successfully.");
    }

    public ResponseEntity<Permission> getPermissionByName(String name, String schoolId) {
        log.debug("Fetching permission with name: {} for schoolId: {}", name, schoolId);
        Permission permission = permissionRepository.findByNameAndSchoolId(name, schoolId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Permission not found with name: " + name + " in school: " + schoolId));
        return ResponseEntity.ok(permission);
    }

    public ResponseEntity<PermissionRoleResponse> getPermissionByRole(Long roleId, String schoolId) {
        log.debug("Fetching permission with role: {} for schoolId: {}", roleId, schoolId);

        List<UserRolePermission> permissions = userRolePermissionRepository.findPermissionsByRoleAndSchool(roleId,
                schoolId);

        // Check if any permissions exist
        if (permissions == null || permissions.isEmpty()) {
            log.debug("No permissions found for role: {} and schoolId: {}", roleId, schoolId);
            return ResponseEntity.notFound().build();
        }

        PermissionRoleResponse permissionResponse = new PermissionRoleResponse();

        // Set role name from the first record (role should be consistent across
        // results)
        permissionResponse.setRoleName(permissions.get(0).getRole().getName());

        // Map all permission names to a List<String>
        List<String> permissionNames = permissions.stream()
                .map(urp -> urp.getPermission().getName())
                .collect(Collectors.toList());
        permissionResponse.setPermissionName(permissionNames);

        return ResponseEntity.ok(permissionResponse);
    }

    public ResponseEntity<PermissionRoleResponse> getPermissionForUser(String userId, String schoolId) {
        log.debug("Fetching permission with User : {} for schoolId: {}", userId, schoolId);

        List<UserRolePermission> permissions = userRolePermissionRepository.findActiveRoleByUser(userId, schoolId);

        PermissionRoleResponse permissionResponse = new PermissionRoleResponse();

        // Set role name from the first record (role should be consistent across
        // results)
        permissionResponse.setRoleName(permissions.get(0).getRole().getName());

        // Map all permission names to a List<String>
        List<String> permissionNames = permissions.stream()
                .map(urp -> urp.getPermission().getName())
                .collect(Collectors.toList());
        permissionResponse.setPermissionName(permissionNames);

        return ResponseEntity.ok(permissionResponse);

    }

    /**
     * Checks if a user has permission for a specific endpoint and HTTP method.
     */
    public boolean checkUserPermission(String userId, String schoolId, String endpoint, String httpMethod) {
        List<UserRolePermission> permissions = userRolePermissionRepository
                .findActivePermissionsByUserIdAndSchoolId(userId, schoolId);

        return permissions.stream()
                .anyMatch(urp -> urp.getPermission().getEndpoint().equals(endpoint) &&
                        urp.getPermission().getHttpMethod().equalsIgnoreCase(httpMethod));
    }

}