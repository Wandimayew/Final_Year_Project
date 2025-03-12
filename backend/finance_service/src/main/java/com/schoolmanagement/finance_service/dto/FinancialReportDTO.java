package com.schoolmanagement.finance_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialReportDTO {
    private FinancialSummaryDTO summary;
    private Map<String, BigDecimal> expensesByCategory;
    private Map<String, BigDecimal> incomeByCategory;
    private Map<Integer, BigDecimal> expensesByMonth;
    private Map<Integer, BigDecimal> incomeByMonth;
    private Map<String, Long> invoicesByStatus;
    private String reportPeriod;
}
