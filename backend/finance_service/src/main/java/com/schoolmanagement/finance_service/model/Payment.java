package com.schoolmanagement.finance_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;
    
    private String schoolId;
    
    private LocalDate transactionId;
    
    private BigDecimal amount;
    
    @Enumerated(EnumType.STRING)
    private PaymentStatus status;
    
    private LocalDate paymentDate;
    
    private String paymentReference;
    
    private String remarks;
    
    private String paymentGatewayResponse;
    
    private boolean isActive;
    
    private LocalDateTime createdAt;
    
    private String createdBy;
    
    private String updatedBy;
    
    private LocalDateTime updatedAt;

    public enum PaymentStatus {
        PENDING, COMPLETED, FAILED, REFUNDED, CANCELLED
    }
    
    @ManyToOne
    @JoinColumn(name = "financial_transaction_id")
    private FinancialTransaction financialTransaction;
    
    // Methods
    public void getPayment() {
        // Logic to retrieve payment details
    }
    
    public String generatePaymentReceipt() {
        // Logic to generate receipt
        return "RCPT-" + this.paymentId + "-" + this.paymentDate.toString();
    }
    
    public void deletePayment() {
        this.isActive = false;
        this.updatedAt = LocalDateTime.now();
    }
}


