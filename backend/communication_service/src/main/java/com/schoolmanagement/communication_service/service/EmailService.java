package com.schoolmanagement.communication_service.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.schoolmanagement.communication_service.dto.request.EmailRequest;
import com.schoolmanagement.communication_service.dto.response.ApiResponse;
import com.schoolmanagement.communication_service.dto.response.EmailResponse;
import com.schoolmanagement.communication_service.enums.NotificationType;
import com.schoolmanagement.communication_service.model.Attachment;
import com.schoolmanagement.communication_service.model.EmailMessage;
import com.schoolmanagement.communication_service.model.NotificationTemplate;
import com.schoolmanagement.communication_service.repository.AttachmentRepository;
import com.schoolmanagement.communication_service.repository.EmailMessageRepository;
import com.schoolmanagement.communication_service.repository.NotificationTemplateRepository;
import com.schoolmanagement.communication_service.utils.ResponsesBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    private final EmailMessageRepository emailMessageRepository;
    private final AttachmentRepository attachmentRepository;
    private final NotificationTemplateRepository notificationTemplateRepository;

    private final Cloudinary cloudinary; // Injected Cloudinary bean

    public ResponseEntity<ApiResponse<EmailResponse>> composeEmail(
            String schoolId, EmailRequest emailRequest, MultipartFile[] attachments, boolean send, String userId) {
        log.info("Composing email for schoolId: {}, userId: {}, send: {}", schoolId, userId, send);

        String processedBody = processEmailMessage(emailRequest.getBody(), emailRequest.getTemplateId(), schoolId);
        EmailMessage email = EmailMessage.builder()
                .schoolId(schoolId)
                .senderId(userId)
                .recipientId(emailRequest.getRecipientId())
                .subject(emailRequest.getSubject())
                .body(processedBody)
                .senderStatus(send ? EmailMessage.Status.SENT : EmailMessage.Status.DRAFT)
                .recipientStatus(send ? EmailMessage.Status.INBOX : EmailMessage.Status.DRAFT)
                .isRead(false)
                .isDraft(!send)
                .isActive(true)
                .senderDeleted(false)
                .recipientDeleted(false)
                .createdAt(LocalDateTime.now())
                .createdBy(userId)
                .updatedAt(LocalDateTime.now())
                .updatedBy(userId)
                .sentAt(send ? LocalDateTime.now() : null)
                .build();

        EmailMessage savedEmail = emailMessageRepository.save(email);

        // Handle attachments if present
        if (attachments != null && attachments.length > 0) {
            for (MultipartFile file : attachments) {
                if (file != null && !file.isEmpty()) {
                    try {
                        Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                                ObjectUtils.asMap("resource_type", "auto", "sign_url", true, "folder",
                                        schoolId + "/attachments")); // Signed URL
                        String cloudinaryUrl = (String) uploadResult.get("secure_url");

                        Attachment attachment = Attachment.builder()
                                .schoolId(schoolId)
                                .emailMessage(savedEmail)
                                .fileName(file.getOriginalFilename())
                                .filePath(cloudinaryUrl)
                                .fileType(file.getContentType())
                                .fileSize(file.getSize())
                                .isActive(true)
                                .createdAt(LocalDateTime.now())
                                .createdBy(userId)
                                .updatedAt(LocalDateTime.now())
                                .updatedBy(userId)
                                .build();
                        attachmentRepository.save(attachment);
                    } catch (IOException e) {
                        log.error("Failed to upload attachment to Cloudinary for emailId: {}, error: {}",
                                savedEmail.getEmailId(), e.getMessage());
                        throw new RuntimeException("Failed to upload attachment to Cloudinary: " + e.getMessage());
                    }
                }
            }
        }

        EmailMessage updatedEmail = emailMessageRepository.findByEmailId(savedEmail.getEmailId(), schoolId);
        if (updatedEmail == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.failure("Failed to retrieve saved email"));
        }

        EmailResponse response = ResponsesBuilder.buildEmailResponse(updatedEmail);
        return ResponseEntity
                .ok(ApiResponse.success(send ? "Email sent successfully" : "Email draft saved successfully", response));
    }

    private String processEmailMessage(String message, Long templateId, String schoolId) {
        if (templateId == null)
            return message;

        Optional<NotificationTemplate> templateOpt = notificationTemplateRepository.findBySchoolAndTemplateId(schoolId,
                templateId);
        if (templateOpt.isEmpty() || !templateOpt.get().getType().equals(NotificationType.EMAIL)) {
            log.warn("No valid email template found for templateId: {}", templateId);
            return message;
        }

        NotificationTemplate template = templateOpt.get();
        String templateContent = template.getContent();
        return templateContent
                .replace("{subject}", "<h2 style='color: blue; text-align: center;'>" + "New Announcement" + "</h2>")
                .replace("{body}", "<p style='color: black; text-align: center; padding: 10px;'>" + message + "</p>");
    }

    public ResponseEntity<ApiResponse<List<EmailResponse>>> getEmailsByFolder(
            String schoolId, String folder, String userId, int page, int size, String sort) {
        log.info("Fetching emails for schoolId: {}, userId: {}, folder: {}, page: {}, size: {}, sort: {}",
                schoolId, userId, folder, page, size, sort);

        EmailMessage.Status status;
        try {
            status = EmailMessage.Status.valueOf(folder.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.failure("Invalid folder: " + folder));
        }

        String[] sortParams = sort.split(",");
        String sortField = sortParams[0];
        Sort.Direction sortDirection = Sort.Direction.fromString(sortParams[1]);
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(sortDirection, sortField));

        Page<EmailMessage> emailPage;

        if (status == EmailMessage.Status.SENT) {
            emailPage = emailMessageRepository.findSentEmailsBySenderId(userId, schoolId, pageRequest);
            log.info("for sent response {}", emailPage);
        } else if (status == EmailMessage.Status.DRAFT) {
            emailPage = emailMessageRepository.findDraftsBySenderId(userId, EmailMessage.Status.DRAFT, schoolId,
                    pageRequest);
            log.info("for draft response {}", emailPage);
        } else if (status == EmailMessage.Status.INBOX) {
            emailPage = emailMessageRepository.findInboxByRecipientId(userId, schoolId, pageRequest);
            log.info("for inbox response {}", emailPage);
        } else if (status == EmailMessage.Status.IMPORTANT) {
            emailPage = emailMessageRepository.findImportantEmailsByUserId(userId, schoolId, pageRequest);
            log.info("for important response {}", emailPage);
        } else if (status == EmailMessage.Status.TRASH) {
            emailPage = emailMessageRepository.findTrashEmailsByUserId(userId, schoolId, pageRequest);
            log.info("for trash response {}", emailPage);
        } else {
            emailPage = emailMessageRepository.findByRecipientIdAndStatus(userId, status, schoolId, pageRequest);
            log.info("for other response {}", emailPage);
        }

        if (emailPage.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT)
                    .body(ApiResponse.failure("No emails found in " + folder + " for the given school"));
        }

        List<String> emailIds = emailPage.getContent().stream()
                .map(EmailMessage::getEmailId)
                .collect(Collectors.toList());
        List<EmailMessage> emailsWithAttachments = emailMessageRepository.findByEmailIdsWithAttachments(emailIds,
                schoolId, userId);

        List<EmailResponse> responseList = emailsWithAttachments.stream()
                .map(ResponsesBuilder::buildEmailResponse)
                .collect(Collectors.toList());

        log.info("Emails fetched successfully for schoolId: {}, userId: {} in folder of {} with data {}", schoolId,
                userId, folder, responseList);
        ApiResponse<List<EmailResponse>> response = ApiResponse.success("Emails fetched successfully", responseList);
        response.setPage(emailPage.getNumber());
        response.setTotalPages(emailPage.getTotalPages());
        return ResponseEntity.ok(response);
    }

    public ResponseEntity<ApiResponse<EmailResponse>> updateEmailStatus(String schoolId, String emailId,
            String status, String userId) {
        log.info("Updating status for emailId: {}, schoolId: {}, userId: {}, status: {}", emailId, schoolId, userId,
                status);

        EmailMessage email = emailMessageRepository.findByEmailIdAndUserId(emailId, schoolId, userId);
        if (email == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.failure("Email not found or not authorized"));
        }

        EmailMessage.Status newStatus;
        try {
            newStatus = EmailMessage.Status.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.failure("Invalid status: " + status));
        }

        if (userId.equals(email.getSenderId())) {
            if (email.getSenderStatus() == EmailMessage.Status.SENT && newStatus == EmailMessage.Status.DRAFT) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.failure("Cannot change a sent email to draft"));
            }
            email.setSenderStatus(newStatus);
        } else if (userId.equals(email.getRecipientId())) {
            email.setRecipientStatus(newStatus);
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.failure("Unauthorized user for this email"));
        }

        email.setUpdatedAt(LocalDateTime.now());
        email.setUpdatedBy(userId);

        EmailMessage updatedEmail = emailMessageRepository.save(email);
        EmailResponse response = ResponsesBuilder.buildEmailResponse(updatedEmail);

        return ResponseEntity.ok(ApiResponse.success("Email status updated successfully", response));
    }

    public ResponseEntity<ApiResponse<EmailResponse>> markEmailAsRead(String schoolId, String emailId, String userId) {
        log.info("Marking email as read for emailId: {}, schoolId: {}, userId: {}", emailId, schoolId, userId);

        EmailMessage email = emailMessageRepository.findByEmailIdAndUserId(emailId, schoolId, userId);
        if (email == null || !email.getRecipientId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.failure("Email not found or not authorized"));
        }

        if (email.getIsRead()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.failure("Email is already marked as read"));
        }

        email.setIsRead(true);
        email.setUpdatedAt(LocalDateTime.now());
        email.setUpdatedBy(userId);

        EmailMessage updatedEmail = emailMessageRepository.save(email);
        EmailResponse response = ResponsesBuilder.buildEmailResponse(updatedEmail);

        return ResponseEntity.ok(ApiResponse.success("Email marked as read successfully", response));
    }

    public ResponseEntity<ApiResponse<EmailResponse>> deleteEmail(String schoolId, String emailId, String userId) {
        log.info("Soft deleting email for emailId: {}, schoolId: {}, userId: {}", emailId, schoolId, userId);

        EmailMessage email = emailMessageRepository.findByEmailIdAndUserId(emailId, schoolId, userId);
        if (email == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.failure("Email not found or already deleted for this user"));
        }

        if (userId.equals(email.getSenderId())) {
            if (email.getSenderDeleted()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.failure("Email already deleted by sender"));
            }
            email.setSenderDeleted(true);
        } else if (userId.equals(email.getRecipientId())) {
            if (email.getRecipientDeleted()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.failure("Email already deleted by recipient"));
            }
            email.setRecipientDeleted(true);
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.failure("Unauthorized user for this email"));
        }

        if (email.getSenderDeleted() && email.getRecipientDeleted()) {
            email.setIsActive(false); // Soft delete only when both have deleted
        }

        email.setUpdatedAt(LocalDateTime.now());
        email.setUpdatedBy(userId);

        EmailMessage deletedEmail = emailMessageRepository.save(email);
        EmailResponse response = ResponsesBuilder.buildEmailResponse(deletedEmail);

        return ResponseEntity.ok(ApiResponse.success("Email soft deleted successfully", response));
    }

    public ResponseEntity<ApiResponse<EmailResponse>> getEmailsById(String schoolId, String emailId, String userId) {
        log.info("Fetching emails for schoolId: {}, userId: {}, emailId: {}", schoolId, userId, emailId);

        EmailMessage existingEmail = emailMessageRepository.findByEmailIdAndUserId(emailId, schoolId, userId);

        if (existingEmail == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.failure("Failed to retrieve email or already deleted"));
        }

        EmailResponse response = ResponsesBuilder.buildEmailResponse(existingEmail);
        return ResponseEntity.ok(ApiResponse.success("Email retrieved successfully", response));
    }
}