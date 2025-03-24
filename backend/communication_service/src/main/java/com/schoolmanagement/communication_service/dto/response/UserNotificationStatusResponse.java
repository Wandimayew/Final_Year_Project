package com.schoolmanagement.communication_service.dto.response;

import java.time.LocalDateTime;

import com.schoolmanagement.communication_service.enums.NotificationStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserNotificationStatusResponse {
    private String userId;
    private NotificationStatus status;
    private LocalDateTime readAt;
}