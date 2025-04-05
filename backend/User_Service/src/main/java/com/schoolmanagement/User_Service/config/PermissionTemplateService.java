package com.schoolmanagement.User_Service.config;

import com.schoolmanagement.User_Service.model.PermissionTemplate;
import com.schoolmanagement.User_Service.repository.PermissionTemplateRepository;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PermissionTemplateService {
    private final PermissionTemplateRepository permissionTemplateRepository;

    @Cacheable("permissionTemplates")
    public List<PermissionTemplate> getAllTemplates() {
        return permissionTemplateRepository.findAll();
    }

    @CacheEvict(value = "permissionTemplates", allEntries = true)
    public void refreshTemplates() {
        // No-op; triggers cache eviction
    }
}