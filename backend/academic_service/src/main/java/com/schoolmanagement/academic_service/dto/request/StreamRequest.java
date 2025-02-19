package com.schoolmanagement.academic_service.dto.request;

import javax.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StreamRequest {

    @NotBlank(message = "Stream Name must not be null or Empty")
    private String streamName;

    @NotBlank(message = "Stream Code must not be null or Empty")
    private String streamCode;
}
