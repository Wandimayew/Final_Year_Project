package com.schoolmanagement.User_Service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRoleCountDTO {
    private long students;
    private long parents;
    private long teachers;
    private long staff;
}