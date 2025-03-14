package com.schoolmanagement.finance_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentFeeDTO {
    private Long studentFeeId;
    
    @NotBlank(message = "School ID is required")
    private String schoolId;
    
    @NotBlank(message = "Student ID is required")
    private String studentId;
    
    @NotNull(message = "Applied amount is required")
    @Positive(message = "Applied amount must be positive")
    private BigDecimal appliedAmount;
    
    private BigDecimal paidAmount;
    
    private BigDecimal remainingAmount;
    
    private String status;
    
    private LocalDate lastPaymentDate;
    
    @NotNull(message = "Fee ID is required")
    private Long feeId;
    
    private String feeName;
    
    private boolean isActive;
}
