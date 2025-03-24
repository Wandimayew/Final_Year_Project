package com.schoolmanagement.communication_service.dto.request;



import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommunicationPreferenceRequest {

    @NotBlank(message = "School ID cannot be blank")
    private String schoolId;

    @NotBlank(message = "User ID cannot be blank")
    private String userId;

    private boolean emailEnabled;
    private boolean pushEnabled;
    private boolean smsEnabled;
    private boolean inAppEnabled;

}
