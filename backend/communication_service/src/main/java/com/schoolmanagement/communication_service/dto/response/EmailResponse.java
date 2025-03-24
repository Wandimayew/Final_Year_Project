package com.schoolmanagement.communication_service.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class EmailResponse {

    private String emailId;
    private String schoolId;
    private String senderId;
    private String recipientId;
    private String subject;
    private String body;
    private String senderStatus; // Updated to reflect sender-specific status
    private String recipientStatus; // Updated to reflect recipient-specific status
    private Boolean senderDeleted; // New field for sender deletion status
    private Boolean recipientDeleted; // New field for recipient deletion status
    private LocalDateTime sentAt;
    private Boolean isRead;
    private Boolean isDraft;
    private Boolean isActive;
    private List<AttachmentResponse> attachments;
    private String announcementId;
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    private String updatedBy;
}