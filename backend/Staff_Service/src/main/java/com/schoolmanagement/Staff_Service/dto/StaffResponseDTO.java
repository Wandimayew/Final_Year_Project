package com.schoolmanagement.Staff_Service.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;

import com.schoolmanagement.Staff_Service.enums.EmploymentStatus;
import com.schoolmanagement.Staff_Service.enums.Gender;
import com.schoolmanagement.Staff_Service.enums.Role;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class StaffResponseDTO {

    private Long staffId;

    private Long userId;

    private Long schoolId;

    private String firstName;

    private String middleName;

    private String lastName;

    private String username;

    private LocalDate dateOfJoining;

    private String email;

    private String password;

    private Set<String> roles;

    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    private EmploymentStatus status;

    private LocalDate dob;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private Boolean isActive;

    private byte[] photo;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String created_by;

    private Map<String, Object> addressJson;

}
