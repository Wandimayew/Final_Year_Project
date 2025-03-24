package com.schoolmanagement.User_Service.dto;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class UserLoginActivityDTO {

    private String userId;
    private String username;
    private String lastLogin; // ISO 8601 string
    private String schoolId;

    public UserLoginActivityDTO(String userId, String username, String lastLogin, String schoolId) {
        this.userId = userId;
        this.username = username;
        this.lastLogin = lastLogin;
        this.schoolId = schoolId;
    }
}
