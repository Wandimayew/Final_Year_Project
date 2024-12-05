package com.schoolmanagement.User_Service.service;

import com.schoolmanagement.User_Service.dto.RoleRequest;
import com.schoolmanagement.User_Service.exception.DuplicateResourceException;
import com.schoolmanagement.User_Service.model.Permission;
import com.schoolmanagement.User_Service.model.Role;
import com.schoolmanagement.User_Service.repository.PermissionRepository;
import com.schoolmanagement.User_Service.repository.RoleRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    public ResponseEntity<Role> getRoleById(Long roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new EntityNotFoundException("Role not found with id " + roleId));
        return ResponseEntity.ok(role);
    }

    public ResponseEntity<List<Role>> getAllRoles() {
        List<Role> roles = roleRepository.findAll();
        return ResponseEntity.ok(roles);
    }

    public ResponseEntity<Role> createRole(RoleRequest roleRequest) {
        Optional<Role> existingRole = roleRepository.findBySchoolIdAndName(roleRequest.getSchoolId(), roleRequest.getName());
        if (existingRole.isPresent()) {
            throw new DuplicateResourceException("Role with name '" + roleRequest.getName() + "' already exists.");
        }
        Permission permission=permissionRepository.findById(roleRequest.getPermissions()).orElseThrow(null);

        if (permission ==null) {
            log.info("Permission not registered");
            
        }
        Set<Permission> setPermissions=new HashSet<>();
        setPermissions.add(permission);
        log.info("saving a one role");
        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
        Role role=new Role();
        role.setCreatedAt(LocalDateTime.now());
        role.setUpdatedAt(LocalDateTime.now());
        role.setCreatedBy(currentUser);
        role.setDescription(roleRequest.getDescription());
        role.setName(roleRequest.getName());
        role.setSchoolId(roleRequest.getSchoolId());
        role.setPermissions(setPermissions);
        log.info("saving a role");
        Role savedRole = roleRepository.save(role);
        return ResponseEntity.ok(savedRole);
    }

    public ResponseEntity<Role> updateRole(Long roleId, Role roleDetails) {
        Role existingRole = roleRepository.findById(roleId)
                .orElseThrow(() -> new EntityNotFoundException("Role not found with id " + roleId));

        existingRole.setName(roleDetails.getName());
        existingRole.setDescription(roleDetails.getDescription());
        existingRole.setUpdatedAt(LocalDateTime.now());
        existingRole.setCreatedBy(roleDetails.getCreatedBy());

        Role updatedRole = roleRepository.save(existingRole);
        return ResponseEntity.ok(updatedRole);
    }

    public ResponseEntity<String> deleteRole(Long roleId) {
        Role existingRole = roleRepository.findById(roleId)
                .orElseThrow(() -> new EntityNotFoundException("Role not found with id " + roleId));

        roleRepository.delete(existingRole);
        return ResponseEntity.ok("Role deleted successfully.");
    }

    public ResponseEntity<Role> addPermissionToRole(Long roleId, Long permissionId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new EntityNotFoundException("Role not found with id " + roleId));

        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new EntityNotFoundException("Permission not found with id " + permissionId));

        role.getPermissions().add(permission);
        roleRepository.save(role);

        return ResponseEntity.ok(role);
    }

    public ResponseEntity<Role> removePermissionFromRole(Long roleId, Long permissionId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new EntityNotFoundException("Role not found with id " + roleId));

        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new EntityNotFoundException("Permission not found with id " + permissionId));

        role.getPermissions().remove(permission);
        roleRepository.save(role);

        return ResponseEntity.ok(role);
    }
}
