package com.schoolmanagement.finance_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequestDTO {
    @NotBlank(message = "School ID is required")
    private String schoolId;
    
    @NotBlank(message = "Student ID is required")
    private String studentId;
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;
    
    @NotNull(message = "Student fee IDs are required")
    private List<Long> studentFeeIds;
    
    private String paymentMethod;
    
    private String remarks;
    
    @NotBlank(message = "Created by is required")
    private String createdBy;
}
