package com.schoolmanagement.communication_service.dto.request;


import com.schoolmanagement.communication_service.enums.NotificationType;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;


@Data
public class NotificationTemplateRequest {
    
    @NotBlank(message = "School ID cannot be blank")
    private String schoolId;

    @NotNull(message = "Type cannot be null")
    @Enumerated(EnumType.STRING)
    private NotificationType type;

    @NotBlank(message = "Name cannot be empty")
    @Size(max = 100, message = "Name cannot exceed 100 characters")
    private String name;

    @NotBlank(message = "Content cannot be empty")
    private String content;
}
