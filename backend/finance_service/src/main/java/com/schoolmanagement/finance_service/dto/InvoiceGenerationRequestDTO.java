package com.schoolmanagement.finance_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceGenerationRequestDTO {
    @NotBlank(message = "School ID is required")
    private String schoolId;
    
    @NotBlank(message = "Student ID is required")
    private String studentId;
    
    @NotNull(message = "Due date is required")
    @Future(message = "Due date must be in the future")
    private LocalDate dueDate;
    
    private String remarks;
    
    private boolean applyDiscounts;
    
    @NotBlank(message = "Created by is required")
    private String createdBy;
}
