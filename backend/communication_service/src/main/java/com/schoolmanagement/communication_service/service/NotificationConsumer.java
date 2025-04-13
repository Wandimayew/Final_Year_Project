package com.schoolmanagement.communication_service.service;

import com.schoolmanagement.communication_service.config.RabbitMQConfig;
import com.schoolmanagement.communication_service.dto.response.NotificationResponse;
import com.schoolmanagement.communication_service.enums.NotificationStatus;
import com.schoolmanagement.communication_service.model.Notification;
import com.schoolmanagement.communication_service.model.UserNotificationStatus;
import com.schoolmanagement.communication_service.repository.NotificationRepository;
import com.schoolmanagement.communication_service.repository.UserNotificationStatusRepository;
import com.schoolmanagement.communication_service.utils.ResponsesBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationRepository notificationRepository;
    private final UserNotificationStatusRepository userNotificationStatusRepository;
    private final RabbitTemplate rabbitTemplate;
    private final EntityManager entityManager;
    private final ResponsesBuilder responsesBuilder;

    private static final int MAX_RETRIES = 3;

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_QUEUE, concurrency = "1") // Single-threaded to avoid race conditions
    @Transactional
    public void processNotification(Message message, Notification notification) {
        Long notificationId = notification.getNotificationId();
        log.info("Processing notification ID: {}", notificationId);

        int retryCount = getRetryCount(message);
        if (retryCount >= MAX_RETRIES) {
            log.error("Max retries ({}) reached for notificationId: {}. Marking as FAILED.", MAX_RETRIES, notificationId);
            markAllAsFailed(notification);
            return;
        }

        try {
            // Fetch or create the notification with pessimistic locking
            Notification managedNotification = fetchOrCreateNotification(notification);

            // Fetch all UserNotificationStatus entries with locking
            List<UserNotificationStatus> statuses = userNotificationStatusRepository
                    .findByNotificationNotificationIdWithLock(notificationId);

            if (statuses.isEmpty()) {
                log.error("No UserNotificationStatus found for notificationId: {}", notificationId);
                throw new IllegalStateException("No recipients found for notification");
            }

            boolean sentToAny = false;
            for (UserNotificationStatus status : statuses) {
                if (status.getStatus() == NotificationStatus.PENDING) {
                    // Update status to SENT
                    status.setStatus(NotificationStatus.SENT);
                    status.setReadAt(LocalDateTime.now()); // Adjust if readAt is set later
                    status.setUpdatedAt(LocalDateTime.now());
                    status.setUpdatedBy("system");
                    userNotificationStatusRepository.save(status);

                    // Send WebSocket notification
                    NotificationResponse response = NotificationResponse.builder()
                            .notificationId(managedNotification.getNotificationId())
                            .message(managedNotification.getMessage())
                            .status(status.getStatus())
                            .schoolId(managedNotification.getSchoolId())
                            .build();
                    String destination = "/topic/notifications." + status.getUserId();
                    messagingTemplate.convertAndSend(destination, response);
                    log.info("Delivered in-app notification to destination: {} for notificationId: {}",
                            destination, notificationId);
                    sentToAny = true;
                } else if (status.getStatus() == NotificationStatus.SENT || status.getStatus() == NotificationStatus.READ) {
                    log.info("Skipping userId: {} - notification already received with status: {}",
                            status.getUserId(), status.getStatus());
                } else {
                    log.info("Skipping userId: {} - status: {}", status.getUserId(), status.getStatus());
                }
            }

            // Update sentAt if any notifications were sent
            if (sentToAny && managedNotification.getSentAt() == null) {
                managedNotification.setSentAt(LocalDateTime.now());
                notificationRepository.save(managedNotification);
            } else if (!sentToAny) {
                log.warn("No new notifications sent for notificationId: {}", notificationId);
            }

        } catch (Exception e) {
            log.error("Failed to process notification ID: {}, error: {}", notificationId, e.getMessage(), e);
            handleRetry(message, notification, retryCount);
            throw e; // Ensure transaction rollback
        }
    }

    @Transactional
    @Lock(LockModeType.PESSIMISTIC_WRITE) // Use pessimistic locking to prevent concurrent saves
    private Notification fetchOrCreateNotification(Notification notification) {
        Long notificationId = notification.getNotificationId();
        Optional<Notification> existing = notificationRepository.findById(notificationId);

        if (existing.isPresent()) {
            return existing.get();
        } else {
            log.warn("Notification ID: {} not found in database, saving as new", notificationId);
            // Set defaults for new notification
            if (notification.getCreatedAt() == null) {
                notification.setCreatedAt(LocalDateTime.now());
            }
            if (notification.getCreatedBy() == null) {
                notification.setCreatedBy("system");
            }
            if (notification.getIsActive() == null) {
                notification.setIsActive(true);
            }
            return notificationRepository.saveAndFlush(notification);
        }
    }

    private void markAllAsFailed(Notification notification) {
        List<UserNotificationStatus> statuses = userNotificationStatusRepository
                .findByNotificationNotificationId(notification.getNotificationId());
        for (UserNotificationStatus status : statuses) {
            if (status.getStatus() != NotificationStatus.SENT && status.getStatus() != NotificationStatus.READ) {
                status.setStatus(NotificationStatus.FAILED);
                status.setUpdatedAt(LocalDateTime.now());
                userNotificationStatusRepository.save(status);
            }
        }
    }

    private int getRetryCount(Message message) {
        Map<String, Object> headers = message.getMessageProperties().getHeaders();
        return headers.containsKey("retryCount") ? (int) headers.get("retryCount") : 0;
    }

    private void handleRetry(Message message, Notification notification, int retryCount) {
        retryCount++;
        if (retryCount <= MAX_RETRIES) {
            message.getMessageProperties().getHeaders().put("retryCount", retryCount);
            rabbitTemplate.send(RabbitMQConfig.NOTIFICATION_QUEUE, message);
            log.info("Re-queued notificationId: {} to original queue with retryCount: {}",
                    notification.getNotificationId(), retryCount);
        } else {
            rabbitTemplate.send(RabbitMQConfig.DEAD_LETTER_EXCHANGE, RabbitMQConfig.DEAD_LETTER_ROUTING_KEY, message);
            log.info("Max retries exceeded for notificationId: {}, sent to DLQ with retryCount: {}",
                    notification.getNotificationId(), retryCount);
        }
    }
}