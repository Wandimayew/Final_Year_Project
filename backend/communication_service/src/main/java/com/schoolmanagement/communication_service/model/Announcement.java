package com.schoolmanagement.communication_service.model;

import java.time.LocalDateTime;

import com.schoolmanagement.communication_service.enums.AnnouncementStatus;
import com.schoolmanagement.communication_service.enums.AnnouncementType;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "announcement")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long announcementId;

    private String schoolId;
    private String title;
    @Lob
    @Column(columnDefinition = "TEXT")
    private String message;

    private String targetAudience;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @Enumerated(EnumType.STRING)
    private AnnouncementStatus status;

    @Enumerated(EnumType.STRING)
    private AnnouncementType type;

    private String authorId;
    private Boolean isActive;

    private LocalDateTime createdAt;
    private String createdBy;

    private LocalDateTime updatedAt;
    private String updatedBy;

    @ManyToOne
    @JoinColumn(name = "notificationTemplateId")
    private NotificationTemplate template;

    /**
     * One Announcement can create multiple Notifications.
     */
    @OneToMany(mappedBy = "announcement", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Notification> notifications;

    @Column(nullable = true)
    private String rejectionReason;
}
