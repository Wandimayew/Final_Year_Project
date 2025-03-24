package com.schoolmanagement.communication_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class EmailStatusUpdateRequest {

    @NotBlank(message = "Status cannot be blank")
    private String status;
}