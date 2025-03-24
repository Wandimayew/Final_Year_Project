package com.schoolmanagement.communication_service.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.schoolmanagement.communication_service.enums.NotificationType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationId;

    @NotBlank(message = "School ID cannot be blank")
    @Column(name = "school_id", nullable = false)
    private String schoolId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "communication_preference_id")
    @JsonIgnore
    private CommunicationPreference communicationPreference;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notification_template_id")
    private NotificationTemplate notificationTemplate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "announcement_id")
    private Announcement announcement;

    // Optional: Used only for single-recipient notifications; null for
    // multi-recipient
    @Column(name = "recipient_id")
    private String recipientId;

    @Lob
    @Column(name = "message", columnDefinition = "TEXT", nullable = false)
    private String message;

    @NotNull(message = "Type cannot be null")
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private NotificationType type;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @NotNull(message = "isActive cannot be null")
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @NotBlank(message = "Created by cannot be blank")
    @Column(name = "created_by", updatable = false)
    private String createdBy;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private String updatedBy;

    @Version
    private Long version; // For optimistic locking

    @OneToMany(mappedBy = "notification", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<UserNotificationStatus> userNotificationStatuses; // Added relationship
}