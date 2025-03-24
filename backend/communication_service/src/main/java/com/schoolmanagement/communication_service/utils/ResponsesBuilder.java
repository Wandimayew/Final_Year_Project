package com.schoolmanagement.communication_service.utils;

import com.schoolmanagement.communication_service.dto.response.*;
import com.schoolmanagement.communication_service.model.*;
import com.schoolmanagement.communication_service.repository.UserNotificationStatusRepository;

import lombok.RequiredArgsConstructor;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;


/**
 * Utility class for building response DTOs from entity models.
 */
@Component
@RequiredArgsConstructor
public class ResponsesBuilder {

        private final UserNotificationStatusRepository userNotificationStatusRepository;

        /**
         * Builds an AnnouncementResponse from an Announcement entity.
         */
        public static AnnouncementResponse buildAnnouncementResponse(Announcement announcement) {
                return AnnouncementResponse.builder()
                                .announcementId(announcement.getAnnouncementId())
                                .schoolId(announcement.getSchoolId())
                                .title(announcement.getTitle())
                                .message(announcement.getMessage())
                                .targetAudience(announcement.getTargetAudience())
                                .type(announcement.getType())
                                .startDate(announcement.getStartDate())
                                .endDate(announcement.getEndDate())
                                .status(announcement.getStatus())
                                .authorId(announcement.getAuthorId())
                                .isActive(announcement.getIsActive())
                                .createdAt(announcement.getCreatedAt())
                                .createdBy(announcement.getCreatedBy())
                                .updatedAt(announcement.getUpdatedAt())
                                .updatedBy(announcement.getUpdatedBy())
                                .build();
        }

        /**
         * Builds a CommunicationPreferenceResponse from a CommunicationPreference
         * entity.
         */
        public static CommunicationPreferenceResponse buildPreferenceResponse(CommunicationPreference preference) {
                return CommunicationPreferenceResponse.builder()
                                .communicationPreferenceId(preference.getCommunicationPreferenceId())
                                .schoolId(preference.getSchoolId())
                                .userId(preference.getUserId())
                                .emailEnabled(preference.isEmailEnabled())
                                .inAppEnabled(preference.isInAppEnabled())
                                .smsEnabled(preference.isSmsEnabled())
                                .pushEnabled(preference.isPushEnabled())
                                .isActive(preference.getIsActive())
                                .createdAt(preference.getCreatedAt())
                                .createdBy(preference.getCreatedBy())
                                .updatedAt(preference.getUpdatedAt())
                                .updatedBy(preference.getUpdatedBy())
                                .build();
        }

