package com.schoolmanagement.academic_service.dto.request;

import javax.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SectionRequest {
    
    @NotBlank(message = "Section Name must not be null or Empty")
    private String sectionName;

    @NotBlank(message = "Section Capacity can  not be null or Empty")
    private Integer capacity;

    @NotBlank(message = "Class id can  not be null or Empty")
    private Long classId;
}
