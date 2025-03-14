package com.schoolmanagement.communication_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailRequest {

    @NotBlank(message = "Sender ID cannot be blank")
    private String senderId;

    @NotBlank(message = "Recipient ID cannot be blank")
    private String recipientId;

    @NotBlank(message = "Subject cannot be blank")
    private String subject;

    @NotBlank(message = "Body cannot be blank")
    private String body;

    // Optional template ID
    private Long templateId; // Nullable, allows skipping template

    // Explicit constructor for four arguments (without templateId)
    public EmailRequest(String senderId, String recipientId, String subject, String body) {
        this.senderId = senderId;
        this.recipientId = recipientId;
        this.subject = subject;
        this.body = body;
        this.templateId = null; // Default to null if not provided
    }
}