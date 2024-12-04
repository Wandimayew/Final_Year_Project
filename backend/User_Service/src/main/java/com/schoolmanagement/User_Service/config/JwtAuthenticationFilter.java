package com.schoolmanagement.User_Service.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

@WebFilter(filterName = "JwtAuthenticationFilter", urlPatterns = "/api/**")
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;

    public JwtAuthenticationFilter(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Get the JWT from the Authorization header
        String jwt = extractJwtFromRequest(request);
        if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
            // Authenticate user if the token is valid
            String username = jwtUtils.getUserNameFromJwtToken(jwt);
            var authentication = new UsernamePasswordAuthenticationToken(username, null, List.of());
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        // Proceed with the next filter in the chain
        filterChain.doFilter(request, response);
    }

    // Extract JWT token from the request's Authorization header
    private String extractJwtFromRequest(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7); // Get the token after "Bearer "
        }
        return null;
    }
}
