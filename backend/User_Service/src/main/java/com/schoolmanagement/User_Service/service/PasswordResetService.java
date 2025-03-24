package com.schoolmanagement.User_Service.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.schoolmanagement.User_Service.exception.TokenExpiredException;
import com.schoolmanagement.User_Service.model.PasswordResetToken;
import com.schoolmanagement.User_Service.model.User;
import com.schoolmanagement.User_Service.repository.PasswordTokenRepository;
import com.schoolmanagement.User_Service.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional
@Slf4j
public class PasswordResetService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordTokenRepository tokenRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.password-reset.token.expiration}")
    private long tokenExpirationMinutes;

    public void initiatePasswordReset(String email) {
        User user = userRepository.findByEmail(email);

        String token = generateToken();
        LocalDateTime expiryDate = LocalDateTime.now().plusMinutes(tokenExpirationMinutes);

        PasswordResetToken passwordResetToken = new PasswordResetToken();
        passwordResetToken.setToken(token);
        passwordResetToken.setUser(user);
        passwordResetToken.setExpiryDate(expiryDate);

        tokenRepository.save(passwordResetToken);

        String resetLink = "http://localhost:3000/reset-password?token=" + token;
        sendResetEmail(user.getEmail(), resetLink);
    }

    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token);

        log.info("tokenn is {}:", resetToken);
        if (resetToken.isExpired()) {
            tokenRepository.delete(resetToken);
            throw new TokenExpiredException("Token has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        tokenRepository.delete(resetToken);
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
