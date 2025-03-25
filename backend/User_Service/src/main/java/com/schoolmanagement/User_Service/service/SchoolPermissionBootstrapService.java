package com.schoolmanagement.User_Service.service;

import com.schoolmanagement.User_Service.model.Permission;
import com.schoolmanagement.User_Service.model.PermissionTemplate;
import com.schoolmanagement.User_Service.repository.PermissionRepository;
import com.schoolmanagement.User_Service.repository.PermissionTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SchoolPermissionBootstrapService {

    private final PermissionTemplateRepository templateRepository;
    private final PermissionRepository permissionRepository;

    public void bootstrapPermissions(String schoolId) {
        log.info("Bootstrapping permissions for schoolId: {}", schoolId);
        List<PermissionTemplate> templates = templateRepository.findByIsActiveTrue();

        List<Permission> existingPermissions = permissionRepository.findBySchoolId(schoolId);
        List<String> existingPermissionNames = existingPermissions.stream()
                .map(Permission::getName)
                .collect(Collectors.toList());

        List<Permission> permissionsToSave = templates.stream()
                .filter(template -> !existingPermissionNames.contains(template.getName()))
                .map(template -> {
                    Permission permission = new Permission();
                    permission.setSchoolId(schoolId);
                    permission.setName(template.getName());
                    permission.setDescription(template.getDescription());
                    permission.setEndpoint(template.getEndpoint());
                    permission.setHttpMethod(template.getHttpMethod());
                    permission.setIs_active(true);
                    permission.setCreatedBy("system");
                    permission.setCreatedAt(LocalDateTime.now());
                    permission.setUpdatedAt(LocalDateTime.now());
                    return permission;
                })
                .collect(Collectors.toList());

        if (!permissionsToSave.isEmpty()) {
            permissionRepository.saveAll(permissionsToSave);
            log.info("Bootstrapped {} permissions for schoolId: {}", permissionsToSave.size(), schoolId);
        } else {
            log.info("No new permissions to bootstrap for schoolId: {}", schoolId);
        }
    }
}