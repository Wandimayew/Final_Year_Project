package com.schoolmanagement.communication_service.controller;

import com.schoolmanagement.communication_service.config.JwtToken;
import com.schoolmanagement.communication_service.dto.request.NotificationRequest;
import com.schoolmanagement.communication_service.dto.response.ApiResponse;
import com.schoolmanagement.communication_service.dto.response.NotificationResponse;
import com.schoolmanagement.communication_service.service.NotificationService;
import com.schoolmanagement.communication_service.utils.JwtUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Slf4j
@RequestMapping("/communication/api")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final JwtUtil jwtUtil;

    /**
     * Validates that the schoolId from the path matches the schoolId in the JWT
     * token.
     *
     * @param schoolId the school ID from the path
     * @param token    the JWT token from the request header
     * @throws SecurityException if the school IDs do not match
     */
    private void validateSchoolId(String schoolId, String token) {
        String tokenSchoolId = jwtUtil.extractSchoolId(token);
        if (!schoolId.equals(tokenSchoolId)) {
            log.error("School ID mismatch: Path schoolId={}, Token schoolId={}", schoolId, tokenSchoolId);
            throw new SecurityException("Unauthorized: School ID mismatch");
        }
    }

    @GetMapping("/{schoolId}/getNotificationById/{notification_id}")
    public ResponseEntity<ApiResponse<NotificationResponse>> getNotificationById(
            @PathVariable String schoolId,
            @PathVariable("notification_id") Long notificationId) {
        log.info("Fetching notification with ID: {} for schoolId: {}", notificationId, schoolId);
        return notificationService.getNotificationById(schoolId, notificationId);
    }

    @GetMapping("/{schoolId}/getAllNotification")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getAllNotification(@PathVariable String schoolId) {
        log.info("Fetching all notifications for schoolId: {}", schoolId);
        return notificationService.getAllNotifications(schoolId);
    }

    @PostMapping("/{schoolId}/createNotification")
    public ResponseEntity<ApiResponse<NotificationResponse>> createNotification(
            @PathVariable String schoolId,
            @RequestBody NotificationRequest notificationRequest) {
        log.info("Creating notification for schoolId: {}", schoolId);
        return notificationService.createNotification(schoolId, notificationRequest);
    }

    @PutMapping("/{schoolId}/updateNotification/{notification_id}")
    public ResponseEntity<ApiResponse<NotificationResponse>> updateNotification(
            @PathVariable String schoolId,
            @PathVariable Long notificationId,
            @RequestBody NotificationRequest notificationRequest) {
        log.info("Updating notification with ID: {} for schoolId: {}", notificationId, schoolId);
        return notificationService.updateNotification(schoolId, notificationId, notificationRequest);
    }

    @DeleteMapping("/{schoolId}/deleteNotification/{notification_id}")
    public ResponseEntity<ApiResponse<NotificationResponse>> deleteNotification(
            @PathVariable String schoolId,
            @PathVariable Long notificationId) {
        log.info("Deleting notification with ID: {} for schoolId: {}", notificationId, schoolId);
        return notificationService.deleteNotification(schoolId, notificationId);
    }

    @GetMapping("/{schoolId}/notifications/unread")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getUnreadNotifications(
            @PathVariable String schoolId,
            @JwtToken String token) {
        validateSchoolId(schoolId, token);
        String userId = jwtUtil.extractUserId(token);
        log.info("Fetching unread notifications for userId: {} in schoolId: {}", userId, schoolId);
        return notificationService.getUnreadNotifications(schoolId, userId);
    }

    @PostMapping("/{schoolId}/notifications/mark-read/{notificationId}")
    public ResponseEntity<ApiResponse<String>> markNotificationAsRead(@PathVariable String schoolId,
            @PathVariable Long notificationId,
            @JwtToken String token) {
        validateSchoolId(schoolId, token);
        String userId = jwtUtil.extractUserId(token);
        log.info("Marking notification as read with ID: {}", notificationId);
        return notificationService.markNotificationAsRead(notificationId, userId);
    }
}