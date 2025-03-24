package com.schoolmanagement.communication_service.dto.request;

import java.time.LocalDateTime;

import com.schoolmanagement.communication_service.enums.AnnouncementStatus;
import com.schoolmanagement.communication_service.enums.AnnouncementType;
import com.schoolmanagement.communication_service.enums.NotificationType;
import com.schoolmanagement.communication_service.enums.TargetAudience;

import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Lob;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AnnouncementRequest {

    @NotBlank(message = "Title cannot be empty")
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    private String title;

    private String message;

    @NotNull(message = "Target audience cannot be null")
    private String targetAudience;

    @NotNull(message = "Type cannot be null")
    @Enumerated(EnumType.STRING)
    private AnnouncementType type;

    @NotNull(message = "Start date cannot be null")
    @Future(message = "Start date must be in the future")
    private LocalDateTime startDate;

    @NotNull(message = "End date cannot be null")
    @Future(message = "End date must be in the future")
    private LocalDateTime endDate;

    @NotNull(message = "Status cannot be null")
    @Enumerated(EnumType.STRING)
    private AnnouncementStatus status;

    @NotBlank(message = "Author ID cannot be blank")
    private String authorId;

    @NotNull(message = "Notification Template Id cannot be null")
    private Long templateId;
}
