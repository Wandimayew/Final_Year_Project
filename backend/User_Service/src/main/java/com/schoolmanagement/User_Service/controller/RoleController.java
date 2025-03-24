package com.schoolmanagement.User_Service.controller;

import com.schoolmanagement.User_Service.dto.RoleRequest;
import com.schoolmanagement.User_Service.model.Role;
import com.schoolmanagement.User_Service.service.RoleService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/auth/api/roles")
@RequiredArgsConstructor
@Slf4j
public class RoleController {

    private final RoleService roleService;

    // Get role by ID
    @GetMapping("/{roleId}")
    public ResponseEntity<Role> getRoleById(@PathVariable Long roleId) {
        return roleService.getRoleById(roleId);
    }

    // Get all roles
    @GetMapping
    public ResponseEntity<List<Role>> getAllRoles() {
        return roleService.getAllRoles();
    }

    // Create a new role
    @PostMapping
    public ResponseEntity<Role> createRole(@Valid @RequestBody RoleRequest role) {
        log.info("we are creating role  controller");
        return roleService.createRole(role);
    }

    // Update role by ID
    @PutMapping("/{roleId}")
    public ResponseEntity<Role> updateRole(@PathVariable Long roleId, @Valid @RequestBody Role roleDetails) {
        return roleService.updateRole(roleId, roleDetails);
    }

    // Delete role by ID
    @DeleteMapping("/{roleId}")
    public ResponseEntity<String> deleteRole(@PathVariable Long roleId) {
        return roleService.deleteRole(roleId);
    }

    // Add permission to role
    @PostMapping("/{roleId}/permissions/{permissionId}")
    public ResponseEntity<Role> addPermissionToRole(@PathVariable Long roleId, @PathVariable Long permissionId) {
        return roleService.addPermissionToRole(roleId, permissionId);
    }

    // Remove permission from role
    @DeleteMapping("/{roleId}/permissions/{permissionId}")
    public ResponseEntity<Role> removePermissionFromRole(@PathVariable Long roleId, @PathVariable Long permissionId) {
        return roleService.removePermissionFromRole(roleId, permissionId);
    }
}
