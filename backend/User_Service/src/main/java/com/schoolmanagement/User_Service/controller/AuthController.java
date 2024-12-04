package com.schoolmanagement.User_Service.controller;

import com.schoolmanagement.User_Service.dto.JwtResponse;
import com.schoolmanagement.User_Service.dto.LoginRequest;
import com.schoolmanagement.User_Service.dto.SignupRequest;
import com.schoolmanagement.User_Service.model.User;
import com.schoolmanagement.User_Service.service.AuthService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.naming.AuthenticationException;
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // User Authentication
    @PostMapping("/login")
    public ResponseEntity<JwtResponse> authenticateUser(@RequestBody LoginRequest loginRequest) {
        try {
            JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
            return ResponseEntity.ok(jwtResponse);
        } catch (AuthenticationException e) {
            return ResponseEntity.badRequest().body(
                JwtResponse.builder().message(e.getMessage()).build()
            );
        }
    }

    // User Registration
    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<User> registerUser(@ModelAttribute SignupRequest signupRequest) {
        User createdUser = authService.registerUser(signupRequest);
        return ResponseEntity.ok(createdUser);
    }
}
