package com.schoolmanagement.User_Service.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PendingPasswordResetResponse {
    private Long tokenId;
    private String userId;
    private String username;
    private String email;
    private LocalDateTime createdAt;
}