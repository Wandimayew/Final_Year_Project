package com.schoolmanagement.User_Service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
public class UserLoginActivityDTO {
    private Long id;
    private String userId;
    private String schoolId;
    private String activityType;
    private String details;
    private String ipAddress;
    private String deviceInfo;
    private LocalDateTime timestamp;

    // Fields for list-based responses (used in getAllAdmins and
    // getAllAdminActivity)
    private List<UserResponseDTO> users;
    private String message;

    // Constructor for list-based responses
    public UserLoginActivityDTO(List<UserResponseDTO> users, String message) {
        this.users = users;
        this.message = message;
    }

    // Constructor for individual activity (matches UserActivity fields)
    public UserLoginActivityDTO(Long id, String userId, String schoolId, String activityType, String details,
            String ipAddress, String deviceInfo, LocalDateTime timestamp) {
        this.id = id;
        this.userId = userId;
        this.schoolId = schoolId;
        this.activityType = activityType;
        this.details = details;
        this.ipAddress = ipAddress;
        this.deviceInfo = deviceInfo;
        this.timestamp = timestamp;
    }
}