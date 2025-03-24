package com.schoolmanagement.communication_service.dto.response;

import java.time.LocalDateTime;

import com.schoolmanagement.communication_service.enums.NotificationType;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NotificationTemplateResponse {

    private Long notificationTemplateId;

    private String schoolId;

    private NotificationType type;

    private String name;

    private String content;

    private LocalDateTime createdAt;
    private String createdBy;

    private LocalDateTime updatedAt;
    private String updatedBy;

    private boolean isActive;
}
