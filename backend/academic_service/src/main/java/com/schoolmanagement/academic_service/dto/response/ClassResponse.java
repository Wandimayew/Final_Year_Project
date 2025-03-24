package com.schoolmanagement.academic_service.dto.response;

import java.util.List;
import java.util.Set;

import com.schoolmanagement.academic_service.model.Stream;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ClassResponse {
    private Long classId;

    private String schoolId;

    private String className;

    String academicYear;

    private List<SubjectResponse> subjects;

    private Set<Stream> stream;

    private List<SectionResponse> sections;

    private Boolean status;
}
