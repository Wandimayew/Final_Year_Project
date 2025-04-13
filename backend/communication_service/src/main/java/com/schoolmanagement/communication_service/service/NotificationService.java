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
        private final ResponsesBuilder responsesBuilder;
        private final Jackson2JsonMessageConverter messageConverter;

        @Transactional
        public ResponseEntity<ApiResponse<NotificationResponse>> createNotification(String schoolId,
                        NotificationRequest request) {
                log.info("Creating notification for schoolId: {}", schoolId);

                // Validate communication preferences
                Optional<CommunicationPreference> preferenceOpt = communicationPreferenceRepository
                                .findBySchoolIdAndUserId(schoolId, request.getRecipientId())
                                .filter(CommunicationPreference::getIsActive);
                if (preferenceOpt.isEmpty() && (request.getRecipientIds() == null || request.getRecipientIds().isEmpty())) {
                        log.error("No active communication preference found for recipientId: {} in school: {}",
                                        request.getRecipientId(), schoolId);
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .body(ApiResponse.failure("Recipient communication preference not found"));
                }

                CommunicationPreference preference = preferenceOpt.orElse(null);
                log.info("User preferences is : {} :  ::::::: ", preference);
                String processedMessage = processNotificationMessage(request.getMessage(), request.getTemplateId(),
                                schoolId, request.getType());

                // Build and save the notification
                Notification notification = Notification.builder()
                                .schoolId(schoolId)
                                .recipientId(request.getRecipientIds() == null || request.getRecipientIds().isEmpty()
                                                ? request.getRecipientId()
                                                : null)
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
                log.info("Saved notification with ID: {}", savedNotification.getNotificationId());

                // Handle recipients (single or multiple)
                List<String> recipientIds = request.getRecipientIds() != null && !request.getRecipientIds().isEmpty()
                                ? request.getRecipientIds()
                                : List.of(request.getRecipientId());

                // Create and save UserNotificationStatus for each recipient
                for (String recipientId : recipientIds) {
                        UserNotificationStatus userStatus = UserNotificationStatus.builder()
                                        .notification(savedNotification)
                                        .userId(recipientId)
                                        .status(NotificationStatus.PENDING)
                                        .updatedAt(LocalDateTime.now())
                                        .updatedBy("system")
                                        .build();
                        userNotificationStatusRepository.save(userStatus);
                }

                // Publish to RabbitMQ after saving
                publishNotification(savedNotification);

                // // Publish to RabbitMQ after saving
                // publishEmail(savedNotification, schoolId);

                NotificationResponse response = responsesBuilder.buildNotificationResponse(savedNotification);
                return ResponseEntity.ok(ApiResponse.success("Notification created successfully", response));
        }

        private void publishNotification(Notification notification) {
                Message message = MessageBuilder
                                .withBody(messageConverter.toMessage(notification, new MessageProperties()).getBody())
                                .setMessageId("notif-" + notification.getNotificationId() + "-" + System.nanoTime())
                                .build();
                String recipientId = notification.getRecipientId() != null ? notification.getRecipientId() : "all";
                rabbitTemplate.send(RabbitMQConfig.NOTIFICATION_EXCHANGE, "notifications." + recipientId, message);
                log.info("Published notification to RabbitMQ with routing key: notifications.{} for notificationId: {}",
                                recipientId, notification.getNotificationId());
        }

        private void publishEmail(EmailRequest emailRequest, String schoolId) {
                Map<String, Object> emailTask = Map.of("schoolId", schoolId, "emailRequest", emailRequest);
                rabbitTemplate.convertAndSend(RabbitMQConfig.EMAIL_EXCHANGE, "email." + emailRequest.getRecipientId(),
                                emailTask);
        }

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

        // Other methods remain unchanged unless they need similar fixes
        public ResponseEntity<ApiResponse<List<NotificationResponse>>> getAllNotifications(String schoolId) {
                List<Notification> notifications = notificationRepository.findBySchoolId(schoolId);
                if (notifications.isEmpty()) {
                        return ResponseEntity.status(HttpStatus.NO_CONTENT)
                                        .body(ApiResponse.failure("No notifications found for the given school"));
                }
                List<NotificationResponse> responseList = notifications.stream()
                                .map(responsesBuilder::buildNotificationResponse)
                                .collect(Collectors.toList());
                return ResponseEntity.ok(ApiResponse.success("Notifications fetched successfully", responseList));
        }

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

        @Transactional
        public ResponseEntity<ApiResponse<NotificationResponse>> updateNotification(String schoolId,
                        Long notificationId, NotificationRequest request) {
                Notification notification = notificationRepository.findByNotificationId(notificationId, schoolId);
                if (notification == null || !notification.getIsActive()) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                        .body(ApiResponse.failure("Notification not found or unauthorized"));
                }
                notification.setMessage(request.getMessage());
                notification.setType(request.getType());
                notification.setUpdatedAt(LocalDateTime.now());
                notification.setUpdatedBy("admin");
                Notification updatedNotification = notificationRepository.save(notification);
                return ResponseEntity.ok(ApiResponse.success("Notification updated successfully",
                                responsesBuilder.buildNotificationResponse(updatedNotification)));
        }

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

        public ResponseEntity<ApiResponse<List<NotificationResponse>>> getUnreadNotifications(String schoolId,
                        String userId) {
                List<UserNotificationStatus> statuses = userNotificationStatusRepository
                                .findByUserIdAndStatus(userId, NotificationStatus.SENT);

        List<UserNotificationStatus> state= userNotificationStatusRepository.findByUserId(userId);

        log.info("Fetching unread notifications for userId: {} in schoolId: {} with notifications: {}", userId, schoolId, state);
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

        @Transactional
        public ResponseEntity<ApiResponse<String>> markNotificationAsRead(Long notificationId, String userId) {
                log.info("Marking notification as read with ID: {} for userId: {}", notificationId, userId);
                UserNotificationStatus userStatus = userNotificationStatusRepository
                                .findByNotificationNotificationIdAndUserId(notificationId, userId)
                                .orElseThrow(() -> new RuntimeException("Notification status not found for user"));
                userStatus.setStatus(NotificationStatus.READ);
                userStatus.setReadAt(LocalDateTime.now());
                userStatus.setUpdatedAt(LocalDateTime.now());
                userStatus.setUpdatedBy(userId);
                userNotificationStatusRepository.save(userStatus);
                return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
        }

        @Transactional
        public ResponseEntity<ApiResponse<List<NotificationResponse>>> retryFailedNotifications(String schoolId) {
                List<UserNotificationStatus> failedStatuses = userNotificationStatusRepository
                                .findByUserIdAndStatus(null, NotificationStatus.FAILED);
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