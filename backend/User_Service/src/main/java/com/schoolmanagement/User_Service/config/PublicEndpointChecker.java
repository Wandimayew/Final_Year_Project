package com.schoolmanagement.User_Service.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;

import java.util.List;

@Component
@RequiredArgsConstructor
public class PublicEndpointChecker {

    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Value("${security.public-endpoints:/swagger-ui/**,/v3/api-docs/**,/auth/api/login,/auth/api/refresh,/auth/api/forgot-password,/auth/api/reset-password}")
    private List<String> publicEndpoints;

    public boolean isPublicEndpoint(String path) {
        return publicEndpoints.stream()
                .anyMatch(publicPath -> pathMatcher.match(publicPath, path));
    }
}