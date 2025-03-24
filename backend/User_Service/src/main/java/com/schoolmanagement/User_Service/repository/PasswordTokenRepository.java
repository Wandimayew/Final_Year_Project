package com.schoolmanagement.User_Service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.schoolmanagement.User_Service.model.PasswordResetToken;

public interface PasswordTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    // Find a password reset token by its value
    @Query("SELECT prt FROM PasswordResetToken prt WHERE prt.token = :token")
    PasswordResetToken findByToken(@Param("token") String token);

    // Optional: Add a method to find expired tokens for cleanup
    @Query("SELECT prt FROM PasswordResetToken prt WHERE prt.expiryDate < CURRENT_TIMESTAMP")
    List<PasswordResetToken> findExpiredTokens();
}