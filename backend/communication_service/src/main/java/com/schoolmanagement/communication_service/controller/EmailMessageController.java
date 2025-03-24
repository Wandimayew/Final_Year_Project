package com.schoolmanagement.communication_service.controller;

import com.schoolmanagement.communication_service.config.JwtToken;
import com.schoolmanagement.communication_service.dto.request.EmailRequest;
import com.schoolmanagement.communication_service.dto.request.EmailStatusUpdateRequest;
import com.schoolmanagement.communication_service.dto.response.ApiResponse;
import com.schoolmanagement.communication_service.dto.response.EmailResponse;
import com.schoolmanagement.communication_service.service.EmailService;
import com.schoolmanagement.communication_service.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@Slf4j
@RequestMapping("/communication/api")
@RequiredArgsConstructor
public class EmailMessageController {

    private final EmailService emailService;
    private final JwtUtil jwtUtil;

    private void validateSchoolId(String schoolId, String token) {
        String tokenSchoolId = jwtUtil.extractSchoolId(token);
        if (!schoolId.equals(tokenSchoolId)) {
            log.error("School ID mismatch: Path schoolId={}, Token schoolId={}", schoolId, tokenSchoolId);
            throw new SecurityException("Unauthorized: School ID mismatch");
        }
    }

    @PostMapping(value = "/{schoolId}/compose", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<EmailResponse>> composeEmail(
            @PathVariable String schoolId,
            @Valid @RequestPart("email") EmailRequest emailRequest,
            @RequestPart(value = "attachments", required = false) MultipartFile[] attachments,
            @RequestParam(defaultValue = "false") boolean send,
            @JwtToken String token) {
        log.info("tokennnn: {}", token);
        validateSchoolId(schoolId, token);
        String userId = jwtUtil.extractUserId(token);
        emailRequest.setSenderId(userId);

        log.info("Composing email for schoolId: {}, userId: {}, send: {}, with attachments: {}",
                schoolId, userId, send, attachments != null ? attachments.length : 0);
        return emailService.composeEmail(schoolId, emailRequest, attachments, send, userId);
    }

    @GetMapping("/{schoolId}/emails/{folder}")
    public ResponseEntity<ApiResponse<List<EmailResponse>>> getEmailsByFolder(
            @PathVariable String schoolId,
            @PathVariable String folder,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "sentAt,desc") String sort,
            @JwtToken String token) {
        validateSchoolId(schoolId, token);
        String userId = jwtUtil.extractUserId(token);

        log.info("Fetching emails for schoolId: {}, userId: {}, folder: {}, page: {}, size: {}, sort: {}",
                schoolId, userId, folder, page, size, sort);
        return emailService.getEmailsByFolder(schoolId, folder, userId, page, size, sort);
    }

    @GetMapping("/{schoolId}/emails/detail/{emailId}")
    public ResponseEntity<ApiResponse<EmailResponse>> getEmailsById(
            @PathVariable String schoolId,
            @PathVariable String emailId,
            @JwtToken String token) {
        validateSchoolId(schoolId, token);
        String userId = jwtUtil.extractUserId(token);

        log.info("Fetching emails for schoolId: {}, userId: {}, emailId: {}",
                schoolId, userId, emailId);
        return emailService.getEmailsById(schoolId, emailId, userId);
    }

    @PutMapping("/{schoolId}/emails/{emailId}/status")
    public ResponseEntity<ApiResponse<EmailResponse>> updateEmailStatus(
            @PathVariable String schoolId,
            @PathVariable String emailId,
            @Valid @RequestBody EmailStatusUpdateRequest statusRequest,
            @JwtToken String token) {
        validateSchoolId(schoolId, token);
        String userId = jwtUtil.extractUserId(token);

        log.info("Updating status for emailId: {}, schoolId: {}, userId: {}, status: {}",
                emailId, schoolId, userId, statusRequest.getStatus());
        return emailService.updateEmailStatus(schoolId, emailId, statusRequest.getStatus(), userId);
    }

    @PutMapping("/{schoolId}/emails/{emailId}/read")
    public ResponseEntity<ApiResponse<EmailResponse>> markEmailAsRead(
            @PathVariable String schoolId,
            @PathVariable String emailId,
            @JwtToken String token) {
        validateSchoolId(schoolId, token);
        String userId = jwtUtil.extractUserId(token);

        log.info("Marking email as read for emailId: {}, schoolId: {}, userId: {}", emailId, schoolId, userId);
        return emailService.markEmailAsRead(schoolId, emailId, userId);
    }

    @DeleteMapping("/{schoolId}/emails/{emailId}")
    public ResponseEntity<ApiResponse<EmailResponse>> deleteEmail(
            @PathVariable String schoolId,
            @PathVariable String emailId,
            @JwtToken String token) {
        validateSchoolId(schoolId, token);
        String userId = jwtUtil.extractUserId(token);

        log.info("Soft deleting email for emailId: {}, schoolId: {}, userId: {}", emailId, schoolId, userId);
        return emailService.deleteEmail(schoolId, emailId, userId);
    }
}