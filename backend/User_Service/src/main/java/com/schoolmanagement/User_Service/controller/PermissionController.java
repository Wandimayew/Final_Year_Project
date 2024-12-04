package com.schoolmanagement.User_Service.controller;

import com.schoolmanagement.User_Service.dto.PermissionRequest;
import com.schoolmanagement.User_Service.model.Permission;
import com.schoolmanagement.User_Service.service.PermissionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
@Slf4j
public class PermissionController {

    private final PermissionService permissionService;

    // Get permission by ID
    @GetMapping("/{permissionId}")
    public ResponseEntity<Permission> getPermissionById(@PathVariable Long permissionId) {
        return permissionService.getPermissionById(permissionId);
    }

    // Get all permissions
    @GetMapping
    public ResponseEntity<List<Permission>> getAllPermissions() {
        return permissionService.getAllPermissions();
    }

    // Create a new permission
    @PostMapping
    public ResponseEntity<Permission> createPermission(@Valid @RequestBody PermissionRequest permissionRequest) {
        log.info("we are creating permisson  controller");
        return permissionService.createPermission(permissionRequest);
    }

    // Update permission by ID
    @PutMapping("/{permissionId}")
    public ResponseEntity<Permission> updatePermission(@PathVariable Long permissionId,
                                                       @Valid @RequestBody Permission permissionDetails) {
        return permissionService.updatePermission(permissionId, permissionDetails);
    }

    // Delete permission by ID
    @DeleteMapping("/{permissionId}")
    public ResponseEntity<String> deletePermission(@PathVariable Long permissionId) {
        return permissionService.deletePermission(permissionId);
    }

    // Get permission by name
    @GetMapping("/name/{name}")
    public ResponseEntity<Permission> getPermissionByName(@PathVariable String name) {
        return permissionService.getPermissionByName(name);
    }
}
