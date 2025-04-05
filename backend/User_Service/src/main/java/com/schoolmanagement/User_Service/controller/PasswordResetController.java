package com.schoolmanagement.User_Service.controller;

import com.schoolmanagement.User_Service.dto.PasswordResetDto;
import com.schoolmanagement.User_Service.dto.PasswordResetRequestDto;
import com.schoolmanagement.User_Service.dto.PendingPasswordResetResponse;
import com.schoolmanagement.User_Service.service.PasswordResetService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/auth/api")
@RequiredArgsConstructor
@Slf4j
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody PasswordResetRequestDto request,
            HttpServletRequest httpRequest) {
        log.info("Initiating password reset for email: {}", request.getEmail());
        passwordResetService.initiatePasswordReset(request.getEmail(), httpRequest);
        return ResponseEntity
                .ok("Password reset request initiated. Check your email if you’re an admin, or wait for approval.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody PasswordResetDto resetDto,
            HttpServletRequest request) {
        log.info("Resetting password with token: {}", resetDto.getToken());
        passwordResetService.resetPassword(resetDto.getToken(), resetDto.getNewPassword(), request);
        return ResponseEntity.ok("Password reset successful");
    }

    @PostMapping("/approve-password-reset")
    public ResponseEntity<String> approvePasswordReset(
            @RequestParam String userId,
            @RequestParam String newPassword,
            HttpServletRequest request) {
        log.info("Admin approving password reset for userId: {}", userId);
        passwordResetService.approvePasswordReset(userId, newPassword, request);
        return ResponseEntity.ok("Password reset approved and email sent to user");
    }

    @GetMapping("/pending-password-resets")
    public ResponseEntity<List<PendingPasswordResetResponse>> getPendingPasswordResetRequests() {
        log.info("Admin fetching pending password reset requests");
        List<PendingPasswordResetResponse> pendingRequests = passwordResetService.getPendingPasswordResetRequests();
        return ResponseEntity.ok(pendingRequests);
    }
}