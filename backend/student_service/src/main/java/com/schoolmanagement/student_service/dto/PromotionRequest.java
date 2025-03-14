package com.schoolmanagement.student_service.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PromotionRequest {

    @NotNull(message = "School ID cannot be null")
    private String schoolId;

    @NotNull(message = "Previous class ID cannot be null")
    private Long previousClassId;

    @NotNull(message = "New class ID cannot be null")
    private Long newClassId;

    @NotNull(message = "Section ID cannot be null")
    private Long sectionId;

    @NotNull(message = "Is passed cannot be null")
    private boolean isPassed;

    @NotNull(message = "Promotion date cannot be null")
    @PastOrPresent(message = "Promotion date must be in the past or present")
    private LocalDate promotionDate;

    @Size(max = 500, message = "Remark cannot exceed 500 characters")
    private String remark;

    @NotNull(message = "Student ID cannot be null")
    private Long studentId;
}