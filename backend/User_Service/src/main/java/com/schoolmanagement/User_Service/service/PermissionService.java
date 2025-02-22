package com.schoolmanagement.User_Service.service;

import com.schoolmanagement.User_Service.dto.PermissionRequest;
import com.schoolmanagement.User_Service.exception.DuplicateResourceException;
import com.schoolmanagement.User_Service.model.Permission;
import com.schoolmanagement.User_Service.repository.PermissionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PermissionService {

    private final PermissionRepository permissionRepository;

    public ResponseEntity<Permission> getPermissionById(Long permissionId) {
        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new EntityNotFoundException("Permission not found with id " + permissionId));
        return ResponseEntity.ok(permission);
    }

    public ResponseEntity<List<Permission>> getAllPermissions() {
        List<Permission> permissions = permissionRepository.findAll();
        return ResponseEntity.ok(permissions);
    }

    public ResponseEntity<Permission> createPermission(PermissionRequest permissionRequest) {
        log.info("we are creating permission  ");
        if (permissionRepository.findByName(permissionRequest.getName()).isPresent()) {
            throw new DuplicateResourceException("Permission with name " + permissionRequest.getName() + " already exists");
        }
        Permission permission=new Permission();
        log.info("we are to permisson  ");
        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
        permission.setCreatedAt(LocalDateTime.now());
        permission.setUpdatedAt(LocalDateTime.now());
        permission.setCreatedBy(currentUser);
        permission.setSchoolId(permissionRequest.getSchoolId());
        permission.setDescription(permissionRequest.getDescription());
        permission.setName(permissionRequest.getName());
        Permission savedPermission = permissionRepository.save(permission);
        log.info("we are at permission  ");
        return ResponseEntity.ok(savedPermission);
    }

    public ResponseEntity<Permission> updatePermission(Long permissionId, Permission permissionDetails) {
        Permission existingPermission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new EntityNotFoundException("Permission not found with id " + permissionId));

        existingPermission.setName(permissionDetails.getName());
        existingPermission.setDescription(permissionDetails.getDescription());
        existingPermission.setUpdatedAt(LocalDateTime.now());
        existingPermission.setCreatedBy(permissionDetails.getCreatedBy());

        Permission updatedPermission = permissionRepository.save(existingPermission);
        return ResponseEntity.ok(updatedPermission);
    }

    public ResponseEntity<String> deletePermission(Long permissionId) {
        Permission existingPermission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new EntityNotFoundException("Permission not found with id " + permissionId));

        permissionRepository.delete(existingPermission);
        return ResponseEntity.ok("Permission deleted successfully.");
    }
    public ResponseEntity<Permission> getPermissionByName(String name) {
        Permission permission = permissionRepository.findByName(name)
                .orElseThrow(() -> new EntityNotFoundException("Permission not found with name " + name));
        return ResponseEntity.ok(permission);
    }
}
