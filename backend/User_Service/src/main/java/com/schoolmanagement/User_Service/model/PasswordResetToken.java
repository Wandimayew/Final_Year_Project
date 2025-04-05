package com.schoolmanagement.User_Service.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "passwordReset")
@AllArgsConstructor
@NoArgsConstructor
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "user_id", nullable = false)
    private User user;

    @NotNull(message = "Token cannot be null")
    @NotEmpty(message = "Token cannot be empty")
    private String token;

    private LocalDateTime expiryDate;

    @Column(nullable = false)
    private boolean isApproved = false; // New field to track approval status

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }

    private LocalDateTime createdAt;

    private String createdBy;
}