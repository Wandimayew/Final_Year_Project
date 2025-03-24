package com.schoolmanagement.communication_service.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "email_messages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "email_id", updatable = false, nullable = false)
    private String emailId;

    @NotBlank(message = "School ID cannot be blank")
    @Column(name = "school_id", nullable = false)
    private String schoolId;

    @NotBlank(message = "Sender ID cannot be blank")
    @Column(name = "sender_id", nullable = false)
    private String senderId;

    @NotBlank(message = "Recipient ID cannot be blank")
    @Column(name = "recipient_id", nullable = false)
    private String recipientId;

    @NotBlank(message = "Subject cannot be blank")
    @Column(name = "subject", length = 255, nullable = false)
    private String subject;

    @NotBlank(message = "Body cannot be blank")
    @Column(name = "body", columnDefinition = "TEXT", nullable = false)
    private String body;

    @NotNull(message = "Sender status cannot be null")
    @Enumerated(EnumType.STRING)
    @Column(name = "sender_status", nullable = false)
    private Status senderStatus; // Sender-specific status

    @NotNull(message = "Recipient status cannot be null")
    @Enumerated(EnumType.STRING)
    @Column(name = "recipient_status", nullable = false)
    private Status recipientStatus; // Recipient-specific status

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @NotNull(message = "isRead cannot be null")
    @Column(name = "is_read", nullable = false)
    private Boolean isRead;

    @NotNull(message = "isDraft cannot be null")
    @Column(name = "is_draft", nullable = false)
    private Boolean isDraft;

    @NotNull(message = "isActive cannot be null")
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @NotNull(message = "senderDeleted cannot be null")
    @Column(name = "sender_deleted", nullable = false)
    private Boolean senderDeleted = false; // New field for sender deletion

    @NotNull(message = "recipientDeleted cannot be null")
    @Column(name = "recipient_deleted", nullable = false)
    private Boolean recipientDeleted = false; // New field for recipient deletion

    @NotBlank(message = "The Person that who create this cannot be blank")
    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "updated_by")
    private String updatedBy;

    @OneToMany(mappedBy = "emailMessage", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Attachment> attachments = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "announcement_id")
    private Announcement announcement;

    public enum Status {
        INBOX, SENT, IMPORTANT, TRASH, DRAFT
    }
}