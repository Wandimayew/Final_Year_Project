package com.schoolmanagement.student_service.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;

@Entity
@Data
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long attendanceId;

    @NotNull(message = "School ID cannot be null")
    private Long schoolId;

    @NotNull(message = "Class ID cannot be null")
    private Long classId;

    @NotBlank(message = "Student ID cannot be blank")
    private String studentId;

    @NotNull(message = "QR Code ID cannot be null")
    private Long qrCodeId;

    @NotNull(message = "Attendance date cannot be null")
    @PastOrPresent(message = "Attendance date must be in the past or present")
    private LocalDateTime attendanceDate;

    @NotBlank(message = "Recorded by cannot be blank")
    private String recordedBy;

    @Size(max = 500, message = "Remarks cannot exceed 500 characters")
    private String remarks;

    @ManyToOne
    @JoinColumn(name = "studentId", insertable = false, updatable = false)
    private Student student;
}