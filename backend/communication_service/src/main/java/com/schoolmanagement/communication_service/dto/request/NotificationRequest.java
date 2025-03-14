package com.schoolmanagement.communication_service.dto.request;

import java.time.LocalDateTime;
import java.util.List;

import com.schoolmanagement.communication_service.enums.NotificationStatus;
import com.schoolmanagement.communication_service.enums.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NotificationRequest {

    private String schoolId;

    private String recipientId; // For single-recipient
    private List<String> recipientIds; // For multi-recipient

    @NotBlank(message = "Message cannot be empty")
    @Size(max = 2000, message = "Message cannot exceed 2000 characters")
    private String message;

    @NotNull(message = "Status cannot be null")
    private NotificationStatus status;

    @NotNull(message = "Type cannot be null")
    private NotificationType type;

    private LocalDateTime sentAt;

    // Optional fields for relationships
    private Long announcementId; // Link to Announcement
    private Long templateId; // Link to NotificationTemplate
}