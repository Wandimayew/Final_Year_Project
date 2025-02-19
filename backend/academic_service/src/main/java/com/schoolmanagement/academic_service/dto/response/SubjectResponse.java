package com.schoolmanagement.academic_service.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SubjectResponse {
    
    private Long subjectId;
    
    private String schoolId;

    private String subjectName;

    private Integer creditHours;

    private String subjectCode;
}
