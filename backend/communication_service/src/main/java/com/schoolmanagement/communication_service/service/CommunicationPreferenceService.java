package com.schoolmanagement.communication_service.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.schoolmanagement.communication_service.dto.request.CommunicationPreferenceRequest;
import com.schoolmanagement.communication_service.dto.response.ApiResponse;
import com.schoolmanagement.communication_service.dto.response.CommunicationPreferenceResponse;
import com.schoolmanagement.communication_service.model.CommunicationPreference;
import com.schoolmanagement.communication_service.repository.CommunicationPreferenceRepository;
import com.schoolmanagement.communication_service.utils.ResponsesBuilder;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class CommunicationPreferenceService {

        private final CommunicationPreferenceRepository communicationPreferenceRepository;

        // Create or update a communication preference
        @Transactional
        public ResponseEntity<ApiResponse<CommunicationPreferenceResponse>> addPreference(String schoolId,
                        CommunicationPreferenceRequest communicationPreferenceRequest) {
                log.info("Adding or updating communication preference for schoolId: {}, userId: {}", schoolId,
                                communicationPreferenceRequest.getUserId());

                Optional<CommunicationPreference> existingPreference = communicationPreferenceRepository
                                .findBySchoolIdAndUserId(schoolId, communicationPreferenceRequest.getUserId());

                if (existingPreference.isEmpty()) {
                        // Create a new communication preference
                        CommunicationPreference newPreference = CommunicationPreference.builder()
                                        .schoolId(schoolId)
                                        .userId(communicationPreferenceRequest.getUserId())
                                        .emailEnabled(true) // Default to true, can be updated later
                                        .smsEnabled(false)
                                        .pushEnabled(false)
                                        .inAppEnabled(false)
                                        .isActive(true)
                                        .createdAt(LocalDateTime.now())
                                        .createdBy("admin") // Replace with authenticated user
                                        .updatedAt(LocalDateTime.now())
                                        .updatedBy("admin")
                                        .build();

                        CommunicationPreference savedPreference = communicationPreferenceRepository.save(newPreference);
                        CommunicationPreferenceResponse response = ResponsesBuilder
                                        .buildPreferenceResponse(savedPreference);

                        return ResponseEntity.ok(
                                        ApiResponse.success("Communication Preference created successfully", response));
                } else {
                        // Update the existing preference
                        return updatePreference(schoolId, existingPreference.get().getUserId(),
                                        communicationPreferenceRequest);
                }
        }

        // Update an existing communication preference
        @Transactional
        public ResponseEntity<ApiResponse<CommunicationPreferenceResponse>> updatePreference(String schoolId,
                        String userId, CommunicationPreferenceRequest communicationPreferenceRequest) {
                log.info("Updating communication preference with ID: {} for schoolId: {}", userId, schoolId);

                CommunicationPreference existingPreference = communicationPreferenceRepository
                                .findBySchoolIdAndUserId(schoolId, userId)
                                .orElseThrow(() -> new RuntimeException("Communication Preference not found"));

                // Ensure the record belongs to the provided school
                if (!existingPreference.getSchoolId().equals(schoolId)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                        .body(ApiResponse.failure(
                                                        "You are not authorized to update this communication preference"));
                }

                // Check if the preference is active
                if (!existingPreference.getIsActive()) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                        .body(ApiResponse.failure("Communication Preference not found"));
                }

                // Update fields
                existingPreference.setEmailEnabled(communicationPreferenceRequest.isEmailEnabled());
                existingPreference.setSmsEnabled(communicationPreferenceRequest.isSmsEnabled());
                existingPreference.setPushEnabled(communicationPreferenceRequest.isPushEnabled());
                existingPreference.setInAppEnabled(communicationPreferenceRequest.isInAppEnabled());
                existingPreference.setUpdatedBy("admin"); // Replace with authenticated user
                existingPreference.setUpdatedAt(LocalDateTime.now());

                CommunicationPreference updatedPreference = communicationPreferenceRepository.save(existingPreference);
                CommunicationPreferenceResponse response = ResponsesBuilder.buildPreferenceResponse(updatedPreference);

                return ResponseEntity
                                .ok(ApiResponse.success("Communication Preference updated successfully", response));
        }

        // Retrieve all communication preferences for a school
        public ResponseEntity<ApiResponse<List<CommunicationPreferenceResponse>>> getAllPreferences(String schoolId) {
                log.info("Fetching all communication preferences for schoolId: {}", schoolId);

                List<CommunicationPreference> preferences = communicationPreferenceRepository.findBySchoolId(schoolId);

                if (preferences == null || preferences.isEmpty()) {
                        return ResponseEntity.status(HttpStatus.NO_CONTENT)
                                        .body(ApiResponse.failure(
                                                        "No communication preferences found for the given school"));
                }

                List<CommunicationPreferenceResponse> responseList = preferences.stream()
                                .filter(CommunicationPreference::getIsActive)
                                .map(ResponsesBuilder::buildPreferenceResponse)
                                .collect(Collectors.toList());

                return ResponseEntity.ok(
                                ApiResponse.success("Communication Preferences fetched successfully", responseList));
        }

        // Retrieve a communication preference by ID
        public ResponseEntity<ApiResponse<CommunicationPreferenceResponse>> getPreferenceById(String schoolId,
                        Long preferenceId, String userId) {
                log.info("Fetching communication preference with ID: {} for schoolId: {}", preferenceId, schoolId);

                CommunicationPreference existingPreference = communicationPreferenceRepository.findById(preferenceId)
                                .orElseThrow(() -> new RuntimeException("Communication Preference not found"));

                if (!existingPreference.getSchoolId().equals(schoolId)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                        .body(ApiResponse.failure(
                                                        "You are not authorized to view this communication preference"));
                }

                if (!existingPreference.getIsActive()) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                        .body(ApiResponse.failure("Communication Preference not found"));
                }

                CommunicationPreferenceResponse response = ResponsesBuilder.buildPreferenceResponse(existingPreference);

                return ResponseEntity
                                .ok(ApiResponse.success("Communication Preference fetched successfully", response));
        }

        // Soft-delete a communication preference
        @Transactional
        public ResponseEntity<ApiResponse<CommunicationPreferenceResponse>> deletePreference(String schoolId,
                        Long preferenceId) {
                log.info("Deleting communication preference with ID: {} for schoolId: {}", preferenceId, schoolId);

                CommunicationPreference existingPreference = communicationPreferenceRepository.findById(preferenceId)
                                .orElseThrow(() -> new RuntimeException("Communication Preference not found"));

                if (!existingPreference.getSchoolId().equals(schoolId)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                        .body(ApiResponse.failure(
                                                        "You are not authorized to delete this communication preference"));
                }

                if (!existingPreference.getIsActive()) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                        .body(ApiResponse.failure("Communication Preference not found"));
                }

                existingPreference.setIsActive(false);
                existingPreference.setUpdatedAt(LocalDateTime.now());
                existingPreference.setUpdatedBy("admin"); // Replace with authenticated user
                communicationPreferenceRepository.save(existingPreference);

                return ResponseEntity.ok(ApiResponse.success("Communication Preference deleted successfully", null));
        }

        public ResponseEntity<ApiResponse<CommunicationPreferenceResponse>> getCommunicationPreferenceByUserId(
                        String schoolId, String userId) {
                log.info("Fetching communication preference with ID: {} for schoolId: {}", userId, schoolId);

                CommunicationPreference existingPreference = communicationPreferenceRepository
                                .findBySchoolIdAndUserId(schoolId, userId)
                                .orElse(null);

                if (existingPreference == null) {
                        // Create a new communication preference
                        CommunicationPreference newPreference = CommunicationPreference.builder()
                                        .schoolId(schoolId)
                                        .userId(userId)
                                        .emailEnabled(true) // Default to true, can be updated later
                                        .smsEnabled(false)
                                        .pushEnabled(false)
                                        .inAppEnabled(false)
                                        .isActive(true)
                                        .createdAt(LocalDateTime.now())
                                        .createdBy(userId) // Replace with authenticated user
                                        .updatedAt(LocalDateTime.now())
                                        .updatedBy(userId)
                                        .build();

                        CommunicationPreference savedPreference = communicationPreferenceRepository.save(newPreference);
                        CommunicationPreferenceResponse response = ResponsesBuilder
                                        .buildPreferenceResponse(savedPreference);

                        return ResponseEntity.ok(
                                        ApiResponse.success("Communication Preference created successfully", response));
                }
                if (!existingPreference.getSchoolId().equals(schoolId)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                        .body(ApiResponse.failure(
                                                        "You are not authorized to view this communication preference"));
                }

                if (!existingPreference.getIsActive()) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                        .body(ApiResponse.failure("Communication Preference not found"));
                }

                CommunicationPreferenceResponse response = ResponsesBuilder.buildPreferenceResponse(existingPreference);

                return ResponseEntity.ok(ApiResponse.success("Communication Preference fetched successfully for user",
                                response));

        }
}