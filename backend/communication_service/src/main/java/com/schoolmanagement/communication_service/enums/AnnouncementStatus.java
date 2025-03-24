package com.schoolmanagement.communication_service.enums;

public enum AnnouncementStatus {
    PENDING, PUBLISHED, CANCELLED, DRAFT, // Announcement is in draft state
    SCHEDULED, // Announcement is scheduled to be sent
    SENT, // Announcement has been sent
    EXPIRED, // Announcement has passed its end date
    ARCHIVED
}