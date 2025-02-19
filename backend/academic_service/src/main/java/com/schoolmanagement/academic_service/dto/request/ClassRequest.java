package com.schoolmanagement.academic_service.dto.request;

import javax.validation.constraints.NotBlank;

import lombok.Data;

@Data
public class ClassRequest {

    @NotBlank(message = "Class Name must not be null or Empty")
    private String className;

    @NotBlank(message = "Academic Year of class must not be null or Empty")
    String academicYear;

    // private List<Subject> subjectId;

    // @OneToOne(mappedBy = "classId", cascade = CascadeType.ALL)
    // private TimeTable timeTable;

    @NotBlank(message = "Stream id can  not be null or Empty")
    private Long streamId;

    // @OneToMany(mappedBy = "classId", cascade = CascadeType.ALL, orphanRemoval =
    // true)
    // private List<Section> sections;
}
