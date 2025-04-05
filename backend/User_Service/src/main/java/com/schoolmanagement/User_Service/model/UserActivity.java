package com.schoolmanagement.User_Service.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_activity")
@Data
@NoArgsConstructor
public class UserActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "school_id", nullable = false)
    private String schoolId;

    @Column(nullable = false)
    private String activityType; // e.g., LOGIN, PASSWORD_RESET_INITIATED, PASSWORD_RESET_APPROVED

    @Column
    private String details;

    @Column
    private String ipAddress; // New field

    @Column
    private String deviceInfo; // New field (e.g., browser or device type)

    @Column(nullable = false)
    private LocalDateTime timestamp;

    public UserActivity(String userId, String schoolId, String activityType, String details, 
                        String ipAddress, String deviceInfo) {
        this.userId = userId;
        this.schoolId = schoolId;
        this.activityType = activityType;
        this.details = details;
        this.ipAddress = ipAddress;
        this.deviceInfo = deviceInfo;
        this.timestamp = LocalDateTime.now();
    }
}