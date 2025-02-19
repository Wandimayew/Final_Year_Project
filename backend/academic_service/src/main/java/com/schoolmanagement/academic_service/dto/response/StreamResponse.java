package com.schoolmanagement.academic_service.dto.response;

import java.util.List;

import lombok.Builder;
import lombok.Data;


@Data
@Builder
public class StreamResponse {
    
    private Long streamId;

    private String schoolId;

    private String streamName;

    private String streamCode;

    private List<String> classNames;
}

