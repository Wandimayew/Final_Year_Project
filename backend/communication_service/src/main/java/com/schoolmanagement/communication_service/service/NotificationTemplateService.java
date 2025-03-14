package com.schoolmanagement.communication_service.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.schoolmanagement.communication_service.dto.request.NotificationTemplateRequest;
import com.schoolmanagement.communication_service.dto.response.ApiResponse;
import com.schoolmanagement.communication_service.dto.response.NotificationTemplateResponse;
import com.schoolmanagement.communication_service.model.NotificationTemplate;
import com.schoolmanagement.communication_service.repository.NotificationTemplateRepository;
import com.schoolmanagement.communication_service.utils.ResponsesBuilder;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationTemplateService {

    private final NotificationTemplateRepository notificationTemplateRepository;

    // Create a new notification template
    public ResponseEntity<ApiResponse<NotificationTemplateResponse>> createNotificationTemplate(String schoolId, NotificationTemplateRequest notificationTemplateRequest) {
        log.info("Creating notification template for schoolId: {}", schoolId);

        NotificationTemplate newTemplate = NotificationTemplate.builder()
                .schoolId(schoolId)
                .type(notificationTemplateRequest.getType())
                .name(notificationTemplateRequest.getName())
                .content(notificationTemplateRequest.getContent()) // Stores the styled HTML
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .createdBy("Admin")
                .updatedAt(LocalDateTime.now())
                .updatedBy("admin")
                .build();

        NotificationTemplate savedTemplate = notificationTemplateRepository.save(newTemplate);
        NotificationTemplateResponse response = ResponsesBuilder.buildNotificationTemplateResponse(savedTemplate);

        return ResponseEntity.ok(ApiResponse.success("Notification template created successfully", response));
    }

    // Update an existing notification template
    public ResponseEntity<ApiResponse<NotificationTemplateResponse>> updateNotificationTemplate(String schoolId, Long templateId, NotificationTemplateRequest request) {
        log.info("Updating notification template with  ID: {} for schoolId: {}", templateId, schoolId);

        NotificationTemplate existingTemplate = notificationTemplateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Notification template not found"));

        if (!existingTemplate.getSchoolId().equals(schoolId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.failure("You are not authorized to update this notification template"));
        }

        if (!existingTemplate.isActive()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.failure("Notification template not found"));
        }

        existingTemplate.setName(request.getName());
        existingTemplate.setContent(request.getContent()); // Updates with new styled HTML
        existingTemplate.setType(request.getType()); // Uncommented to allow type updates
        existingTemplate.setUpdatedBy("admin");
        existingTemplate.setUpdatedAt(LocalDateTime.now());

        NotificationTemplate updatedTemplate = notificationTemplateRepository.save(existingTemplate);
        NotificationTemplateResponse response = ResponsesBuilder.buildNotificationTemplateResponse(updatedTemplate);

        return ResponseEntity.ok(ApiResponse.success("Notification template updated successfully", response));
    }

    // Retrieve all notification templates for a given school
    public ResponseEntity<ApiResponse<List<NotificationTemplateResponse>>> getAllNotificationTemplates(String schoolId) {
        log.info("Fetching all notification templates for schoolId: {}", schoolId);

        List<NotificationTemplate> templates = notificationTemplateRepository.findBySchoolId(schoolId);

        if (templates == null || templates.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT)
                    .body(ApiResponse.failure("No notification templates found for the given school"));
        }

        List<NotificationTemplateResponse> responseList = templates.stream()
                .filter(NotificationTemplate::isActive)
                .map(ResponsesBuilder::buildNotificationTemplateResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Notification templates fetched successfully", responseList));
    }

    // Retrieve a notification template by ID for a given school
    public ResponseEntity<ApiResponse<NotificationTemplateResponse>> getNotificationTemplateById(String schoolId, Long templateId) {
        log.info("Fetching notification template with ID: {} for schoolId: {}", templateId, schoolId);

        NotificationTemplate template = notificationTemplateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Notification template not found"));

        if (!template.getSchoolId().equals(schoolId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.failure("You are not authorized to view this notification template"));
        }

        if (!template.isActive()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.failure("Notification template not found"));
        }

        NotificationTemplateResponse response = ResponsesBuilder.buildNotificationTemplateResponse(template);
        return ResponseEntity.ok(ApiResponse.success("Notification template fetched successfully", response));
    }

    // Soft-delete a notification template (set isActive to false)
    public ResponseEntity<ApiResponse<NotificationTemplateResponse>> deleteNotificationTemplate(String schoolId, Long templateId) {
        log.info("Deleting notification template with ID: {} for schoolId: {}", templateId, schoolId);

        NotificationTemplate template = notificationTemplateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Notification template not found"));

        if (!template.getSchoolId().equals(schoolId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.failure("You are not authorized to delete this notification template"));
        }

        if (!template.isActive()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.failure("Notification template not found"));
        }

        template.setActive(false);
        notificationTemplateRepository.save(template);

        return ResponseEntity.ok(ApiResponse.success("Notification template deleted successfully", null));
    }
}