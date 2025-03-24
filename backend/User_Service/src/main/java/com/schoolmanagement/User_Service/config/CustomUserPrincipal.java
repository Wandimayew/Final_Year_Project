package com.schoolmanagement.User_Service.config;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;

public class CustomUserPrincipal implements UserDetails {
    private final String username;
    private final String password; // Nullable for JWT-based auth
    private final String userId;
    private final String schoolId;
    private final Set<String> permissions;

    // Constructor for UserService (password-based auth)
    public CustomUserPrincipal(String username, String password, String userId, String schoolId,
            Set<String> permissions) {
        this.username = username;
        this.password = password;
        this.userId = userId;
        this.schoolId = schoolId;
        this.permissions = permissions;
    }

    // Constructor for JwtAuthenticationFilter (JWT-based auth, no password needed)
    public CustomUserPrincipal(String username, String userId, String schoolId, Set<String> permissions) {
        this(username, null, userId, schoolId, permissions); // Password is null for JWT
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return permissions.stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
    }

    @Override
    public String getPassword() {
        return password; // May be null for JWT auth
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true; // Assuming isActive is checked earlier in UserService
    }

    public String getUserId() {
        return userId;
    }

    public String getSchoolId() {
        return schoolId;
    }

    public Set<String> getPermissions() {
        return permissions;
    }
}