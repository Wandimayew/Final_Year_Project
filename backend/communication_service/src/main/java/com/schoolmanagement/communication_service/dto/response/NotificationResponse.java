package com.schoolmanagement.communication_service.dto.response;

import com.schoolmanagement.communication_service.enums.NotificationStatus;
import com.schoolmanagement.communication_service.enums.NotificationType;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class NotificationResponse {

    private Long notificationId;
    private String schoolId;
    private String recipientId; // For single-recipient notifications
    private List<String> recipientIds; // For multi-recipient notifications
    private String message;
    private NotificationStatus status;
    private NotificationType type;
    private LocalDateTime sentAt;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    private String updatedBy;

    // Optional fields for relationships
    private Long announcementId; // Reference to Announcement
    private Long templateId; // Reference to NotificationTemplate
    private List<UserNotificationStatusResponse> userStatuses; // Per-user status details

}
