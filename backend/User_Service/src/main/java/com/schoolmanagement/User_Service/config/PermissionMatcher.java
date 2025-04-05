package com.schoolmanagement.User_Service.config;

import com.schoolmanagement.User_Service.model.PermissionTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;

import java.util.Comparator;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class PermissionMatcher {
    private final PermissionTemplateService permissionTemplateService;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    public PermissionTemplate findMatchingTemplate(String requestPath, String httpMethod) {
        List<PermissionTemplate> templates = permissionTemplateService.getAllTemplates();
        log.debug("Evaluating {} templates for path {} and method {}", templates.size(), requestPath, httpMethod);

        return templates.stream()
                .filter(template -> pathMatcher.match(template.getEndpoint(), requestPath)
                        && template.getHttpMethod().equalsIgnoreCase(httpMethod))
                .peek(template -> log.debug("Matched template: endpoint={}, name={}", template.getEndpoint(),
                        template.getName()))
                .sorted(Comparator.<PermissionTemplate>comparingInt(t -> countWildcards(t.getEndpoint()))
                        .thenComparingInt(t -> t.getEndpoint().length()).reversed())
                .findFirst()
                .orElse(null);
    }

    private int countWildcards(String endpoint) {
        return (int) endpoint.chars().filter(ch -> ch == '*').count();
    }
}