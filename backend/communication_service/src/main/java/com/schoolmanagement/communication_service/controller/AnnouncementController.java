package com.schoolmanagement.communication_service.controller;

import com.schoolmanagement.communication_service.config.JwtToken;
import com.schoolmanagement.communication_service.dto.request.AnnouncementRequest;
import com.schoolmanagement.communication_service.dto.request.CancelRequest;
import com.schoolmanagement.communication_service.dto.response.AnnouncementResponse;
import com.schoolmanagement.communication_service.dto.response.ApiResponse;
import com.schoolmanagement.communication_service.model.Announcement;
import com.schoolmanagement.communication_service.service.AnnouncementService;
import com.schoolmanagement.communication_service.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * REST controller for managing school-wide announcements.
 * Provides endpoints for creating, updating, retrieving, approving, requesting
 * approval, and deleting announcements.
 * Secured with JWT token validation using JwtUtil.
 */
@RestController
@Slf4j
@RequestMapping("/communication/api")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;
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

    /**
     * Retrieves an announcement by its ID.
     *
     * @param schoolId       the ID of the school
     * @param announcementId the ID of the announcement
     * @param token          the JWT token from the request header
     * @return a ResponseEntity containing the announcement response
     */
    @GetMapping("/{schoolId}/announcements/{announcementId}")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> getAnnouncementById(
            @PathVariable String schoolId,
            @PathVariable Long announcementId,
            @JwtToken String token) {
        validateSchoolId(schoolId, token);
        log.info("Fetching announcement ID: {} for schoolId: {}", announcementId, schoolId);
        return announcementService.getAnnouncementById(schoolId, announcementId);
    }

    /**
     * Retrieves all active announcements for a school.
     *
     * @param schoolId the ID of the school
     * @param token    the JWT token from the request header
     * @return a ResponseEntity containing a list of announcement responses
     */
    @GetMapping("/{schoolId}/announcements")
    public ResponseEntity<ApiResponse<List<AnnouncementResponse>>> getAllAnnouncements(
            @PathVariable String schoolId,
            @JwtToken String token) {
        validateSchoolId(schoolId, token);
        log.info("Fetching all announcements for schoolId: {}", schoolId);
        return announcementService.getAllAnnouncements(schoolId);
    }

    /**
     * Creates a new announcement.
     *
     * @param schoolId            the ID of the school
     * @param announcementRequest the request containing announcement details
     * @param token               the JWT token from the request header
     * @return a ResponseEntity containing the created announcement response
     */
    @PostMapping("/{schoolId}/announcements")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> createAnnouncement(
            @PathVariable String schoolId,
            @Valid @RequestBody AnnouncementRequest announcementRequest,
            @JwtToken String token) {
        validateSchoolId(schoolId, token);
        String userId = jwtUtil.extractUserId(token);
        log.info("Creating announcement for schoolId: {} by userId: {}", schoolId, userId);
        return announcementService.createAnnouncement(schoolId, announcementRequest,userId);
    }

    /**
     * Updates an existing announcement.
     *
     * @param schoolId            the ID of the school
     * @param announcementId      the ID of the announcement to update
     * @param announcementRequest the updated announcement details
     * @param token               the JWT token from the request header
     * @return a ResponseEntity containing the updated announcement response
     */
    @PutMapping("/{schoolId}/announcements/{announcementId}")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> updateAnnouncement(
            @PathVariable String schoolId,
            @PathVariable Long announcementId,
            @Valid @RequestBody AnnouncementRequest announcementRequest,
            @JwtToken String token) {
        validateSchoolId(schoolId, token);
        String userId = jwtUtil.extractUserId(token);
        log.info("Updating announcement ID: {} for schoolId: {} by userId: {}", announcementId, schoolId, userId);
        return announcementService.updateAnnouncement(schoolId, announcementId, announcementRequest);
    }

    /**
     * Approves an announcement, setting its status to PUBLISHED.
     * Only admins can call this endpoint (role check assumed in service or filter).
     *
     * @param schoolId       the ID of the school
     * @param announcementId the ID of the announcement to approve
     * @param token          the JWT token from the request header
     * @return a ResponseEntity containing the approved announcement response
     */
    @PutMapping("/{schoolId}/announcements/{announcementId}/approve")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> approveAnnouncement(
            @PathVariable String schoolId,
            @PathVariable Long announcementId,
            @JwtToken String token) {
        validateSchoolId(schoolId, token);
        String userId = jwtUtil.extractUserId(token);
        log.info("Approving announcement ID: {} for schoolId: {} by userId: {}", announcementId, schoolId, userId);
        return announcementService.approveAnnouncement(schoolId, announcementId, userId);
    }

    /**
     * Requests approval for an announcement, setting its status to PENDING.
     * Only the creator can call this endpoint (checked in service).
     *
     * @param schoolId       the ID of the school
     * @param announcementId the ID of the announcement to request approval for
     * @param token          the JWT token from the request header
     * @return a ResponseEntity containing the announcement response after
     *         requesting approval
     */
    @PutMapping("/{schoolId}/announcements/{announcementId}/request-approval")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> requestApproveAnnouncement(
            @PathVariable String schoolId,
            @PathVariable Long announcementId,
            @JwtToken String token) {
        validateSchoolId(schoolId, token);
        String userId = jwtUtil.extractUserId(token);
        log.info("Requesting approval for announcement ID: {} for schoolId: {} by userId: {}",
                announcementId, schoolId, userId);
        return announcementService.requestApproveAnnouncement(schoolId, announcementId, userId);
    }

    /**
     * Retrieves all announcements pending approval for a school.
     * Intended for admin users (role check assumed in service or filter).
     *
     * @param schoolId the ID of the school
     * @param token    the JWT token from the request header
     * @return a ResponseEntity containing a list of pending announcement responses
     */
    @GetMapping("/{schoolId}/announcements/pending-approval")
    public ResponseEntity<ApiResponse<List<AnnouncementResponse>>> getAllRequestApproval(
            @PathVariable String schoolId,
            @JwtToken String token) {
        validateSchoolId(schoolId, token);
        String userId = jwtUtil.extractUserId(token);
        log.info("Fetching all pending approval requests for schoolId: {} by userId: {}", schoolId, userId);
        return announcementService.getAllRequestApproval(schoolId, userId);
    }

    /**
     * Retrieves all pending announcements created by the authenticated user for a
     * school.
     *
     * @param schoolId the ID of the school
     * @param token    the JWT token from the request header
     * @return a ResponseEntity containing a list of the creator's pending
     *         announcements
     */
    @GetMapping("/{schoolId}/announcements/creator-pending")
    public ResponseEntity<ApiResponse<List<AnnouncementResponse>>> getCreatorPendingAnnouncements(
            @PathVariable String schoolId,
            @JwtToken String token) {
        validateSchoolId(schoolId, token);
        String userId = jwtUtil.extractUserId(token);
        log.info("Fetching creator's pending announcements for schoolId: {} by userId: {}", schoolId, userId);
        return announcementService.getCreatorPendingAnnouncements(schoolId, userId);
    }

    /**
     * Retrieves all announcements (except PENDING) created by the authenticated
     * user for a school, with pagination support.
     *
     * @param schoolId the ID of the school
     * @param token    the JWT token from the request header
     * @param pageable pagination information (page number, size, sorting)
     * @return a ResponseEntity containing an ApiResponse with a page of the
     *         creator's announcements
     */
    @GetMapping("/{schoolId}/announcements/my-announcements")
    public ResponseEntity<ApiResponse<Page<AnnouncementResponse>>> getMyAnnouncements(
            @PathVariable String schoolId,
            @JwtToken String token,
            Pageable pageable) {
        validateSchoolId(schoolId, token);
        String userId = jwtUtil.extractUserId(token);
        log.info("Fetching creator's announcements for schoolId: {} by userId: {}", schoolId, userId);
        return announcementService.getMyAnnouncements(schoolId, userId, pageable);
    }

    /**
     * Retrieves all announcements (except PENDING) created by the authenticated
     * user for a school, with pagination support.
     *
     * @param schoolId the ID of the school
     * @param token    the JWT token from the request header
     * @param pageable pagination information (page number, size, sorting)
     * @return a ResponseEntity containing an ApiResponse with a page of the
     *         creator's announcements
     */
    @GetMapping("/{schoolId}/announcements/my-announcements/status-draft")
    public ResponseEntity<ApiResponse<Page<AnnouncementResponse>>> getMyAnnouncementsByDraft(
            @PathVariable String schoolId,
            @JwtToken String token,
            Pageable pageable) {
        validateSchoolId(schoolId, token);
        String userId = jwtUtil.extractUserId(token);
        log.info("Fetching creator's announcements draft for schoolId: {} by userId: {}", schoolId, userId);
        return announcementService.getMyAnnouncementsDraft(schoolId, userId, pageable);
    }

    /**
     * Cancels an announcement, setting its status back to DRAFT with an optional
     * rejection reason.
     * Only admins can call this endpoint (role check assumed in service).
     *
     * @param schoolId       the ID of the school
     * @param announcementId the ID of the announcement to cancel
     * @param request        the request body containing the rejection reason
     *                       (optional)
     * @param token          the JWT token from the request header
     * @return a ResponseEntity containing the canceled announcement response
     */
    @PutMapping("/{schoolId}/announcements/{announcementId}/cancel")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> cancelAnnouncement(
            @PathVariable String schoolId,
            @PathVariable Long announcementId,
            @RequestBody(required = false) CancelRequest request,
            @JwtToken String token) {
        validateSchoolId(schoolId, token);
        String userId = jwtUtil.extractUserId(token);
        String rejectionReason = request != null ? request.getRejectionReason() : null;
        log.info("Canceling announcement ID: {} for schoolId: {} by userId: {} with reason: {}",
                announcementId, schoolId, userId, rejectionReason);
        return announcementService.cancelAnnouncement(schoolId, announcementId, userId, rejectionReason);
    }

    /**
     * Updates the status of an announcement.
     * Only the creator can update the status (checked in service).
     *
     * @param schoolId       the ID of the school
     * @param announcementId the ID of the announcement
     * @param status         the new status to apply (e.g., "DRAFT", "PUBLISHED",
     *                       "ARCHIVED")
     * @param token          the JWT token from the request header
     * @return a ResponseEntity containing the updated announcement response
     */
    @PutMapping("/{schoolId}/announcements/{announcementId}/status")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> updateAnnouncementStatus(
            @PathVariable String schoolId,
            @PathVariable Long announcementId,
            @RequestParam("status") String status,
            @JwtToken String token) {
        validateSchoolId(schoolId, token);
        String userId = jwtUtil.extractUserId(token);
        log.info("Updating status of announcement ID: {} for schoolId: {} to status: {} by userId: {}",
                announcementId, schoolId, status, userId);
        return announcementService.updateAnnouncementStatus(schoolId, announcementId, status, userId);
    }

    /**
     * Deletes an announcement (soft delete).
     *
     * @param schoolId       the ID of the school
     * @param announcementId the ID of the announcement to delete
     * @param token          the JWT token from the request header
     * @return a ResponseEntity with the deletion status
     */
    @DeleteMapping("/{schoolId}/announcements/{announcementId}")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> deleteAnnouncement(
            @PathVariable String schoolId,
            @PathVariable Long announcementId,
            @JwtToken String token) {
        validateSchoolId(schoolId, token);
        String userId = jwtUtil.extractUserId(token);
        log.info("Soft deleting announcement ID: {} for schoolId: {} by userId: {}",
                announcementId, schoolId, userId);
        return announcementService.deleteAnnouncement(schoolId, announcementId);
    }
}