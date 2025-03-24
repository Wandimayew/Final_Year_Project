package com.schoolmanagement.User_Service.service;

import com.schoolmanagement.User_Service.exception.TokenExpiredException;
import com.schoolmanagement.User_Service.model.PasswordResetToken;
import com.schoolmanagement.User_Service.model.User;
import com.schoolmanagement.User_Service.repository.PasswordTokenRepository;
import com.schoolmanagement.User_Service.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.password-reset.token.expiration:15}") // Default to 15 minutes if not set
    private long tokenExpirationMinutes;

    public void initiatePasswordReset(String email, String schoolId) {
        log.info("Initiating password reset for email: {} in schoolId: {}", email, schoolId);
        User user = userRepository.findByEmailAndSchoolId(email, schoolId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "User not found with email: " + email + " in school: " + schoolId));

        String token = generateToken();
        LocalDateTime expiryDate = LocalDateTime.now().plusMinutes(tokenExpirationMinutes);

        PasswordResetToken passwordResetToken = new PasswordResetToken();
        passwordResetToken.setToken(token);
        passwordResetToken.setUser(user);
        passwordResetToken.setExpiryDate(expiryDate);

        tokenRepository.save(passwordResetToken);

        String resetLink = "http://localhost:3000/reset-password?token=" + token;
        sendResetEmail(user.getEmail(), resetLink);
        log.info("Password reset initiated for user: {} with token: {}", user.getUserId(), token);
    }

    public void resetPassword(String token, String newPassword) {
        log.info("Resetting password with token: {}", token);
        PasswordResetToken resetToken = tokenRepository.findByToken(token);

        if (resetToken.isExpired() || resetToken == null) {
            tokenRepository.delete(resetToken);
            throw new TokenExpiredException("Token has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        tokenRepository.delete(resetToken);
        log.info("Password reset successful for user: {}", user.getUserId());
    }

    private String generateToken() {
        return UUID.randomUUID().toString();
    }

    private void sendResetEmail(String email, String resetLink) {
        String subject = "Password Reset Request";
        String body = String.format(
                "Please click on the following link to reset your password: %s\n" +
                        "This link will expire in %d minutes.",
                resetLink, tokenExpirationMinutes);
        emailService.sendEmail(email, subject, body);
    }
}