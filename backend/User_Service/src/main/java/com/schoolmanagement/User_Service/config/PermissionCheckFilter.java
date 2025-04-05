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
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;


@Component
@RequiredArgsConstructor
@Slf4j
public class PermissionCheckFilter extends OncePerRequestFilter {

    private final PermissionTemplateService permissionTemplateService;
    private final PublicEndpointChecker publicEndpointChecker;
    private final PermissionMatcher permissionMatcher;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String requestPath = request.getRequestURI();
        String httpMethod = request.getMethod();

        log.debug("Checking permissions for {} {}", httpMethod, requestPath);

        // Check if the endpoint is public
        if (publicEndpointChecker.isPublicEndpoint(requestPath)) {
            log.debug("Public endpoint detected: {} {}", httpMethod, requestPath);
            chain.doFilter(request, response);
            return;
        }

        // Authenticate and extract user principal
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserPrincipal)) {
            log.warn("No valid CustomUserPrincipal found for {} {}", httpMethod, requestPath);
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Authentication required");
            return;
        }

        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
        Set<String> userPermissions = principal.getPermissions();

        log.info("User {} permissions: {}", principal.getUserId(), userPermissions);

        // Match permission and validate
        PermissionTemplate matchingTemplate = permissionMatcher.findMatchingTemplate(requestPath, httpMethod);
        if (matchingTemplate == null) {
            log.warn("No permission template found for {} {}", httpMethod, requestPath);
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "No permission template found for this endpoint");
            return;
        }

        String requiredPermission = matchingTemplate.getName();
        if (!userPermissions.contains(requiredPermission)) {
            log.warn("User {} lacks permission {} for {} {}", principal.getUserId(), requiredPermission, httpMethod,
                    requestPath);
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Insufficient permissions: " + requiredPermission);
            return;
        }

        log.debug("Permission granted for {} {} with permission {}", httpMethod, requestPath, requiredPermission);
        chain.doFilter(request, response);
    }
}