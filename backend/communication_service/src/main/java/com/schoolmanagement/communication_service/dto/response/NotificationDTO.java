package com.schoolmanagement.communication_service.dto.response;

import com.schoolmanagement.communication_service.enums.NotificationStatus;
import com.schoolmanagement.communication_service.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    private Long notificationId;
    private String schoolId;
    private String recipientId;
    private String message;
    private NotificationStatus status;
    private NotificationType type;
    private LocalDateTime sentAt;
    private boolean isActive;
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    private String updatedBy;
}