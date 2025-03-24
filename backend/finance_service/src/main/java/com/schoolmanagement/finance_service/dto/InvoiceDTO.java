package com.schoolmanagement.finance_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceDTO {
    private Long invoiceId;
    private String invoiceNumber;
    private String schoolId;
    private String studentId;
    private BigDecimal totalAmount;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private String status;
    private String remarks;
    private boolean isActive;
    private List<StudentFeeDTO> studentFees;
}