package com.schoolmanagement.finance_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentStatusDTO {
    private Long paymentId;
    private String txRef;
    private String status;
    private BigDecimal amount;
    private LocalDate paymentDate;
}
