package com.schoolmanagement.finance_service.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class SalaryPaymentDTO {
    private Long paymentId;
    private String transactionId;
    private String staffId;
    private BigDecimal amount;
    private String month;
    private int year;
    private LocalDate paymentDate;
    private String receiptNumber;
}
