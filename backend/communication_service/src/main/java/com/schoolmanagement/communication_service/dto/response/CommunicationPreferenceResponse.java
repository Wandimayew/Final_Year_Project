package com.schoolmanagement.communication_service.dto.response;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CommunicationPreferenceResponse {
    
    private Long communicationPreferenceId;

    private String schoolId;

    private String userId;

    private boolean emailEnabled;
    private boolean pushEnabled;
    private boolean smsEnabled;
    private boolean inAppEnabled;
    
    private Boolean isActive;

    private LocalDateTime createdAt;
    private String createdBy;

    private String updatedBy;
    private LocalDateTime updatedAt;

}
