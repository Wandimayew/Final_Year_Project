package com.schoolmanagement.User_Service.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.schoolmanagement.User_Service.config.BooleanConverter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(columnNames = { "username", "school_id" }))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @Column(unique = true, name = "user_id", updatable = false, nullable = false)
    private String userId;

    @NotNull(message = "School ID cannot be null")
    @Column(name = "school_id", nullable = false)
    private String schoolId;

    @NotBlank(message = "Username cannot be blank")
    @Size(min = 5, max = 30, message = "Username must be between 5 and 30 characters")
    @Column(unique = true)
    private String username;

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email should be valid")
    @Column(unique = true)
    private String email;

    @NotBlank(message = "Password hash cannot be blank")
    private String password;

    @NotNull(message = "Active status cannot be null")
    @Column(name = "is_active", nullable = false)
    @Convert(converter = BooleanConverter.class)
    private Boolean isActive;

    private LocalDateTime lastLogin;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @NotBlank(message = "Created by cannot be blank")
    @Column(nullable = false, name = "created_by")
    private String createdBy;

    @Column(nullable = true, name = "updated_by")
    private String updatedBy;

    @ManyToMany(fetch = FetchType.EAGER) // Use EAGER for now to ensure loading
    @JoinTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id", referencedColumnName = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id", referencedColumnName = "role_id"))
    private Set<Role> roles = new HashSet<>();

    @Override
    public String toString() {
        return "User{userId='" + userId + "', username='" + username + "', schoolId='" + schoolId + "', isActive="
                + isActive + "}";
    }
}