package com.schoolmanagement.User_Service.service;

import com.schoolmanagement.User_Service.dto.JwtResponse;
import com.schoolmanagement.User_Service.dto.LoginRequest;
import com.schoolmanagement.User_Service.dto.SignupRequest;
import com.schoolmanagement.User_Service.dto.SignupResponse;
import com.schoolmanagement.User_Service.dto.UserLoginActivityDTO;
import com.schoolmanagement.User_Service.model.RefreshToken;
import com.schoolmanagement.User_Service.model.Role;
import com.schoolmanagement.User_Service.model.User;
import com.schoolmanagement.User_Service.model.UserActivity;
import com.schoolmanagement.User_Service.repository.RefreshTokenRepository;
import com.schoolmanagement.User_Service.repository.RoleRepository;
import com.schoolmanagement.User_Service.repository.UserActivityRepository;
import com.schoolmanagement.User_Service.repository.UserRepository;
import com.schoolmanagement.User_Service.utils.JwtUtil;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final UserActivityRepository userActivityRepository;
    private final SchoolPermissionService schoolPermissionService;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public JwtResponse authenticateUser(LoginRequest loginRequest, HttpServletRequest request) {
        log.info("Authenticating user: {}", loginRequest.getUsername());
        Authentication auth;
        try {
            auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));
            SecurityContextHolder.getContext().setAuthentication(auth);
        } catch (BadCredentialsException e) {
            log.error("Bad credentials for user: {}", loginRequest.getUsername(), e);
            throw new AuthenticationException("Invalid username or password") {
            };
        } catch (AuthenticationException e) {
            log.error("Authentication failed for user: {}", loginRequest.getUsername(), e);
            throw e;
        }

        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new AuthenticationException("User not found") {
                });

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        String accessToken = jwtUtils.generateJwtToken(user);
        String refreshToken = generateRefreshToken(user);

        logActivity(user.getUserId(), user.getSchoolId(), "LOGIN", "User logged in successfully", request);

        List<String> roleNames = jwtUtils.extractRoles(accessToken);

        return JwtResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getUserId())
                .schoolId(user.getSchoolId())
                .username(user.getUsername())
                .email(user.getEmail())
                .roles(roleNames)
                .message("Login successful")
                .build();
    }

    @Transactional
    public void logout(HttpServletRequest request) {
        String token = extractTokenFromRequest(request);
        if (token == null || !jwtUtils.validateToken(token)) {
            log.warn("Invalid or missing token for logout");
            throw new IllegalArgumentException("Invalid or missing token");
        }

        String userId = jwtUtils.extractUserId(token);
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        refreshTokenRepository.deleteByUserId(userId);
        logActivity(userId, user.getSchoolId(), "LOGOUT", "User logged out successfully", request);
        SecurityContextHolder.clearContext();
        log.info("User {} logged out successfully", user.getUsername());
    }

    @Transactional
    public JwtResponse refreshToken(String refreshToken, HttpServletRequest request) {
        RefreshToken storedToken = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (!storedToken.isActive() || storedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            log.warn("Refresh token is inactive or expired: {}", refreshToken);
            throw new IllegalArgumentException("Refresh token is invalid or expired");
        }

        User user = userRepository.findByUserId(storedToken.getUserId())
                .orElseThrow(() -> new IllegalStateException("User not found"));

        // Rotate refresh token
        refreshTokenRepository.delete(storedToken); // Invalidate old token
        String newRefreshToken = generateRefreshToken(user);

        String newAccessToken = jwtUtils.generateJwtToken(user);
        List<String> roleNames = jwtUtils.extractRoles(newAccessToken);

        logActivity(user.getUserId(), user.getSchoolId(), "TOKEN_REFRESH", "Access token refreshed", request);

        return JwtResponse.builder()
                .token(newAccessToken)
                .refreshToken(newRefreshToken)
                .userId(user.getUserId())
                .schoolId(user.getSchoolId())
                .username(user.getUsername())
                .email(user.getEmail())
                .roles(roleNames)
                .message("Token refreshed successfully")
                .build();
    }

    private String generateRefreshToken(User user) {
        String token = Base64.getEncoder().encodeToString(UUID.randomUUID().toString().getBytes());
        RefreshToken refreshTokenEntity = new RefreshToken();
        refreshTokenEntity.setToken(token);
        refreshTokenEntity.setUserId(user.getUserId());
        refreshTokenEntity.setSchoolId(user.getSchoolId());
        refreshTokenEntity.setCreatedAt(LocalDateTime.now());
        refreshTokenEntity.setExpiresAt(LocalDateTime.now().plusDays(1));
        refreshTokenEntity.setActive(true);
        refreshTokenRepository.save(refreshTokenEntity);
        return token;
    }

    @Transactional
    public List<UserLoginActivityDTO> getAllLoginActivity(String schoolId) {
        log.info("Fetching all user activity for school: {}", schoolId);
        List<UserActivity> activities = userActivityRepository.findBySchoolId(schoolId);

        if (activities.isEmpty()) {
            throw new EntityNotFoundException("No activity found for school: " + schoolId);
        }

        return activities.stream()
                .map(activity -> new UserLoginActivityDTO(
                        activity.getId(),
                        activity.getUserId(),
                        activity.getSchoolId(),
                        activity.getActivityType(),
                        activity.getDetails(),
                        activity.getIpAddress(),
                        activity.getDeviceInfo(),
                        activity.getTimestamp()))
                .collect(Collectors.toList());
    }

    public void logActivity(String userId, String schoolId, String activityType, String details,
            HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        String deviceInfo = request.getHeader("User-Agent");
        UserActivity activity = new UserActivity(userId, schoolId, activityType, details, ipAddress, deviceInfo);
        userActivityRepository.save(activity);
        log.info("Logged activity: {} for user: {} in school: {}", activityType, userId, schoolId);
    }

    @Transactional
    public SignupResponse registerUser(SignupRequest signupRequest, String userId) {
        log.info("Registering user with username: {} for schoolId: {}", signupRequest.getUsername(),
                signupRequest.getSchoolId());

        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            log.info("Username is already taken: {}", signupRequest.getUsername());
            throw new RuntimeException("Username is already taken: " + signupRequest.getUsername());
        }
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            log.info("Email is already in use: {}", signupRequest.getEmail());
            throw new RuntimeException("Email is already in use: " + signupRequest.getEmail());
        }

        String newUserId = generateUserId(signupRequest.getSchoolId());
        log.info("New user ID is: {}", newUserId);

        User user = new User();
        user.setUserId(newUserId);
        user.setSchoolId(signupRequest.getSchoolId());
        user.setUsername(signupRequest.getUsername());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setIsActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setCreatedBy(userId);

        String defaultRole = signupRequest.getRoles() == null || signupRequest.getRoles().isEmpty()
                ? "ROLE_STUDENT"
                : signupRequest.getRoles().iterator().next();
        schoolPermissionService.assignDefaultRoleToUser(user, defaultRole, signupRequest.getSchoolId(),
                userRepository.findByUserId(userId).orElseThrow());

        User savedUser = userRepository.save(user);
        log.info("User registered with ID: {} for schoolId: {}", newUserId, signupRequest.getSchoolId());

        return SignupResponse.builder()
                .userId(savedUser.getUserId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .schoolId(savedUser.getSchoolId())
                .roles(savedUser.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                .build();
    }

    @Transactional
    public SignupResponse registerAdmin(SignupRequest signupRequest, String superadminUserId) {
        log.info("Registering Admin with username: {} for schoolId: {}", signupRequest.getUsername(),
                signupRequest.getSchoolId());

        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            log.info("Username is already taken: {}", signupRequest.getUsername());
            throw new RuntimeException("Username is already taken: " + signupRequest.getUsername());
        }
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            log.info("Email is already in use: {}", signupRequest.getEmail());
            throw new RuntimeException("Email is already in use: " + signupRequest.getEmail());
        }

        String newUserId = generateUserId(signupRequest.getSchoolId());
        log.info("New user ID is: {}", newUserId);

        User admin = new User();
        admin.setUserId(newUserId);
        admin.setSchoolId(signupRequest.getSchoolId());
        admin.setUsername(signupRequest.getUsername());
        admin.setEmail(signupRequest.getEmail());
        admin.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        admin.setIsActive(true);
        admin.setCreatedAt(LocalDateTime.now());
        admin.setUpdatedAt(LocalDateTime.now());
        admin.setCreatedBy(superadminUserId);

        User superadmin = userRepository.findByUserId(superadminUserId)
                .orElseThrow(() -> new RuntimeException("Superadmin not found: " + superadminUserId));

        log.info("super admin is found : {}", superadmin);

        log.info("Assign Roles ROLE_ADMIN admin");
        User savedAdmin = userRepository.save(admin);

        log.info("user saved and entering create role :{}", savedAdmin);

        if (!roleRepository.existsBySchoolId(signupRequest.getSchoolId())) {
            log.info("creating role for school");
            schoolPermissionService.createDefaultPermissionsAndRoles(signupRequest.getSchoolId(), superadmin,
                    savedAdmin);
        }
        log.info("created role for school");

        log.info("assignDefaultRoleToUser");
        schoolPermissionService.assignDefaultRoleToUser(savedAdmin, "ROLE_ADMIN", signupRequest.getSchoolId(),
                superadmin);
        log.info("after assignDefaultRoleToUser");

        log.info("Admin registered with ID: {} for schoolId: {}", newUserId, signupRequest.getSchoolId());

        return SignupResponse.builder()
                .userId(savedAdmin.getUserId())
                .username(savedAdmin.getUsername())
                .email(savedAdmin.getEmail())
                .schoolId(savedAdmin.getSchoolId())
                .roles(savedAdmin.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                .build();
    }

    private String generateUserId(String schoolId) {
        String lastUserId = userRepository
                .findTopUserIdBySchoolId(schoolId, PageRequest.of(0, 1))
                .stream()
                .findFirst()
                .orElse(null);

        int nextNumber = 1;
        if (lastUserId != null && lastUserId.startsWith(schoolId)) {
            String numberPart = lastUserId.substring(schoolId.length());
            try {
                nextNumber = Integer.parseInt(numberPart) + 1;
            } catch (NumberFormatException e) {
                log.warn("Failed to parse number part from lastUserId '{}'. Defaulting to 1.", lastUserId);
            }
        }

        return schoolId + String.format("%03d", nextNumber);
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    @Scheduled(fixedRate = 24 * 60 * 60 * 1000) // Run daily
    @Transactional
    public void cleanupExpiredRefreshTokens() {
        log.info("Running cleanup for expired refresh tokens");
        List<RefreshToken> expiredTokens = refreshTokenRepository.findAll().stream()
                .filter(token -> token.getExpiresAt().isBefore(LocalDateTime.now()))
                .collect(Collectors.toList());
        refreshTokenRepository.deleteAll(expiredTokens);
        log.info("Deleted {} expired refresh tokens", expiredTokens.size());
    }
}