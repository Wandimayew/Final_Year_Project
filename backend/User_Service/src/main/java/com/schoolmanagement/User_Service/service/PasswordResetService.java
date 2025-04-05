package com.schoolmanagement.User_Service.service;

import com.schoolmanagement.User_Service.dto.PendingPasswordResetResponse;
import com.schoolmanagement.User_Service.exception.TokenExpiredException;
import com.schoolmanagement.User_Service.model.PasswordResetToken;
import com.schoolmanagement.User_Service.model.User;
import com.schoolmanagement.User_Service.model.UserActivity;
import com.schoolmanagement.User_Service.repository.PasswordTokenRepository;
import com.schoolmanagement.User_Service.repository.UserActivityRepository;
import com.schoolmanagement.User_Service.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordTokenRepository tokenRepository;
    private final UserActivityRepository userActivityRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.password-reset.token.expiration:15}")
    private long tokenExpirationMinutes;

    public void initiatePasswordReset(String email, HttpServletRequest request) {
        log.info("Initiating password reset for email: {}", email);
        User user = userRepository.findByEmailAndSchoolId(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));

        // Check if user has ROLE_ADMIN or ROLE_SUPERADMIN
        boolean isAdmin = user.getRoles().stream().anyMatch(role -> role.getName().equals("ROLE_ADMIN"));
        boolean isSuperAdmin = user.getRoles().stream().anyMatch(role -> role.getName().equals("ROLE_SUPERADMIN"));

        String token = generateToken();
        PasswordResetToken passwordResetToken = new PasswordResetToken();
        passwordResetToken.setToken(token);
        passwordResetToken.setUser(user);
        passwordResetToken.setCreatedAt(LocalDateTime.now());
        passwordResetToken.setCreatedBy(user.getUsername());

        if (isAdmin || isSuperAdmin) {
            // For admins or superadmins: Set expiry immediately and send reset link
            passwordResetToken.setExpiryDate(LocalDateTime.now().plusMinutes(tokenExpirationMinutes));
            passwordResetToken.setApproved(true);
            tokenRepository.save(passwordResetToken);

            String resetLink = "http://localhost:3000/reset-password?token=" + token;
            sendResetEmail(user.getEmail(), resetLink, isAdmin, isSuperAdmin);
            String roleType = isSuperAdmin ? "Superadmin" : "Admin";
            logActivity(user.getUserId(), user.getSchoolId(), "PASSWORD_RESET_INITIATED",
                    roleType + " initiated password reset", request);
            log.info("Password reset link sent directly to {} user: {} with token: {}",
                    roleType.toLowerCase(), user.getUserId(), token);
        } else {
            // For non-admins/non-superadmins: No expiry until approved
            passwordResetToken.setApproved(false);
            passwordResetToken.setExpiryDate(null);
            tokenRepository.save(passwordResetToken);
            logActivity(user.getUserId(), user.getSchoolId(), "PASSWORD_RESET_INITIATED",
                    "User requested password reset - awaiting approval", request);
            log.info("Password reset request created for user: {} with token: {} - awaiting admin approval",
                    user.getUserId(), token);
        }
    }

    @SuppressWarnings("null")
    public void approvePasswordReset(String userId, String newPassword, HttpServletRequest request) {
        log.info("Approving password reset for user id: {}", userId);

        User user= userRepository.findByUserIdAndActive(userId);

        if (user == null) {
            new EntityNotFoundException("User with id :  " + userId + " not found.");
        }

        PasswordResetToken resetToken = tokenRepository.findByUser(user);

        log.info("Reset token for user");
        if (resetToken == null) {
            new EntityNotFoundException("Reset token not found for user id : " + userId);
        }

        if (resetToken.isApproved()) {
            if (resetToken.isExpired()) {
                tokenRepository.delete(resetToken);
                throw new TokenExpiredException("Approved token has expired");
            }
            throw new IllegalStateException("Reset token already approved");
        }
        String token= resetToken.getToken();

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        resetToken.setApproved(true);
        resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(tokenExpirationMinutes));
        tokenRepository.save(resetToken);

        String resetLink = "http://localhost:3000/reset-password?token=" + token;
        sendResetEmail(user.getEmail(), resetLink, false, false);
        logActivity(user.getUserId(), user.getSchoolId(), "PASSWORD_RESET_APPROVED",
                "Admin approved password reset", request);
        log.info("Password reset approved and link sent for user: {} with token: {}",
                user.getUserId(), token);
    }

    @SuppressWarnings("null")
    public void resetPassword(String token, String newPassword, HttpServletRequest request) {
        log.info("Resetting password with token: {}", token);
        PasswordResetToken resetToken = tokenRepository.findByToken(token);

        if (resetToken == null) {
            new EntityNotFoundException("Invalid reset token: " + token);
        }

        if (!resetToken.isApproved()) {
            throw new IllegalStateException("Reset token has not been approved by an admin");
        }

        if (resetToken.isExpired()) {
            tokenRepository.delete(resetToken);
            throw new TokenExpiredException("Token has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        tokenRepository.delete(resetToken);
        logActivity(user.getUserId(), user.getSchoolId(), "PASSWORD_RESET_COMPLETED",
                "Password reset completed", request);
        log.info("Password reset successful for user: {}", user.getUserId());
    }

    public List<PendingPasswordResetResponse> getPendingPasswordResetRequests() {
        log.info("Fetching all pending password reset requests");
        List<PasswordResetToken> pendingTokens = tokenRepository.findAllPendingApproval();
        return pendingTokens.stream()
                .map(token -> new PendingPasswordResetResponse(
                        token.getId(),
                        token.getUser().getUserId(),
                        token.getUser().getUsername(),
                        token.getUser().getEmail(),
                        token.getCreatedAt()))
                .collect(Collectors.toList());
    }

    private String generateToken() {
        return UUID.randomUUID().toString();
    }

    private void sendResetEmail(String email, String resetLink, boolean isAdmin, boolean isSuperAdmin) {
        String subject = "Password Reset Request";
        String body = (isAdmin || isSuperAdmin)
                ? String.format(
                        "Click the following link to reset your password: %s\nThis link will expire in %d minutes.",
                        resetLink, tokenExpirationMinutes)
                : String.format(
                        "Your password reset request has been approved. Click the following link to reset your password: %s\nThis link will expire in %d minutes.",
                        resetLink, tokenExpirationMinutes);

        emailService.sendEmail(email, subject, body);

        
    }

    private void logActivity(String userId, String schoolId, String activityType, String details,
            HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        String deviceInfo = request.getHeader("User-Agent");
        UserActivity activity = new UserActivity(userId, schoolId, activityType, details, ipAddress, deviceInfo);
        userActivityRepository.save(activity);
        log.info("Logged activity: {} for user: {} in school: {}", activityType, userId, schoolId);
    }
}