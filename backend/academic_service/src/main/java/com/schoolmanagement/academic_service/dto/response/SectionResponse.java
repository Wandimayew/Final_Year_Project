package com.schoolmanagement.academic_service.dto.response;

import com.schoolmanagement.academic_service.model.TimeTable;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SectionResponse {

    private Long sectionId;

    private String schoolId;

    private String sectionName;

    private Integer capacity;

    // private TimeTable timeTable;

    private Long classId;

    private Boolean isActive;
}
