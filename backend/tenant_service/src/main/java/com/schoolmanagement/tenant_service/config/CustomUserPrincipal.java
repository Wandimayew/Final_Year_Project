package com.schoolmanagement.tenant_service.config;

import java.util.Set;

public class CustomUserPrincipal {
    private final String username;
    private final String userId;
    private final String schoolId;
    private final Set<String> permissions;

    public CustomUserPrincipal(String username, String userId, String schoolId, Set<String> permissions) {
        this.username = username;
        this.userId = userId;
        this.schoolId = schoolId;
        this.permissions = permissions;
    }

    public String getUsername() {
        return username;
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