package com.schoolmanagement.User_Service.config;

import com.schoolmanagement.User_Service.model.PermissionTemplate;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class PermissionCheckFilter extends OncePerRequestFilter {

    private final PermissionTemplateService permissionTemplateService;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String requestPath = request.getRequestURI();
        String httpMethod = request.getMethod();

        log.debug("Checking permissions for {} {}", httpMethod, requestPath);

        if (isPublicEndpoint(requestPath)) {
            chain.doFilter(request, response);
            return;
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserPrincipal)) {
            log.warn("No valid CustomUserPrincipal found for {} {}", httpMethod, requestPath);
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Authentication required");
            return;
        }

        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
        Set<String> userPermissions = principal.getPermissions();

        log.info("User Permissions for accessing : {}", userPermissions);

        List<PermissionTemplate> templates = permissionTemplateService.getAllTemplates();
        log.info("templates for permissionTemplate : {}", templates);
        PermissionTemplate matchingTemplate = null;
        for (PermissionTemplate template : templates) {
            log.info("templates in for loop for matching : {}", template);
            if (pathMatcher.match(template.getEndpoint(), requestPath)
                    && template.getHttpMethod().equalsIgnoreCase(httpMethod)) {
                matchingTemplate = template;
                break;
            }
        }

        log.info("permission matching : {}", matchingTemplate);
        if (matchingTemplate != null) {
            String requiredPermission = matchingTemplate.getName();

            log.info("required permission : {}", requiredPermission);
            if (!userPermissions.contains(requiredPermission)) {
                log.warn("User {} lacks permission {} for {} {}", principal.getUserId(), requiredPermission, httpMethod,
                        requestPath);
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Insufficient permissions: " + requiredPermission);
                return;
            }
        } else {
            log.warn("No permission template found for {} {}", httpMethod, requestPath);
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "No permission template found for this endpoint");
            return;
        }

        chain.doFilter(request, response);
    }

    private boolean isPublicEndpoint(String path) {
        String[] publicPaths = { "/swagger-ui/**", "/v3/api-docs/**", "/auth/api/login" };
        log.info("Path to be accessed is {}", path);
        for (String publicPath : publicPaths) {
            if (pathMatcher.match(publicPath, path)) {
                return true;
            }
        }
        return false;
    }
}