        /**
         * Builds a NotificationResponse from a Notification entity.
         * Handles both single-recipient and multi-recipient notifications:
         * - For single-recipient (e.g., creator approval/cancellation), sets
         * recipientId.
         * - For multi-recipient (e.g., audience notifications), sets recipientIds.
         * Fetches per-user statuses from UserNotificationStatusRepository since
         * Notification
         * no longer holds a status field.
         *
         * @param notification The Notification entity to convert into a response DTO.
         * @return NotificationResponse containing the notification details and per-user
         *         statuses.
         */
        public NotificationResponse buildNotificationResponse(Notification notification) {
                // Fetch all UserNotificationStatus entries for this notification
                List<UserNotificationStatus> statuses = userNotificationStatusRepository
                                .findByNotificationNotificationId(notification.getNotificationId());

                // Build per-user status responses
                List<UserNotificationStatusResponse> statusResponses = statuses.stream()
                                .map(status -> UserNotificationStatusResponse.builder()
                                                .userId(status.getUserId())
                                                .status(status.getStatus())
                                                .readAt(status.getReadAt())
                                                .build())
                                .collect(Collectors.toList());

                // Initialize the builder with common fields
                NotificationResponse.NotificationResponseBuilder builder = NotificationResponse.builder()
                                .notificationId(notification.getNotificationId())
                                .schoolId(notification.getSchoolId())
                                .message(notification.getMessage())
                                .type(notification.getType())
                                .sentAt(notification.getSentAt())
                                .isActive(notification.getIsActive())
                                .createdAt(notification.getCreatedAt())
                                .createdBy(notification.getCreatedBy())
                                .updatedAt(notification.getUpdatedAt())
                                .updatedBy(notification.getUpdatedBy())
                                .announcementId(notification.getAnnouncement() != null
                                                ? notification.getAnnouncement().getAnnouncementId()
                                                : null)
                                .templateId(notification.getNotificationTemplate() != null
                                                ? notification.getNotificationTemplate().getNotificationTemplateId()
                                                : null)
                                .userStatuses(statusResponses);

                // Set recipient fields based on the number of statuses
                if (statuses.size() == 1) {
                        // Single-recipient case: set recipientId only
                        builder.recipientId(statuses.get(0).getUserId());
                        builder.recipientIds(Collections.singletonList(statuses.get(0).getUserId())); // Optional:
                                                                                                      // include as list
                                                                                                      // too
                } else if (statuses.size() > 1) {
                        // Multi-recipient case: set recipientIds only
                        builder.recipientIds(statuses.stream()
                                        .map(UserNotificationStatus::getUserId)
                                        .collect(Collectors.toList()));
                } else {
                        // No recipients (unlikely, but handle gracefully)
                        builder.recipientIds(Collections.emptyList());
                }

                return builder.build();
        }

        /**
         * Builds a NotificationTemplateResponse from a NotificationTemplate entity.
         */
        public static NotificationTemplateResponse buildNotificationTemplateResponse(NotificationTemplate template) {
                return NotificationTemplateResponse.builder()
                                .notificationTemplateId(template.getNotificationTemplateId())
                                .schoolId(template.getSchoolId())
                                .type(template.getType())
                                .name(template.getName())
                                .content(template.getContent())
                                .isActive(template.isActive())
                                .createdAt(template.getCreatedAt())
                                .createdBy(template.getCreatedBy())
                                .updatedAt(template.getUpdatedAt())
                                .updatedBy(template.getUpdatedBy())
                                .build();
        }

        /**
         * Builds an EmailResponse from an EmailMessage entity.
         */
        public static EmailResponse buildEmailResponse(EmailMessage email) {
                return EmailResponse.builder()
                                .emailId(email.getEmailId())
                                .schoolId(email.getSchoolId())
                                .senderId(email.getSenderId())
                                .recipientId(email.getRecipientId())
                                .subject(email.getSubject())
                                .body(email.getBody())
                                .senderStatus(email.getSenderStatus().name())
                                .recipientStatus(email.getRecipientStatus().name())
                                .senderDeleted(email.getSenderDeleted())
                                .recipientDeleted(email.getRecipientDeleted())
                                .sentAt(email.getSentAt())
                                .isRead(email.getIsRead())
                                .isDraft(email.getIsDraft())
                                .isActive(email.getIsActive())
                                .attachments(email.getAttachments() != null
                                                ? email.getAttachments().stream()
                                                                .map(attachment -> AttachmentResponse.builder()
                                                                                .attachmentId(attachment
                                                                                                .getAttachmentId())
                                                                                .schoolId(attachment.getSchoolId())
                                                                                .fileName(attachment.getFileName())
                                                                                .filePath(attachment.getFilePath())
                                                                                .fileType(attachment.getFileType())
                                                                                .fileSize(attachment.getFileSize())
                                                                                .isActive(attachment.getIsActive())
                                                                                .build())
                                                                .collect(Collectors.toList())
                                                : Collections.emptyList())
                                .announcementId(email.getAnnouncement() != null
                                                ? String.valueOf(email.getAnnouncement().getAnnouncementId())
                                                : null)
                                .createdAt(email.getCreatedAt())
                                .createdBy(email.getCreatedBy())
                                .updatedAt(email.getUpdatedAt())
                                .updatedBy(email.getUpdatedBy())
                                .build();
        }
}