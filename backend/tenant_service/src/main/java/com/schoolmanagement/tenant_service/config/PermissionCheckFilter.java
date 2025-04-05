package com.schoolmanagement.tenant_service.config;

import com.schoolmanagement.tenant_service.client.UserServiceClient;
import com.schoolmanagement.tenant_service.dto.PermissionCheckRequest;
import com.schoolmanagement.tenant_service.dto.PermissionCheckResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class PermissionCheckFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(PermissionCheckFilter.class);
    private final UserServiceClient userServiceClient;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String authorizationHeader = request.getHeader("Authorization");
        String requestPath = request.getRequestURI();
        String httpMethod = request.getMethod();

        if (isPublicEndpoint(requestPath)) {
            chain.doFilter(request, response);
            return;
        }

        CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        String userId = principal.getUserId();
        String schoolId = principal.getSchoolId();
        // String schoolId = determineSchoolId(requestPath, httpMethod);
        log.info("school id is {}", schoolId);
        log.info("user id is {}", userId);

        PermissionCheckRequest permissionRequest = PermissionCheckRequest.builder()
                .userId(userId)
                .schoolId(schoolId)
                .endpoint(requestPath)
                .httpMethod(httpMethod)
                .build();

        try {
            PermissionCheckResponse permissionResponse = userServiceClient.checkUserPermission(
                    permissionRequest, authorizationHeader);
            if (!permissionResponse.isHasPermission()) {
                log.warn("User {} lacks permission for {} {}", userId, httpMethod, requestPath);
                response.setStatus(HttpStatus.FORBIDDEN.value());
                response.getWriter().write("{\"message\": \"Insufficient permissions\"}");
                response.setContentType("application/json");
                return;
            }
        } catch (Exception e) {
            log.error("Failed to validate permissions with UserService: {}", e.getMessage());
            response.setStatus(HttpStatus.SERVICE_UNAVAILABLE.value());
            response.getWriter().write("{\"message\": \"Unable to validate permissions due to service error\"}");
            response.setContentType("application/json");
            return;
        }

        chain.doFilter(request, response);
    }

    private boolean isPublicEndpoint(String path) {
        String[] publicPaths = { "/swagger-ui/**", "/v3/api-docs/**" };
        log.info("Path to be accessed is {}", path);
        for (String publicPath : publicPaths) {
            if (pathMatcher.match(publicPath, path)) {
                return true;
            }
        }
        return false;
    }

    private String determineSchoolId(String requestPath, String httpMethod) {
        String[] parts = requestPath.split("/");
        return parts.length > 4 ? parts[4] : null;
    }
}