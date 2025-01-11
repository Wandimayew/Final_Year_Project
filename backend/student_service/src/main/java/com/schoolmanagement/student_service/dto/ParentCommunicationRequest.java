package com.schoolmanagement.student_service.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ParentCommunicationRequest {

    @NotNull(message = "School ID cannot be null")
    private Long schoolId;

    @NotNull(message = "Sent date and time cannot be null")
    @PastOrPresent(message = "Sent date and time must be in the past or present")
    private LocalDateTime sentAt;

    @NotBlank(message = "Message cannot be blank")
    @Size(max = 1000, message = "Message cannot exceed 1000 characters")
    private String message;

    @NotNull(message = "Parent ID cannot be null")
    private Long parentId;
}