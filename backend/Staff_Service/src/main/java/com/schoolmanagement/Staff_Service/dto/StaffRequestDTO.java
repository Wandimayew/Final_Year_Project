package com.schoolmanagement.Staff_Service.dto;

import java.time.LocalDate;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.schoolmanagement.Staff_Service.enums.EmploymentStatus;
import com.schoolmanagement.Staff_Service.enums.Gender;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;


@Data
public class StaffRequestDTO {

    private Long userId;

    private Long schoolId;
    
    private String firstName;
    
    private String middleName;
    
    private String lastName;

    // private String username;
    
    private LocalDate dateOfJoining;
    
    // private String email;

    // private String password;

    private String phoneNumber;
    
    @Enumerated(EnumType.STRING)
    private EmploymentStatus status;
    
    private LocalDate dob;
    
    @Enumerated(EnumType.STRING)
    private Gender gender;
    
    private MultipartFile photo; 

    @JsonProperty("addressJson")
    private String addressJson;
    
}
