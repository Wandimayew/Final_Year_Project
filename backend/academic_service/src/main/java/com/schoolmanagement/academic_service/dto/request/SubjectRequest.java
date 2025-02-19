package com.schoolmanagement.academic_service.dto.request;

import javax.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SubjectRequest {

    @NotBlank(message = "Subject Name must not be null or Empty")
    private String subjectName;

    @NotBlank(message = "Credit Hours must not be null or Empty")
    private Integer creditHours;

    @NotBlank(message = "Subject Code must not be null or Empty")
    private String subjectCode;

    // @NotBlank(message = "Class Id must not be null or Empty")
    private Long classId;
}

