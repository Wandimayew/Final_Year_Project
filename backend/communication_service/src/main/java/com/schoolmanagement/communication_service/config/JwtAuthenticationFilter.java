package com.schoolmanagement.communication_service.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.schoolmanagement.communication_service.utils.JwtUtil;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            if (jwtUtil.validateToken(token)) {
                String username = jwtUtil.getUserNameFromJwtToken(token);
                String userId = jwtUtil.extractUserId(token);
                String schoolId = jwtUtil.extractSchoolId(token);

                // Create CustomUserPrincipal without permissions (permissions checked by
                // UserService)
                CustomUserPrincipal principal = new CustomUserPrincipal(username, userId, schoolId,
                        Collections.emptySet());

                // Set authentication in SecurityContextHolder without authorities (no local
                // permissions)
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        principal, null, Collections.emptyList());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            } else {
                log.warn("JWT token validation failed for token: {}", token);
            }
        } else {
            log.debug("No Bearer token found in request header"); // Changed 'logger' to 'log'
        }

        chain.doFilter(request, response);
    }
}