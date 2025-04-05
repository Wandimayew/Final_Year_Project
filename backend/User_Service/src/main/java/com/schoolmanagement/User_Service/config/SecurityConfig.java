package com.schoolmanagement.User_Service.config;

import com.schoolmanagement.User_Service.service.PermissionService;
import com.schoolmanagement.User_Service.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableCaching
@EnableScheduling
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtUtil jwtUtil;
        private final PermissionService permissionService;
        private final PermissionCheckFilter permissionCheckFilter;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(csrf -> csrf.disable())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Stateless
                                .authorizeHttpRequests(authz -> authz
                                                .requestMatchers(
                                                                "/swagger-ui/**",
                                                                "/v3/api-docs/**",
                                                                "/v3/api-docs.yaml",
                                                                "/swagger-ui.html",
                                                                "/swagger-ui/index.html",
                                                                "/swagger-resources/**",
                                                                "/favicon.ico",
                                                                "/error")
                                                .permitAll()
                                                .requestMatchers("/auth/api/login", "/auth/api/refresh",
                                                                "/auth/api/forgot-password",
                                                                "/auth/api/reset-password")
                                                .permitAll() // Allow
                                                // login
                                                // and
                                                // refresh
                                                .requestMatchers("/actuator/health").permitAll()
                                                .anyRequest().authenticated())
                                .addFilterBefore(new JwtAuthenticationFilter(jwtUtil, permissionService),
                                                UsernamePasswordAuthenticationFilter.class)
                                .addFilterAfter(permissionCheckFilter, JwtAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
                        throws Exception {
                return authenticationConfiguration.getAuthenticationManager();
        }
}