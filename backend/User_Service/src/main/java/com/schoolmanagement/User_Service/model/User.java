package com.schoolmanagement.User_Service.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "user_id", updatable = false, nullable = false)
    private Long userId;

    @NotNull(message = "School ID cannot be null")
    @Column(name = "school_id", nullable = false)
    private Long schoolId;

    @NotBlank(message = "Full name cannot be blank")
    @Size(max = 50, message = "Full name cannot exceed 50 characters")
    private String fullName;

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
    private Boolean isActive;

    @Size(max = 255, message = "Address cannot exceed 255 characters")
    private String userAddress;

    // @Lob
    // @Column(columnDefinition = "BLOB")
    // private String userPhoto;

    private LocalDateTime lastLogin;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @NotBlank(message = "Created by cannot be blank")
    private String createdBy;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    @NotBlank(message = "Phone number cannot be blank")
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Phone number must be between 10 and 15 digits and may optionally start with a '+'")
    private String phoneNumber;

    // @NotBlank(message = "Gender cannot be blank")
    // @Pattern(regexp = "MALE|FEMALE", message = "Invalid gender. Allowed values are MALE or FEMALE.")
    // @Column(nullable = false)
    // private String gender;
}
