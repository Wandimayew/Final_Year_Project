package com.schoolmanagement.finance_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalaryDTO {
    @NotBlank(message = "School ID is required")
    private String schoolId;
    
    @NotBlank(message = "Staff ID is required")
    private String staffId;
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;
    
    @NotBlank(message = "Month is required")
    private String month;
    
    @NotNull(message = "Year is required")
    private Integer year;
    
    @NotBlank(message = "Created by is required")
    private String createdBy;
}
