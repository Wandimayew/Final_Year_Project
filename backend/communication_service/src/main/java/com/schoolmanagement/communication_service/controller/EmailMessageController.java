package com.schoolmanagement.communication_service.controller;

import com.schoolmanagement.communication_service.config.CustomUserPrincipal;
import com.schoolmanagement.communication_service.dto.request.EmailRequest;
import com.schoolmanagement.communication_service.dto.request.EmailStatusUpdateRequest;
import com.schoolmanagement.communication_service.dto.response.ApiResponse;
import com.schoolmanagement.communication_service.dto.response.EmailResponse;
import com.schoolmanagement.communication_service.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@Slf4j
@RequestMapping("/communication/api")
@RequiredArgsConstructor
public class EmailMessageController {

    private final EmailService emailService;

    private String getUserIdFromSecurityContext() {
        CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return principal.getUserId();
    }

    private void validateSchoolId(String schoolId) {
        CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        String tokenSchoolId = principal.getSchoolId();
        if (!schoolId.equals(tokenSchoolId)) {
            log.error("School ID mismatch: Path schoolId={}, Token schoolId={}", schoolId, tokenSchoolId);
            throw new SecurityException("Unauthorized: School ID mismatch");
        }
    }

    // consumes = MediaType.MULTIPART_FORM_DATA_VALUE,@ModelAttribute

    @PostMapping(value = "/{schoolId}/compose", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<EmailResponse>> composeEmail(
            @PathVariable String schoolId,
            @ModelAttribute EmailRequest emailRequest, // Use @ModelAttribute instead of @RequestPart
            @RequestPart(value = "attachments", required = false) MultipartFile[] attachments,
            @RequestParam(defaultValue = "false") boolean send,
            HttpServletRequest request) {
        log.info("Controller reached with Content-Type: {}", request.getContentType());
        validateSchoolId(schoolId);
        log.info("school is valid with endpoint check up");
        String userId = getUserIdFromSecurityContext();
        log.info("user id is correct : {}", userId);
        emailRequest.setSenderId(userId); // Still set senderId from context

        log.info("Composing email for schoolId: {}, userId: {}, send: {}, with attachments: {}",
                schoolId, userId, send, attachments != null ? attachments.length : 0);
        return emailService.composeEmail(schoolId, emailRequest, attachments, send, userId);
    }

    @GetMapping("/{schoolId}/getEmailsByFolder/{folder}")
    public ResponseEntity<ApiResponse<List<EmailResponse>>> getEmailsByFolder(
            @PathVariable String schoolId,
            @PathVariable String folder,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "sentAt,desc") String sort) {
        validateSchoolId(schoolId);
        String userId = getUserIdFromSecurityContext();

        log.info("Fetching emails for schoolId: {}, userId: {}, folder: {}, page: {}, size: {}, sort: {}",
                schoolId, userId, folder, page, size, sort);
        return emailService.getEmailsByFolder(schoolId, folder, userId, page, size, sort);
    }

    @GetMapping("/{schoolId}/getEmailsById/detail/{emailId}")
    public ResponseEntity<ApiResponse<EmailResponse>> getEmailsById(
            @PathVariable String schoolId,
            @PathVariable String emailId) {
        validateSchoolId(schoolId);
        String userId = getUserIdFromSecurityContext();

        log.info("Fetching emails for schoolId: {}, userId: {}, emailId: {}",
                schoolId, userId, emailId);
        return emailService.getEmailsById(schoolId, emailId, userId);
    }

    @PutMapping("/{schoolId}/updateEmailStatus/{emailId}/status")
    public ResponseEntity<ApiResponse<EmailResponse>> updateEmailStatus(
            @PathVariable String schoolId,
            @PathVariable String emailId,
            @Valid @RequestBody EmailStatusUpdateRequest statusRequest) {
        validateSchoolId(schoolId);
        String userId = getUserIdFromSecurityContext();

        log.info("Updating status for emailId: {}, schoolId: {}, userId: {}, status: {}",
                emailId, schoolId, userId, statusRequest.getStatus());
        return emailService.updateEmailStatus(schoolId, emailId, statusRequest.getStatus(), userId);
    }

    @PutMapping("/{schoolId}/markEmailAsRead/{emailId}/read")
    public ResponseEntity<ApiResponse<EmailResponse>> markEmailAsRead(
            @PathVariable String schoolId,
            @PathVariable String emailId) {
        validateSchoolId(schoolId);
        String userId = getUserIdFromSecurityContext();

        log.info("Marking email as read for emailId: {}, schoolId: {}, userId: {}", emailId, schoolId, userId);
        return emailService.markEmailAsRead(schoolId, emailId, userId);
    }

    @DeleteMapping("/{schoolId}/deleteEmail/{emailId}")
    public ResponseEntity<ApiResponse<EmailResponse>> deleteEmail(
            @PathVariable String schoolId,
            @PathVariable String emailId) {
        validateSchoolId(schoolId);
        String userId = getUserIdFromSecurityContext();

        log.info("Soft deleting email for emailId: {}, schoolId: {}, userId: {}", emailId, schoolId, userId);
        return emailService.deleteEmail(schoolId, emailId, userId);
    }
}