package com.schoolmanagement.Staff_Service.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;


@Data
public class QRCodeRequestDTO {

    private String schoolId;

    @NotNull
    @Min(0) @Max(23)
    private Integer startTimeHour;
    
    @NotNull
    @Min(0) @Max(59)
    private Integer startTimeMinute;
    
    @NotNull
    @Min(0) @Max(23)
    private Integer endTimeHour;
    
    @NotNull
    @Min(0) @Max(59)
    private Integer endTimeMinute;
    
    private String generatedBy;
}
