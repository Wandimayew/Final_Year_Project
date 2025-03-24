package com.schoolmanagement.communication_service.service;

import com.schoolmanagement.communication_service.config.RabbitMQConfig;
import com.schoolmanagement.communication_service.dto.request.EmailRequest;
import com.schoolmanagement.communication_service.dto.response.ApiResponse;
import com.schoolmanagement.communication_service.dto.response.EmailResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/**
 * Service class for consuming email messages from RabbitMQ and broadcasting via
 * WebSocket.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class MessageConsumerService {

    private final EmailService emailService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Consumes email tasks from the email queue and sends emails.
     * Broadcasts success to WebSocket for the recipient.
     */
    @RabbitListener(queues = RabbitMQConfig.EMAIL_QUEUE)
    @Transactional
    public void consumeEmail(Map<String, Object> emailTask) {
        String schoolId = (String) emailTask.get("schoolId");
        EmailRequest emailRequest = (EmailRequest) emailTask.get("emailRequest");
        log.info("Consumed email task from queue for recipientId: {}", emailRequest.getRecipientId());

        ResponseEntity<ApiResponse<EmailResponse>> response = emailService.composeEmail(
                schoolId, emailRequest, null, true, "system");

        if (response.getStatusCode() == HttpStatus.OK) {
            log.info("Email sent successfully for recipientId: {}", emailRequest.getRecipientId());
            messagingTemplate.convertAndSendToUser(
                    emailRequest.getRecipientId(),
                    "/topic/emails",
                    Map.of("message", "New email received", "recipientId", emailRequest.getRecipientId()));
        } else {
            log.error("Failed to send email for recipientId: {}, status: {}",
                    emailRequest.getRecipientId(), response.getStatusCode());
        }
    }
}