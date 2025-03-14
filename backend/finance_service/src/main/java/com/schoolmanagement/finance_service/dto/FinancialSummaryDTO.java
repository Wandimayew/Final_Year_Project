package com.schoolmanagement.finance_service.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class FinancialSummaryDTO {
    private String schoolId;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal totalOutstanding;
    private BigDecimal totalPayments;
    private BigDecimal netBalance;
}
