package com.schoolmanagement.Staff_Service.dto;

import lombok.Data;

@Data
public class TeacherRequestDTO {

    private Long staffId;

    private String schoolId;

    private Long streamId;

    private String subjectSpecialization;

    private String qualification;

    private String experience;
}
