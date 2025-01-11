package com.schoolmanagement.student_service.model;

import java.time.LocalDate;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;

@Entity
@Data
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "School ID cannot be null")
    private Long schoolId;

    @NotNull(message = "Previous class ID cannot be null")
    private Long previousClassId;

    @NotNull(message = "New class ID cannot be null")
    private Long newClassId;

    @NotNull(message = "Promotion date cannot be null")
    @PastOrPresent(message = "Promotion date must be in the past or present")
    private LocalDate promotionDate;

    @Size(max = 500, message = "Remark cannot exceed 500 characters")
    private String remark;

    @ManyToOne
    @JoinColumn(name = "studentId")
    @NotNull(message = "Student cannot be null")
    private Student student;
}