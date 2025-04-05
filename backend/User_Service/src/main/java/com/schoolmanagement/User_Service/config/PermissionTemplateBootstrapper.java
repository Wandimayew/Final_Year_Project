package com.schoolmanagement.User_Service.config;

import com.schoolmanagement.User_Service.model.PermissionTemplate;
import com.schoolmanagement.User_Service.repository.PermissionTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class PermissionTemplateBootstrapper implements CommandLineRunner {

    private final PermissionTemplateRepository permissionTemplateRepository;

    @Override
    public void run(String... args) {
        if (permissionTemplateRepository.count() == 0) {
            List<PermissionTemplate> defaults = PermissionTemplateFactory.createDefaultTemplates();
            permissionTemplateRepository.saveAll(defaults);
        }
    }
}