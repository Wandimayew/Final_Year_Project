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
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Service class for consuming in-app notifications from RabbitMQ, updating
 * status,
 * and broadcasting via WebSocket.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationRepository notificationRepository;
    private final UserNotificationStatusRepository userNotificationStatusRepository;
    private final RabbitTemplate rabbitTemplate;
    private final EntityManager entityManager;
    private final ResponsesBuilder responsesBuilder; // Injected ResponsesBuilder

    private static final int MAX_RETRIES = 3;

    /**
     * Consumes in-app notifications from the queue, updates UserNotificationStatus,
     * and broadcasts to WebSocket for each recipient.
     *
     * @param message      The RabbitMQ message containing retry information.
     * @param notification The Notification object deserialized from the queue.
     */
    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_QUEUE)
    @Transactional
    public void processNotification(Message message, Notification notification) {
        try {
            log.info("Processing notification ID: {}", notification.getNotificationId());

            int retryCount = getRetryCount(message);
            if (retryCount >= MAX_RETRIES) {
                log.error("Max retries ({}) reached for notificationId: {}. Marking as FAILED.",
                        MAX_RETRIES, notification.getNotificationId());
                markAllAsFailed(notification);
                return;
            }

            // Fetch the managed Notification entity
            Notification managedNotification = entityManager.find(
                    Notification.class,
                    notification.getNotificationId(),
                    LockModeType.OPTIMISTIC);

            if (managedNotification == null) {
                log.warn("Notification ID: {} not found in database, saving as new",
                        notification.getNotificationId());
                managedNotification = notificationRepository.save(notification);
            }

            // Fetch all UserNotificationStatus entries for this notification
            List<UserNotificationStatus> statuses = userNotificationStatusRepository
                    .findByNotificationNotificationId(managedNotification.getNotificationId());

            if (statuses.isEmpty()) {
                log.error("No UserNotificationStatus found for notificationId: {}",
                        managedNotification.getNotificationId());
                throw new IllegalStateException("No recipients found for notification");
            }

            // Update status and broadcast for each recipient
            for (UserNotificationStatus status : statuses) {
                if (status.getStatus() != NotificationStatus.PENDING) {
                    log.info("Skipping userId: {} - status already: {}",
                            status.getUserId(), status.getStatus());
                    continue;
                }

                status.setStatus(NotificationStatus.SENT);
                status.setReadAt(LocalDateTime.now());
                status.setUpdatedAt(LocalDateTime.now());
                status.setUpdatedBy("system");
                userNotificationStatusRepository.save(status);

                // Broadcast to WebSocket for this user using injected ResponsesBuilder
                NotificationResponse response = responsesBuilder.buildNotificationResponse(managedNotification);
                String destination = "/topic/notifications/" + status.getUserId();
                messagingTemplate.convertAndSend(destination, response);
                log.info("Delivered in-app notification to userId: {} for notificationId: {}",
                        status.getUserId(), managedNotification.getNotificationId());
            }

        } catch (Exception e) {
            log.error("Failed to process notification ID: {}, error: {}",
                    notification.getNotificationId(), e.getMessage());

            // Mark all statuses as FAILED and re-queue
            markAllAsFailed(notification);
            int retryCount = getRetryCount(message) + 1;
            message.getMessageProperties().getHeaders().put("retryCount", retryCount);
            rabbitTemplate.send(
                    RabbitMQConfig.DEAD_LETTER_EXCHANGE,
                    RabbitMQConfig.DEAD_LETTER_ROUTING_KEY,
                    message);
            log.info("Re-queued notificationId: {} to DLQ with retryCount: {}",
                    notification.getNotificationId(), retryCount);
        }
    }

    /**
     * Marks all UserNotificationStatus entries for a notification as FAILED.
     *
     * @param notification The notification whose statuses should be marked as
     *                     failed.
     */
    private void markAllAsFailed(Notification notification) {
        List<UserNotificationStatus> statuses = userNotificationStatusRepository
                .findByNotificationNotificationId(notification.getNotificationId());
        for (UserNotificationStatus status : statuses) {
            status.setStatus(NotificationStatus.FAILED);
            status.setUpdatedAt(LocalDateTime.now());
            userNotificationStatusRepository.save(status);
        }
    }

    /**
     * Retrieves the retry count from message headers, defaulting to 0 if not
     * present.
     *
     * @param message The RabbitMQ message containing retry headers.
     * @return The number of retries, defaulting to 0.
     */
    private int getRetryCount(Message message) {
        Map<String, Object> headers = message.getMessageProperties().getHeaders();
        return headers.containsKey("retryCount") ? (int) headers.get("retryCount") : 0;
    }
}