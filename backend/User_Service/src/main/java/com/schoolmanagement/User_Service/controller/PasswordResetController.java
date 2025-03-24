package com.schoolmanagement.User_Service.controller;

import com.schoolmanagement.User_Service.dto.PasswordResetDto;
import com.schoolmanagement.User_Service.dto.PasswordResetRequestDto;
import com.schoolmanagement.User_Service.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/api")
@RequiredArgsConstructor
@Slf4j
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody PasswordResetRequestDto request) {
        log.info("Initiating password reset for email: {} in schoolId: {}", request.getEmail(), request.getSchoolId());
        passwordResetService.initiatePasswordReset(request.getEmail(), request.getSchoolId());
        return ResponseEntity.ok("Password reset link sent to email");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody PasswordResetDto resetDto) {
        log.info("Resetting password with token: {}", resetDto.getToken());
        passwordResetService.resetPassword(resetDto.getToken(), resetDto.getNewPassword());
        return ResponseEntity.ok("Password reset successful");
    }
}