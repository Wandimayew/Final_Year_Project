package com.schoolmanagement.User_Service.controller;

import com.schoolmanagement.User_Service.dto.JwtResponse;
import com.schoolmanagement.User_Service.dto.LoginRequest;
import com.schoolmanagement.User_Service.dto.SignupRequest;
import com.schoolmanagement.User_Service.model.User;
import com.schoolmanagement.User_Service.service.AuthService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.naming.AuthenticationException;
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    // User Authentication
    @PostMapping("/login")
    public ResponseEntity<JwtResponse> authenticateUser(@RequestBody LoginRequest loginRequest) {
        log.info("we are in login");
        try {
            log.info("login request {}" + loginRequest);
            JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
            return ResponseEntity.ok(jwtResponse);
        } catch (AuthenticationException e) {
            return ResponseEntity.badRequest().body(
                JwtResponse.builder().message(e.getMessage()).build()
            );
        }
    }

    // User Registration
    @PostMapping(value = "/register")
    public ResponseEntity<User> registerUser(@RequestBody SignupRequest signupRequest) {
        log.info("we are in registering");
        log.info("register request {}" + signupRequest);
        User createdUser = authService.registerUser(signupRequest);
        return ResponseEntity.ok(createdUser);
    }
}
