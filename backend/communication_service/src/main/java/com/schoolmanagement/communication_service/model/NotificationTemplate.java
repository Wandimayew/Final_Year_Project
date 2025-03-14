package com.schoolmanagement.communication_service.model;

import java.time.LocalDateTime;

import com.schoolmanagement.communication_service.enums.NotificationType;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "notification_template")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationTemplateId;

    @NotBlank(message = "School ID cannot be blank")
    private String schoolId;

    @NotNull(message = "Type cannot be null")
    @Enumerated(EnumType.STRING)
    private NotificationType type;

    @NotBlank(message = "Name cannot be empty")
    @Size(max = 100, message = "Name cannot exceed 100 characters")
    private String name;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    private String updatedBy;
    private boolean isActive;

    /**
     * One NotificationTemplate can be used by multiple Notifications.
     */
    @OneToMany(mappedBy = "notificationTemplate", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Notification> notifications = new ArrayList<>();

    @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Announcement> announcements = new ArrayList<>();

}
