package com.schoolmanagement.Staff_Service.dto;

import lombok.Data;

@Data
public class StaffUpdateDTO extends StaffRequestDTO {

    private TeacherRequestDTO teacherRequest;
}
