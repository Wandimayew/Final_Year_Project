package com.schoolmanagement.User_Service.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class RefreshToken {
    @Id
    private String token; // Unique refresh token
    private String userId; // Associated user
    private String schoolId; // Associated school
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt; // Refresh token expiry
    private boolean isActive; // For invalidation on logout
}