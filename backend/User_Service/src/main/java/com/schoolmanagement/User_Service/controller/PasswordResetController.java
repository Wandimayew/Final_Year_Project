package com.schoolmanagement.User_Service.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.schoolmanagement.User_Service.dto.PasswordResetDto;
import com.schoolmanagement.User_Service.dto.PasswordResetRequestDto;
import com.schoolmanagement.User_Service.service.PasswordResetService;

@RestController
@RequestMapping("/api/auth")
public class PasswordResetController {
    
    @Autowired
    private PasswordResetService passwordResetService;
    
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody PasswordResetRequestDto request) {
        passwordResetService.initiatePasswordReset(request.getEmail());
        return ResponseEntity.ok().body("Password reset link sent to email");
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody PasswordResetDto resetDto) {
        passwordResetService.resetPassword(resetDto.getToken(), resetDto.getNewPassword());
        return ResponseEntity.ok().body("Password reset successful");
    }
}