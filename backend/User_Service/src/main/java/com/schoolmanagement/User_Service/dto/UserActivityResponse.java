package com.schoolmanagement.User_Service.dto;

import java.util.List;

import lombok.Data;

@Data
public class UserActivityResponse {
    private String status;
    private String message;
    private List<UserLoginActivityDTO> activities;

    public UserActivityResponse(String status, String message, List<UserLoginActivityDTO> activities) {
        this.status = status;
        this.message = message;
        this.activities = activities;
    }
}
