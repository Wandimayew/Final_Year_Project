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
public class FeeDTO {
    private Long feeId;
    
    @NotBlank(message = "School ID is required")
    private String schoolId;
    
    @NotBlank(message = "Fee code is required")
    private String feeCode;
    
    @NotBlank(message = "Fee name is required")
    private String feeName;
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;
    
    @NotBlank(message = "Fee type is required")
    private String feeType;
    
    @NotBlank(message = "Frequency is required")
    private String frequency;
    
    private LocalDate dueDate;
    
    private boolean isActive;
}
