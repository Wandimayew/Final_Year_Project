package com.schoolmanagement.User_Service.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.schoolmanagement.User_Service.model.PasswordResetToken;

public interface PasswordTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    PasswordResetToken findByToken(String token);
    
}