package com.schoolmanagement.communication_service.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.schoolmanagement.communication_service.config.CustomUserPrincipal;
import com.schoolmanagement.communication_service.dto.request.NotificationTemplateRequest;
import com.schoolmanagement.communication_service.dto.response.ApiResponse;
import com.schoolmanagement.communication_service.dto.response.NotificationTemplateResponse;
import com.schoolmanagement.communication_service.service.NotificationTemplateService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@RequestMapping("/communication/api")
@RequiredArgsConstructor
public class NotificationTemplateController {

    private final NotificationTemplateService notificationTemplateService;

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

    @GetMapping("/{schoolId}/getNotificationTemplateById/{notificationTemplate_id}")
    public ResponseEntity<ApiResponse<NotificationTemplateResponse>> getNotificationTemplateById(
            @PathVariable String schoolId,
            @PathVariable("notificationTemplate_id") Long templateId) {
        return notificationTemplateService.getNotificationTemplateById(schoolId, templateId);
    }

    @GetMapping("/{schoolId}/getAllNotificationTemplate")
    public ResponseEntity<ApiResponse<List<NotificationTemplateResponse>>> getAllNotificationTemplate(
            @PathVariable String schoolId) {
        return notificationTemplateService.getAllNotificationTemplates(schoolId);
    }

    @PostMapping("/{schoolId}/createNotificationTemplate")
    public ResponseEntity<ApiResponse<NotificationTemplateResponse>> createNotificationTemplate(
            @PathVariable String schoolId,
            @RequestBody NotificationTemplateRequest notificationTemplateRequest) {
        return notificationTemplateService.createNotificationTemplate(schoolId, notificationTemplateRequest);
    }

    @PutMapping("/{schoolId}/updateNotificationTemplate/{notificationTemplate_id}")
    public ResponseEntity<ApiResponse<NotificationTemplateResponse>> updateNotificationTemplate(
            @PathVariable String schoolId,
            @PathVariable Long templateId,
            @RequestBody NotificationTemplateRequest notificationTemplateRequest) {
        return notificationTemplateService.updateNotificationTemplate(schoolId, templateId,
                notificationTemplateRequest);
    }

    @DeleteMapping("/{schoolId}/deleteNotificationTemplate/{notificationTemplate_id}")
    public ResponseEntity<ApiResponse<NotificationTemplateResponse>> deleteNotificationTemplate(
            @PathVariable String schoolId,
            @PathVariable Long templateId) {
        return notificationTemplateService.deleteNotificationTemplate(schoolId, templateId);
    }
}
