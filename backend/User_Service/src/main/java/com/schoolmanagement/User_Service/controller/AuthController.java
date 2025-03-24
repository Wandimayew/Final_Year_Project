package com.schoolmanagement.User_Service.controller;

import com.schoolmanagement.User_Service.config.CustomUserPrincipal;
import com.schoolmanagement.User_Service.dto.JwtResponse;
import com.schoolmanagement.User_Service.dto.LoginRequest;
import com.schoolmanagement.User_Service.dto.SignupRequest;
import com.schoolmanagement.User_Service.dto.SignupResponse;
import com.schoolmanagement.User_Service.dto.UserLoginActivityDTO;
import com.schoolmanagement.User_Service.model.User;
import com.schoolmanagement.User_Service.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/api")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    private void validateSchoolId(String schoolId) {
        CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        String tokenSchoolId = principal.getSchoolId();
        if (!schoolId.equals(tokenSchoolId)) {
            log.error("School ID mismatch: Path schoolId={}, Token schoolId={}", schoolId, tokenSchoolId);
            throw new SecurityException("Unauthorized: School ID mismatch");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("Authenticating user: {}", loginRequest.getUsername());
        try {
            JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
            return ResponseEntity.ok(jwtResponse);
        } catch (AuthenticationException e) {
            log.warn("Authentication failed for user: {} - {}", loginRequest.getUsername(), e.getMessage());
            return ResponseEntity.badRequest().body(JwtResponse.builder().message(e.getMessage()).build());
        }
    }

    @GetMapping("/{schoolId}/activity")
    public ResponseEntity<List<UserLoginActivityDTO>> getAllLoginActivity(@PathVariable String schoolId) {
        validateSchoolId(schoolId);
        CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        String userId = principal.getUserId();
        List<UserLoginActivityDTO> activityList = authService.getAllLoginActivity(schoolId);
        return ResponseEntity.ok(activityList);
    }

    @PostMapping("/{schoolId}/register")
    public ResponseEntity<SignupResponse> registerUser(@Valid @RequestBody SignupRequest signupRequest,
            @PathVariable String schoolId) {
        log.info("Registering user with username: {} for schoolId: {}", signupRequest.getUsername(), schoolId);
        CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
        .getAuthentication().getPrincipal();
        String userId = principal.getUserId();
        signupRequest.setSchoolId(schoolId);

        validateSchoolId(schoolId);
        SignupResponse createdUser = authService.registerUser(signupRequest, userId);
        log.info("user registration request : {}", signupRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @PostMapping("/register")
    public ResponseEntity<SignupResponse> registerAdmin(@Valid @RequestBody SignupRequest signupRequest) {
        log.info("Registering admin with username: {} for schoolId: {}", signupRequest.getUsername(),
                signupRequest.getSchoolId());
        CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        String superadminUserId = principal.getUserId();
        SignupResponse createdAdmin = authService.registerAdmin(signupRequest, superadminUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdAdmin);
    }
}