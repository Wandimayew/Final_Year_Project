package com.schoolmanagement.communication_service.service;

import com.schoolmanagement.communication_service.config.RabbitMQConfig;
import com.schoolmanagement.communication_service.dto.request.EmailRequest;
import com.schoolmanagement.communication_service.dto.request.NotificationRequest;
import com.schoolmanagement.communication_service.dto.response.ApiResponse;
import com.schoolmanagement.communication_service.dto.response.EmailResponse;
import com.schoolmanagement.communication_service.dto.response.NotificationResponse;
import com.schoolmanagement.communication_service.enums.NotificationStatus;
import com.schoolmanagement.communication_service.enums.NotificationType;
import com.schoolmanagement.communication_service.model.CommunicationPreference;
import com.schoolmanagement.communication_service.model.Notification;
import com.schoolmanagement.communication_service.model.NotificationTemplate;
import com.schoolmanagement.communication_service.model.UserNotificationStatus;
import com.schoolmanagement.communication_service.repository.CommunicationPreferenceRepository;
import com.schoolmanagement.communication_service.repository.NotificationRepository;
import com.schoolmanagement.communication_service.repository.NotificationTemplateRepository;
import com.schoolmanagement.communication_service.repository.UserNotificationStatusRepository;
import com.schoolmanagement.communication_service.utils.ResponsesBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.MessageBuilder;
import org.springframework.amqp.core.MessageProperties;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service class for managing notifications, including creation, retrieval,
 * updating,
 * and retrying failed notifications.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {

        private final NotificationRepository notificationRepository;
        private final UserNotificationStatusRepository userNotificationStatusRepository;
        private final CommunicationPreferenceRepository communicationPreferenceRepository;
        private final RabbitTemplate rabbitTemplate;
        private final EmailService emailService;
        private final NotificationTemplateRepository notificationTemplateRepository;
        private final ResponsesBuilder responsesBuilder; // Injected ResponsesBuilder

        /**
         * Creates a notification that can be for a single recipient or multiple
         * recipients.
         * If recipientIds are provided in the request, it's multi-recipient; otherwise,
         * it's single-recipient.
         *
         * @param schoolId The ID of the school associated with the notification.
         * @param request  The request containing notification details (recipients,
         *                 message, etc.).
         * @return ResponseEntity containing the created NotificationResponse or an
         *         error.
         */
        @Transactional
        public ResponseEntity<ApiResponse<NotificationResponse>> createNotification(String schoolId,
                        NotificationRequest request) {
                log.info("Creating notification for schoolId: {}", schoolId);

                // Check communication preference for the primary recipient (if
                // single-recipient)
                Optional<CommunicationPreference> preferenceOpt = communicationPreferenceRepository
                                .findBySchoolIdAndUserId(schoolId, request.getRecipientId())
                                .filter(CommunicationPreference::getIsActive);
                if (preferenceOpt.isEmpty()
                                && (request.getRecipientIds() == null || request.getRecipientIds().isEmpty())) {
                        log.error("No active communication preference found for recipientId: {} in school: {}",
                                        request.getRecipientId(), schoolId);
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .body(ApiResponse.failure("Recipient communication preference not found"));
                }

                CommunicationPreference preference = preferenceOpt.orElse(null);
                String processedMessage = processNotificationMessage(request.getMessage(), request.getTemplateId(),
                                schoolId, request.getType());

                // Build and save the notification
                Notification notification = Notification.builder()
                                .schoolId(schoolId)
                                .recipientId(request.getRecipientIds() == null || request.getRecipientIds().isEmpty()
                                                ? request.getRecipientId()
                                                : null) // Null for multi-recipient
                                .message(processedMessage)
                                .type(request.getType())
                                .communicationPreference(preference)
                                .isActive(true)
                                .createdAt(LocalDateTime.now())
                                .createdBy("system")
                                .updatedAt(LocalDateTime.now())
                                .updatedBy("system")
                                .build();

                Notification savedNotification = notificationRepository.save(notification);
                NotificationResponse response = responsesBuilder.buildNotificationResponse(savedNotification);

                // Handle recipients (single or multiple)
                List<String> recipientIds = request.getRecipientIds() != null && !request.getRecipientIds().isEmpty()
                                ? request.getRecipientIds()
                                : List.of(request.getRecipientId());

                // Create UserNotificationStatus for each recipient
                for (String recipientId : recipientIds) {
                        UserNotificationStatus userStatus = UserNotificationStatus.builder()
                                        .notification(savedNotification)
                                        .userId(recipientId)
                                        .status(NotificationStatus.PENDING)
                                        .updatedAt(LocalDateTime.now())
                                        .updatedBy("system")
                                        .build();
                        userNotificationStatusRepository.save(userStatus);

                        // Deliver based on preferences (assuming preferences are checked per user)
                        Optional<CommunicationPreference> userPreference = communicationPreferenceRepository
                                        .findBySchoolIdAndUserId(schoolId, recipientId)
                                        .filter(CommunicationPreference::getIsActive);

                        if (userPreference.isPresent()) {
                                CommunicationPreference pref = userPreference.get();
                                if (request.getType() == NotificationType.IN_APP && pref.isInAppEnabled()) {
                                        publishNotification(savedNotification);
                                        log.info("Published IN_APP notification for recipientId: {}", recipientId);
                                }

                                if (pref.isEmailEnabled()) {
                                        EmailRequest emailRequest = EmailRequest.builder()
                                                        .senderId("system")
                                                        .recipientId(recipientId)
                                                        .subject("New Notification")
                                                        .body(processedMessage)
                                                        .templateId(request.getTemplateId())
                                                        .build();

                                        ResponseEntity<ApiResponse<EmailResponse>> emailResponse = emailService
                                                        .composeEmail(schoolId, emailRequest, null, true, "system");

                                        if (emailResponse.getStatusCode() == HttpStatus.OK) {
                                                userStatus.setStatus(NotificationStatus.SENT);
                                                userStatus.setReadAt(LocalDateTime.now());
                                                userNotificationStatusRepository.save(userStatus);
                                                publishEmail(emailRequest, schoolId);
                                        } else {
                                                userStatus.setStatus(NotificationStatus.FAILED);
                                                userNotificationStatusRepository.save(userStatus);
                                                log.error("Failed to send email for recipientId: {}", recipientId);
                                        }
                                }
                        }
                }

                return ResponseEntity.ok(ApiResponse.success("Notification created successfully", response));
        }

        /**
         * Publishes a notification to RabbitMQ for real-time delivery.
         *
         * @param notification The notification to publish.
         */
        private void publishNotification(Notification notification) {
                Message message = MessageBuilder
                                .withBody(new Jackson2JsonMessageConverter()
                                                .toMessage(notification, new MessageProperties()).getBody())
                                .setMessageId("notif-" + notification.getNotificationId() + "-" + System.nanoTime())
                                .build();
                rabbitTemplate.send(RabbitMQConfig.NOTIFICATION_EXCHANGE, "notification.all", message);
                log.info("Published notification to RabbitMQ for notificationId: {}", notification.getNotificationId());
        }

        /**
         * Publishes an email task to RabbitMQ for processing.
         *
         * @param emailRequest The email request details.
         * @param schoolId     The school ID associated with the email.
         */
        private void publishEmail(EmailRequest emailRequest, String schoolId) {
                Map<String, Object> emailTask = Map.of("schoolId", schoolId, "emailRequest", emailRequest);
                rabbitTemplate.convertAndSend(RabbitMQConfig.EMAIL_EXCHANGE, "email." + emailRequest.getRecipientId(),
                                emailTask);
        }

        /**
         * Processes the notification message, applying a template if provided.
         *
         * @param message    The raw message content.
         * @param templateId The ID of the template to apply, if any.
         * @param schoolId   The school ID for template lookup.
         * @param type       The notification type for template validation.
         * @return The processed message with template applied, or the original message.
         */
        private String processNotificationMessage(String message, Long templateId, String schoolId,
                        NotificationType type) {
                if (templateId == null)
                        return message;
                Optional<NotificationTemplate> templateOpt = notificationTemplateRepository
                                .findBySchoolAndTemplateId(schoolId, templateId);
                if (templateOpt.isEmpty() || !templateOpt.get().getType().equals(type))
                        return message;
                return templateOpt.get().getContent().replace("{message}",
                                "<span style='color: black;'>" + message + "</span>");
        }

        /**
         * Fetches all active notifications for a school.
         *
         * @param schoolId The ID of the school to fetch notifications for.
         * @return ResponseEntity containing a list of NotificationResponse objects or
         *         an error.
         */
        public ResponseEntity<ApiResponse<List<NotificationResponse>>> getAllNotifications(String schoolId) {
                List<Notification> notifications = notificationRepository.findBySchoolId(schoolId);
                if (notifications.isEmpty()) {
                        return ResponseEntity.status(HttpStatus.NO_CONTENT)
                                        .body(ApiResponse.failure("No notifications found for the given school"));
                }
                List<NotificationResponse> responseList = notifications.stream()
                                .map(responsesBuilder::buildNotificationResponse) // Use injected instance
                                .collect(Collectors.toList());
                return ResponseEntity.ok(ApiResponse.success("Notifications fetched successfully", responseList));
        }

        /**
         * Fetches a single notification by ID.
         *
         * @param schoolId       The ID of the school associated with the notification.
         * @param notificationId The ID of the notification to fetch.
         * @return ResponseEntity containing the NotificationResponse or an error.
         */
        public ResponseEntity<ApiResponse<NotificationResponse>> getNotificationById(String schoolId,
                        Long notificationId) {
                Notification notification = notificationRepository.findByNotificationId(notificationId, schoolId);
                if (notification == null) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                        .body(ApiResponse.failure("Notification not found or unauthorized"));
                }
                NotificationResponse response = responsesBuilder.buildNotificationResponse(notification);
                return ResponseEntity.ok(ApiResponse.success("Notification fetched successfully", response));
        }

        /**
         * Updates a notification (content only, not status).
         *
         * @param schoolId       The ID of the school associated with the notification.
         * @param notificationId The ID of the notification to update.
         * @param request        The request containing updated notification details.
         * @return ResponseEntity containing the updated NotificationResponse or an
         *         error.
         */
        @Transactional
        public ResponseEntity<ApiResponse<NotificationResponse>> updateNotification(String schoolId,
                        Long notificationId,
                        NotificationRequest request) {
                Notification notification = notificationRepository.findByNotificationId(notificationId, schoolId);
                if (notification == null || !notification.getIsActive()) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                        .body(ApiResponse.failure("Notification not found or unauthorized"));
                }
                notification.setMessage(request.getMessage());
                notification.setType(request.getType());
                notification.setUpdatedAt(LocalDateTime.now());
                notification.setUpdatedBy("admin"); // Replace with authenticated user
                Notification updatedNotification = notificationRepository.save(notification);
                return ResponseEntity.ok(ApiResponse.success("Notification updated successfully",
                                responsesBuilder.buildNotificationResponse(updatedNotification)));
        }

        /**
         * Soft deletes a notification.
         *
         * @param schoolId       The ID of the school associated with the notification.
         * @param notificationId The ID of the notification to delete.
         * @return ResponseEntity indicating success or an error.
         */
        @Transactional
        public ResponseEntity<ApiResponse<NotificationResponse>> deleteNotification(String schoolId,
                        Long notificationId) {
                Notification notification = notificationRepository.findByNotificationId(notificationId, schoolId);
                if (notification == null || !notification.getIsActive()) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                        .body(ApiResponse.failure("Notification not found or unauthorized"));
                }
                notification.setIsActive(false);
                notification.setUpdatedAt(LocalDateTime.now());
                notification.setUpdatedBy("admin");
                notificationRepository.save(notification);
                return ResponseEntity.ok(ApiResponse.success("Notification deleted successfully", null));
        }

        /**
         * Fetches unread notifications for a user.
         *
         * @param schoolId The ID of the school associated with the notifications.
         * @param userId   The ID of the user to fetch unread notifications for.
         * @return ResponseEntity containing a list of unread NotificationResponse
         *         objects or an error.
         */
        public ResponseEntity<ApiResponse<List<NotificationResponse>>> getUnreadNotifications(String schoolId,
                        String userId) {
                List<UserNotificationStatus> statuses = userNotificationStatusRepository
                                .findByUserIdAndStatus(userId, NotificationStatus.SENT);
                if (statuses.isEmpty()) {
                        return ResponseEntity.status(HttpStatus.NO_CONTENT)
                                        .body(ApiResponse.failure("No unread notifications found"));
                }
                List<NotificationResponse> responseList = statuses.stream()
                                .map(status -> responsesBuilder.buildNotificationResponse(status.getNotification()))
                                .collect(Collectors.toList());
                return ResponseEntity
                                .ok(ApiResponse.success("Unread notifications fetched successfully", responseList));
        }

        /**
         * Marks a notification as read for a specific user.
         *
         * @param notificationId The ID of the notification to mark as read.
         * @param userId         The ID of the user marking the notification as read.
         * @return ResponseEntity indicating success or an error.
         */
        @Transactional
        public ResponseEntity<ApiResponse<String>> markNotificationAsRead(Long notificationId, String userId) {
                log.info("Marking notification as read with ID: {} for userId: {}", notificationId, userId);

                UserNotificationStatus userStatus = userNotificationStatusRepository
                                .findByNotificationNotificationIdAndUserId(notificationId, userId)
                                .orElseThrow(() -> new RuntimeException("Notification status not found for user"));

                userStatus.setStatus(NotificationStatus.READ);
                userStatus.setReadAt(LocalDateTime.now());
                userStatus.setUpdatedAt(LocalDateTime.now());
                userStatus.setUpdatedBy("admin"); // Replace with authenticated user
                userNotificationStatusRepository.save(userStatus);

                return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
        }

        /**
         * Retries failed notifications by resetting their status to PENDING.
         *
         * @param schoolId The ID of the school associated with the notifications.
         * @return ResponseEntity containing a list of retried NotificationResponse
         *         objects or an error.
         */
        @Transactional
        public ResponseEntity<ApiResponse<List<NotificationResponse>>> retryFailedNotifications(String schoolId) {
                List<UserNotificationStatus> failedStatuses = userNotificationStatusRepository
                                .findByUserIdAndStatus(null, NotificationStatus.FAILED); // Adjust query if needed
                if (failedStatuses.isEmpty()) {
                        return ResponseEntity.status(HttpStatus.NO_CONTENT)
                                        .body(ApiResponse.failure("No failed notifications to retry"));
                }
                failedStatuses.forEach(status -> {
                        status.setStatus(NotificationStatus.PENDING);
                        userNotificationStatusRepository.save(status);
                        publishNotification(status.getNotification());
                });
                List<NotificationResponse> responseList = failedStatuses.stream()
                                .map(status -> responsesBuilder.buildNotificationResponse(status.getNotification()))
                                .collect(Collectors.toList());
                return ResponseEntity.ok(ApiResponse.success("Retrying failed notifications", responseList));
        }
}