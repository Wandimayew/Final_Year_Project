package com.schoolmanagement.communication_service.dto.response;

import java.time.LocalDateTime;

import com.schoolmanagement.communication_service.enums.AnnouncementStatus;
import com.schoolmanagement.communication_service.enums.AnnouncementType;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AnnouncementResponse {

    private Long announcementId;

    private String schoolId;

    private String title;

    private String message;

    private String targetAudience;

    private AnnouncementType type;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private AnnouncementStatus status;

    private String authorId;

    private boolean isActive;

    private LocalDateTime createdAt;
    private String createdBy;

    private LocalDateTime updatedAt;
    private String updatedBy;
}
