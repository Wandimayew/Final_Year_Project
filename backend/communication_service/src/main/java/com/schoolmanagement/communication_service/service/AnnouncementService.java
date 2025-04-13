package com.schoolmanagement.communication_service.service;

import com.schoolmanagement.communication_service.client.UserManagementClient;
import com.schoolmanagement.communication_service.dto.request.AnnouncementRequest;
import com.schoolmanagement.communication_service.dto.request.EmailRequest;
import com.schoolmanagement.communication_service.dto.request.NotificationRequest;
import com.schoolmanagement.communication_service.dto.response.AnnouncementResponse;
import com.schoolmanagement.communication_service.dto.response.ApiResponse;
import com.schoolmanagement.communication_service.dto.response.EmailResponse;
import com.schoolmanagement.communication_service.dto.response.NotificationResponse;
import com.schoolmanagement.communication_service.enums.AnnouncementStatus;
import com.schoolmanagement.communication_service.enums.NotificationType;
import com.schoolmanagement.communication_service.model.Announcement;
import com.schoolmanagement.communication_service.model.CommunicationPreference;
import com.schoolmanagement.communication_service.model.NotificationTemplate;
import com.schoolmanagement.communication_service.repository.AnnouncementRepository;
import com.schoolmanagement.communication_service.repository.CommunicationPreferenceRepository;
import com.schoolmanagement.communication_service.repository.NotificationTemplateRepository;
import com.schoolmanagement.communication_service.utils.JwtUtil;
import com.schoolmanagement.communication_service.utils.ResponsesBuilder;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Service class for managing announcements with notification integration.
 * Sends notifications to the audience on approval (multi-recipient) and to the
 * creator
 * on approval or cancellation (single-recipient), respecting user communication
 * preferences.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AnnouncementService {

        private final AnnouncementRepository announcementRepository;
        private final NotificationTemplateRepository notificationTemplateRepository;
        private final UserManagementClient userManagementClient;
        private final CommunicationPreferenceRepository communicationPreferenceRepository;
        private final EmailService emailService; // Inject EmailService
        private final NotificationService notificationService;
        private final JwtUtil jwtUtil;

        private static final Pattern ID_PATTERN = Pattern.compile("ID: ([^,]+)");

        /**
         * Creates a new announcement in DRAFT status without notifying the audience.
         */
        @Transactional
        public ResponseEntity<ApiResponse<AnnouncementResponse>> createAnnouncement(String schoolId,
                        AnnouncementRequest request, String userId) {
                log.info("Creating announcement for schoolId: {}", schoolId);

                Optional<NotificationTemplate> templateOpt = fetchTemplate(schoolId, request.getTemplateId());
                if (request.getTemplateId() != null && templateOpt.isEmpty()) {
                        return ResponseEntity.badRequest().body(ApiResponse.failure("Invalid template ID"));
                }

                String processedMessage = processMessage(request.getMessage(), templateOpt);
                Announcement announcement = buildAnnouncement(schoolId, request, processedMessage,
                                templateOpt.orElse(null), userId);
                Announcement savedAnnouncement = announcementRepository.save(announcement);

                AnnouncementResponse response = ResponsesBuilder.buildAnnouncementResponse(savedAnnouncement);
                return ResponseEntity.ok(ApiResponse.success("Announcement created successfully", response));
        }

        /**
         * Approves an announcement, notifies the target audience (multi-recipient), and
         * the creator (single-recipient).
         * NotificationService handles IN_APP or email based on user preferences.
         */
        @Transactional
        public ResponseEntity<ApiResponse<AnnouncementResponse>> approveAnnouncement(String schoolId,
                        Long announcementId,
                        String userId, HttpServletRequest request) {
                log.info("Approving announcement ID: {} for schoolId: {} by userId: {}", announcementId, schoolId,
                                userId);

                Announcement announcement = findActiveAnnouncement(schoolId, announcementId)
                                .orElseThrow(() -> new AnnouncementNotFoundException(
                                                "Announcement not found or inactive"));

                if (announcement.getStatus() != AnnouncementStatus.PENDING) {
                        return ResponseEntity.badRequest()
                                        .body(ApiResponse.failure("Only PENDING announcements can be approved"));
                }

                announcement.setStatus(AnnouncementStatus.PUBLISHED);
                announcement.setUpdatedAt(LocalDateTime.now());
                announcement.setUpdatedBy(userId);
                Announcement approvedAnnouncement = announcementRepository.save(announcement);

                // Extract token from Authentication
                // log.info("THis is the token: {}", authentication.getCredentials());
                // log.info("THis is the authentication: {}", authentication);
                // String token = authentication.getCredentials() != null ?
                // authentication.getCredentials().toString() : null;
                if (request == null) {
                        log.warn("No HttpServletRequest available for approving announcement ID: {}", announcementId);
                } else {
                        // Notify audience (both in-app and email)
                        notifyAudienceAsync(approvedAnnouncement, request);
                }

                // Notify the creator of approval (both in-app and email)
                notifyCreatorOfApproval(approvedAnnouncement);

                AnnouncementResponse response = ResponsesBuilder.buildAnnouncementResponse(approvedAnnouncement);
                return ResponseEntity.ok(ApiResponse.success("Announcement approved successfully", response));
        }

        /**
         * Cancels an announcement and notifies the creator (single-recipient).
         * NotificationService handles IN_APP or email based on user preferences.
         */
        @Transactional
        public ResponseEntity<ApiResponse<AnnouncementResponse>> cancelAnnouncement(
                        String schoolId, Long announcementId, String userId, String rejectionReason) {
                log.info("Canceling announcement ID: {} for schoolId: {} by userId: {}", announcementId, schoolId,
                                userId);

                Announcement announcement = findActiveAnnouncement(schoolId, announcementId)
                                .orElseThrow(() -> new AnnouncementNotFoundException(
                                                "Announcement not found or inactive"));

                announcement.setStatus(AnnouncementStatus.CANCELLED);
                announcement.setRejectionReason(rejectionReason);
                announcement.setUpdatedAt(LocalDateTime.now());
                announcement.setUpdatedBy(userId);
                Announcement updatedAnnouncement = announcementRepository.save(announcement);

                // Notify the creator of cancellation (single-recipient)
                notifyCreatorOfCancellation(updatedAnnouncement);

                AnnouncementResponse response = ResponsesBuilder.buildAnnouncementResponse(updatedAnnouncement);
                return ResponseEntity.ok(ApiResponse.success("Announcement canceled successfully", response));
        }

        /**
         * Asynchronously notifies the target audience of an approved announcement
         * (multi-recipient).
         * Uses NotificationService to send IN_APP if preference allows, otherwise
         * email.
         */
        @Async
        public CompletableFuture<Void> notifyAudienceAsync(Announcement announcement, HttpServletRequest request) {
                String authorizationHeader = request.getHeader("Authorization");
                log.info("Notifying audience for announcement ID: {}", announcement.getAnnouncementId());

                List<String> recipientIds;

                try {
                        // Fetch user IDs from userManagementClient
                        List<String> userIdsResponse = userManagementClient.getUserIdsByRole(
                                        announcement.getSchoolId(),
                                        announcement.getTargetAudience(),
                                        authorizationHeader);
                        log.info("Fetched users {}", userIdsResponse);

                        // Extract userIds from the response string
                        recipientIds = extractUserIds(userIdsResponse);

                        log.info("Recipient ids that are being returned : {} .", recipientIds);
                        if (recipientIds.isEmpty()) {
                                log.warn("No valid user IDs extracted from response for target audience: {} in school: {}",
                                                announcement.getTargetAudience(), announcement.getSchoolId());
                                return CompletableFuture.completedFuture(null);
                        }
                } catch (Exception e) {
                        log.error("Failed to fetch user IDs for role: {} in school: {}, error: {}",
                                        announcement.getTargetAudience(), announcement.getSchoolId(), e.getMessage());
                        recipientIds = Collections.emptyList();
                }

                if (recipientIds.isEmpty()) {
                        log.warn("No users found for target audience: {} in school: {}",
                                        announcement.getTargetAudience(), announcement.getSchoolId());
                        return CompletableFuture.completedFuture(null);
                }

                NotificationRequest requests = NotificationRequest.builder()
                                .recipientIds(recipientIds)
                                .message(String.format("New announcement: %s", announcement.getTitle()))
                                .type(NotificationType.IN_APP)
                                .templateId(announcement.getTemplate() != null
                                                ? announcement.getTemplate().getNotificationTemplateId()
                                                : null)
                                .build();

                try {
                        ResponseEntity<ApiResponse<NotificationResponse>> response = notificationService
                                        .createNotification(announcement.getSchoolId(), requests);
                        if (response.getStatusCode() == HttpStatus.OK) {
                                log.info("Audience notified for announcement ID: {}", announcement.getAnnouncementId());
                        } else {
                                log.warn("Failed to notify audience for announcement ID: {}, status: {}",
                                                announcement.getAnnouncementId(), response.getStatusCode());
                        }
                } catch (Exception e) {
                        log.error("Error notifying audience for announcement ID: {}, error: {}",
                                        announcement.getAnnouncementId(), e.getMessage(), e);
                }

                // 2. Send email to audience
                for (String recipientId : recipientIds) {
                        log.info("Recipient Id is : {} :  ::::::: ", recipientId);

                        CommunicationPreference preference = communicationPreferenceRepository
                                        .findBySchoolAndUserId(announcement.getSchoolId(), recipientId);
                        if (preference == null || !preference.isEmailEnabled()) {
                                log.info("Preference is null or in app is disabled for recipient id: {}", recipientId);
                                continue;
                        }
                        EmailRequest emailRequest = EmailRequest.builder()
                                        .recipientId(recipientId)
                                        .subject("New Announcement: " + announcement.getTitle())
                                        .body(announcement.getMessage() + announcement.getTargetAudience())
                                        .templateId(announcement.getTemplate() != null
                                                        ? announcement.getTemplate().getNotificationTemplateId()
                                                        : null)
                                        .build();

                        try {
                                ResponseEntity<ApiResponse<EmailResponse>> emailResponse = emailService.composeEmail(
                                                announcement.getSchoolId(),
                                                emailRequest,
                                                null, // No attachments for now
                                                true, // Send immediately
                                                announcement.getUpdatedBy() // Use the approver as the sender
                                );
                                if (emailResponse.getStatusCode() == HttpStatus.OK) {
                                        log.info("Email sent to recipient {} for announcement ID: {}", recipientId,
                                                        announcement.getAnnouncementId());
                                } else {
                                        log.warn("Failed to send email to recipient {} for announcement ID: {}, status: {}",
                                                        recipientId, announcement.getAnnouncementId(),
                                                        emailResponse.getStatusCode());
                                }
                        } catch (Exception e) {
                                log.error("Error sending email to recipient {} for announcement ID: {}, error: {}",
                                                recipientId, announcement.getAnnouncementId(), e.getMessage(), e);
                        }
                }

                return CompletableFuture.completedFuture(null);
        }

        private List<String> extractUserIds(List<String> inputs) {
                // Handle null or empty input
                if (inputs == null || inputs.isEmpty()) {
                        return Collections.emptyList();
                }

                // Pattern to match "ID: <userId>"
                Pattern pattern = Pattern.compile("ID: ([A-Za-z0-9]+)");
                List<String> userIds = new ArrayList<>();
                log.info("User ids that are being extracted : {} .", userIds);
                // Iterate over each string in the list
                for (String input : inputs) {
                        log.info("input String in the loop : {} : .", input);
                        if (input != null && input.contains("ID: ")) {
                                Matcher matcher = pattern.matcher(input);
                                while (matcher.find()) {
                                        userIds.add(matcher.group(1)); // Group 1 is the userId after "ID: "
                                }
                        }
                }

                log.info("User Ids that are being returned : {} .", userIds);
                return userIds;
        }

        /**
         * Notifies the creator of an announcement approval (single-recipient).
         * Uses NotificationService to send IN_APP if preference allows, otherwise
         * email.
         */
        private void notifyCreatorOfApproval(Announcement announcement) {
                log.info("Notifying creator userId: {} of approval for announcement ID: {}",
                                announcement.getAuthorId(), announcement.getAnnouncementId());

                // 1. Send in-app notification
                NotificationRequest notificationRequest = NotificationRequest.builder()
                                .recipientId(announcement.getAuthorId()) // Single-recipient
                                .message(String.format("Your announcement '%s' has been approved.",
                                                announcement.getTitle()))
                                .type(NotificationType.IN_APP)
                                .templateId(announcement.getTemplate() != null
                                                ? announcement.getTemplate().getNotificationTemplateId()
                                                : null)
                                .build();

                try {
                        ResponseEntity<ApiResponse<NotificationResponse>> response = notificationService
                                        .createNotification(announcement.getSchoolId(), notificationRequest);
                        if (response.getStatusCode() == HttpStatus.OK) {
                                log.info("Approval notification sent (in-app) to creator userId: {}",
                                                announcement.getAuthorId());
                        } else {
                                log.warn("Failed to send approval notification (in-app) to creator, status: {}",
                                                response.getStatusCode());
                        }
                } catch (Exception e) {
                        log.error("Error sending approval notification (in-app) to creator userId: {}, error: {}",
                                        announcement.getAuthorId(), e.getMessage());
                }

                // 2. Send email to creator

                CommunicationPreference preference = communicationPreferenceRepository
                                .findBySchoolAndUserId(announcement.getSchoolId(), announcement.getAuthorId());
                if (preference != null && preference.isEmailEnabled()) {
                        log.info("Sending approval email to creator userId: {}",
                                        announcement.getAuthorId());

                        EmailRequest emailRequest = EmailRequest.builder()
                                        .recipientId(announcement.getAuthorId())
                                        .subject("Your Announcement '" + announcement.getTitle()
                                                        + "' Has Been Approved")
                                        .body("Your announcement has been approved and is now published.\n\nDetails:\n"
                                                        + announcement.getMessage())
                                        .templateId(announcement.getTemplate() != null
                                                        ? announcement.getTemplate().getNotificationTemplateId()
                                                        : null)
                                        .build();

                        try {
                                ResponseEntity<ApiResponse<EmailResponse>> emailResponse = emailService.composeEmail(
                                                announcement.getSchoolId(),
                                                emailRequest,
                                                null, // No attachments for now
                                                true, // Send immediately
                                                announcement.getUpdatedBy() // Use the approver as the sender
                                );
                                if (emailResponse.getStatusCode() == HttpStatus.OK) {
                                        log.info("Approval email sent to creator userId: {}",
                                                        announcement.getAuthorId());
                                } else {
                                        log.warn("Failed to send approval email to creator, status: {}",
                                                        emailResponse.getStatusCode());
                                }
                        } catch (Exception e) {
                                log.error("Error sending approval email to creator userId: {}, error: {}",
                                                announcement.getAuthorId(), e.getMessage(), e);
                        }
                }
        }

        /**
         * Notifies the creator of an announcement cancellation (single-recipient).
         * Uses NotificationService to send IN_APP if preference allows, otherwise
         * email.
         */
        private void notifyCreatorOfCancellation(Announcement announcement) {
                log.info("Notifying creator userId: {} of cancellation for announcement ID: {}",
                                announcement.getAuthorId(), announcement.getAnnouncementId());

                String message = announcement.getRejectionReason() != null
                                ? String.format("Your announcement '%s' has been canceled. Reason: %s",
                                                announcement.getTitle(), announcement.getRejectionReason())
                                : String.format("Your announcement '%s' has been canceled.", announcement.getTitle());

                NotificationRequest request = NotificationRequest.builder()
                                .recipientId(announcement.getAuthorId()) // Single-recipient
                                .message(message)
                                .type(NotificationType.IN_APP) // Preferred type; NotificationService adjusts based on
                                                               // preference
                                .templateId(announcement.getTemplate() != null
                                                ? announcement.getTemplate().getNotificationTemplateId()
                                                : null)
                                .build();

                try {
                        ResponseEntity<ApiResponse<NotificationResponse>> response = notificationService
                                        .createNotification(
                                                        announcement.getSchoolId(), request);
                        if (response.getStatusCode() == HttpStatus.OK) {
                                log.info("Cancellation notification sent to creator userId: {}",
                                                announcement.getAuthorId());
                        } else {
                                log.warn("Failed to send cancellation notification to creator, status: {}",
                                                response.getStatusCode());
                        }
                } catch (Exception e) {
                        log.error("Error sending cancellation notification to creator userId: {}, error: {}",
                                        announcement.getAuthorId(), e.getMessage());
                }
        }

        // --- Existing Methods (Unchanged for Brevity) ---

        @Transactional
        public ResponseEntity<ApiResponse<AnnouncementResponse>> updateAnnouncement(String schoolId,
                        Long announcementId,
                        AnnouncementRequest request) {
                Announcement announcement = findActiveAnnouncement(schoolId, announcementId)
                                .orElseThrow(() -> new AnnouncementNotFoundException(
                                                "Announcement not found or inactive"));

                Optional<NotificationTemplate> templateOpt = fetchTemplate(schoolId, request.getTemplateId());
                if (request.getTemplateId() != null && templateOpt.isEmpty()) {
                        return ResponseEntity.badRequest().body(ApiResponse.failure("Invalid template ID"));
                }

                updateAnnouncementFields(announcement, request, templateOpt);
                Announcement updatedAnnouncement = announcementRepository.save(announcement);

                AnnouncementResponse response = ResponsesBuilder.buildAnnouncementResponse(updatedAnnouncement);
                return ResponseEntity.ok(ApiResponse.success("Announcement updated successfully", response));
        }

        @Transactional
        public ResponseEntity<ApiResponse<AnnouncementResponse>> requestApproveAnnouncement(String schoolId,
                        Long announcementId,
                        String userId) {
                Announcement announcement = findActiveAnnouncement(schoolId, announcementId)
                                .orElseThrow(() -> new AnnouncementNotFoundException(
                                                "Announcement not found or inactive"));

                if (!announcement.getAuthorId().equals(userId)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                        .body(ApiResponse.failure("Only the creator can request approval"));
                }

                if (announcement.getStatus() != AnnouncementStatus.DRAFT) {
                        return ResponseEntity.badRequest()
                                        .body(ApiResponse.failure("Only DRAFT announcements can request approval"));
                }

                announcement.setStatus(AnnouncementStatus.PENDING);
                announcement.setUpdatedAt(LocalDateTime.now());
                announcement.setUpdatedBy(userId);
                Announcement updatedAnnouncement = announcementRepository.save(announcement);

                AnnouncementResponse response = ResponsesBuilder.buildAnnouncementResponse(updatedAnnouncement);
                return ResponseEntity.ok(ApiResponse.success("Approval requested successfully", response));
        }

        public ResponseEntity<ApiResponse<List<AnnouncementResponse>>> getAllRequestApproval(String schoolId,
                        String userId) {
                Pageable pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "updatedAt"));
                Page<Announcement> pendingAnnouncements = announcementRepository
                                .findBySchoolIdAndStatus(schoolId, AnnouncementStatus.PENDING, pageable);

                if (pendingAnnouncements.isEmpty()) {
                        return ResponseEntity.status(HttpStatus.NO_CONTENT)
                                        .body(ApiResponse.failure("No pending approval requests found"));
                }

                List<AnnouncementResponse> responses = pendingAnnouncements.stream()
                                .map(ResponsesBuilder::buildAnnouncementResponse)
                                .collect(Collectors.toList());

                return ResponseEntity
                                .ok(ApiResponse.success("Pending approval requests fetched successfully", responses));
        }

        public ResponseEntity<ApiResponse<List<AnnouncementResponse>>> getCreatorPendingAnnouncements(String schoolId,
                        String userId) {
                Pageable pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "updatedAt"));
                Page<Announcement> pendingAnnouncements = announcementRepository
                                .findBySchoolIdAndStatusAndAuthorId(schoolId, AnnouncementStatus.PENDING, userId,
                                                pageable);

                if (pendingAnnouncements.isEmpty()) {
                        return ResponseEntity.status(HttpStatus.NO_CONTENT)
                                        .body(ApiResponse.failure("No pending announcements found for this creator"));
                }

                List<AnnouncementResponse> responses = pendingAnnouncements.stream()
                                .map(ResponsesBuilder::buildAnnouncementResponse)
                                .collect(Collectors.toList());

                return ResponseEntity.ok(ApiResponse.success("Pending announcements fetched successfully", responses));
        }

        @Transactional
        public ResponseEntity<ApiResponse<AnnouncementResponse>> updateAnnouncementStatus(String schoolId,
                        Long announcementId,
                        String status,
                        String userId) {
                AnnouncementStatus newStatus = AnnouncementStatus.valueOf(status.toUpperCase());
                Announcement announcement = findActiveAnnouncement(schoolId, announcementId)
                                .orElseThrow(() -> new AnnouncementNotFoundException(
                                                "Announcement not found or inactive"));

                if (!announcement.getAuthorId().equals(userId)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                        .body(ApiResponse.failure("Only the creator can update status"));
                }

                announcement.setStatus(newStatus);
                announcement.setUpdatedAt(LocalDateTime.now());
                announcement.setUpdatedBy(userId);
                Announcement updatedAnnouncement = announcementRepository.save(announcement);

                AnnouncementResponse response = ResponsesBuilder.buildAnnouncementResponse(updatedAnnouncement);
                return ResponseEntity.ok(ApiResponse.success("Announcement status updated successfully", response));
        }

        public ResponseEntity<ApiResponse<List<AnnouncementResponse>>> getAllAnnouncements(String schoolId) {
                Pageable pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "startDate"));
                Page<Announcement> announcementsPage = announcementRepository.findBySchoolId(schoolId, pageable);

                if (announcementsPage.isEmpty()) {
                        return ResponseEntity.status(HttpStatus.NO_CONTENT)
                                        .body(ApiResponse.failure("No announcements found"));
                }

                List<AnnouncementResponse> responses = announcementsPage.stream()
                                .map(ResponsesBuilder::buildAnnouncementResponse)
                                .collect(Collectors.toList());

                return ResponseEntity.ok(ApiResponse.success("Announcements fetched successfully", responses));
        }

        public ResponseEntity<ApiResponse<Page<AnnouncementResponse>>> getMyAnnouncements(String schoolId,
                        String userId, Pageable pageable) {
                Page<Announcement> announcementsPage = announcementRepository.findBySchoolIdAndAuthorId(schoolId,
                                userId, pageable);

                if (announcementsPage.isEmpty()) {
                        return ResponseEntity.status(HttpStatus.NO_CONTENT)
                                        .body(ApiResponse.failure("No announcements found for this user"));
                }

                Page<AnnouncementResponse> responsesPage = announcementsPage
                                .map(ResponsesBuilder::buildAnnouncementResponse);
                return ResponseEntity.ok(ApiResponse.success("Announcements fetched successfully", responsesPage));
        }

        public ResponseEntity<ApiResponse<Page<AnnouncementResponse>>> getMyAnnouncementsDraft(String schoolId,
                        String userId, Pageable pageable) {
                Page<Announcement> announcementsPage = announcementRepository.findByStatusDraft(schoolId, userId,
                                pageable);

                if (announcementsPage.isEmpty()) {
                        return ResponseEntity.status(HttpStatus.NO_CONTENT)
                                        .body(ApiResponse.failure("No announcements found for this user"));
                }

                Page<AnnouncementResponse> responsesPage = announcementsPage
                                .map(ResponsesBuilder::buildAnnouncementResponse);
                return ResponseEntity.ok(ApiResponse.success("Announcements fetched successfully", responsesPage));
        }

        public ResponseEntity<ApiResponse<AnnouncementResponse>> getAnnouncementById(String schoolId,
                        Long announcementId) {
                Announcement announcement = findActiveAnnouncement(schoolId, announcementId)
                                .orElseThrow(() -> new AnnouncementNotFoundException(
                                                "Announcement not found or inactive"));

                AnnouncementResponse response = ResponsesBuilder.buildAnnouncementResponse(announcement);
                return ResponseEntity.ok(ApiResponse.success("Announcement fetched successfully", response));
        }

        @Transactional
        public ResponseEntity<ApiResponse<AnnouncementResponse>> deleteAnnouncement(String schoolId,
                        Long announcementId) {
                Announcement announcement = findActiveAnnouncement(schoolId, announcementId)
                                .orElseThrow(() -> new AnnouncementNotFoundException(
                                                "Announcement not found or already deleted"));

                announcement.setIsActive(false);
                announcement.setUpdatedAt(LocalDateTime.now());
                announcement.setUpdatedBy("system");
                announcementRepository.save(announcement);

                return ResponseEntity.ok(ApiResponse.success("Announcement deleted successfully", null));
        }

        // --- Helper Methods ---

        private List<String> fetchUserIds(String schoolId, String targetAudience, HttpServletRequest request) {
                String authorizationHeader = request.getHeader("Authorization");
                try {
                        log.info("Fetching user IDs for role: {} in school: {} with roles fetch : {}", targetAudience,
                                        schoolId,
                                        userManagementClient
                                                        .getUserIdsByRole(schoolId, targetAudience, authorizationHeader)
                                                        .stream()
                                                        .map(this::extractUserId)
                                                        .filter(id -> !id.isEmpty())
                                                        .collect(Collectors.toList()));

                        return userManagementClient.getUserIdsByRole(schoolId, targetAudience, authorizationHeader)
                                        .stream()
                                        .map(this::extractUserId)
                                        .filter(id -> !id.isEmpty())
                                        .collect(Collectors.toList());
                } catch (Exception e) {
                        log.error("Failed to fetch user IDs for role: {} in school: {}, error: {}", targetAudience,
                                        schoolId, e.getMessage());
                        return List.of();
                }
        }

        private String extractUserId(String response) {
                if (response == null)
                        return "";
                Matcher idMatcher = ID_PATTERN.matcher(response);
                return idMatcher.find() ? idMatcher.group(1) : "";
        }

        private Optional<NotificationTemplate> fetchTemplate(String schoolId, Long templateId) {
                return (templateId != null)
                                ? notificationTemplateRepository.findBySchoolAndTemplateId(schoolId, templateId)
                                : Optional.empty();
        }

        private String processMessage(String message, Optional<NotificationTemplate> templateOpt) {
                return templateOpt.map(template -> template.getContent().replace("{message}", escapeHtml(message)))
                                .orElse(escapeHtml(message));
        }

        private Announcement buildAnnouncement(String schoolId, AnnouncementRequest request, String message,
                        NotificationTemplate template, String userId) {
                return Announcement.builder()
                                .schoolId(schoolId)
                                .title(request.getTitle())
                                .message(message)
                                .targetAudience(request.getTargetAudience())
                                .type(request.getType())
                                .startDate(request.getStartDate())
                                .endDate(request.getEndDate())
                                .status(AnnouncementStatus.DRAFT)
                                .authorId(userId)
                                .template(template)
                                .isActive(true)
                                .createdAt(LocalDateTime.now())
                                .createdBy(userId)
                                .updatedAt(LocalDateTime.now())
                                .updatedBy(userId)
                                .build();
        }

        private void updateAnnouncementFields(Announcement announcement, AnnouncementRequest request,
                        Optional<NotificationTemplate> templateOpt) {
                announcement.setTitle(request.getTitle());
                announcement.setMessage(processMessage(request.getMessage(), templateOpt));
                announcement.setTargetAudience(request.getTargetAudience());
                announcement.setType(request.getType());
                announcement.setStartDate(request.getStartDate());
                announcement.setEndDate(request.getEndDate());
                announcement.setStatus(request.getStatus());
                announcement.setAuthorId(request.getAuthorId());
                announcement.setTemplate(templateOpt.orElse(null));
                announcement.setUpdatedAt(LocalDateTime.now());
                announcement.setUpdatedBy("system");
        }

        private Optional<Announcement> findActiveAnnouncement(String schoolId, Long announcementId) {
                return announcementRepository.findByAnnouncementIdAndSchoolId(announcementId, schoolId)
                                .filter(Announcement::getIsActive);
        }

        private String escapeHtml(String input) {
                if (input == null)
                        return "";
                return input.replace("&", "&").replace("<", "<").replace(">", ">")
                                .replace("\"", "\"").replace("'", "'");
        }

        // --- Inner Classes ---

        private static class AnnouncementNotFoundException extends RuntimeException {
                public AnnouncementNotFoundException(String message) {
                        super(message);
                }
        }
}