package com.schoolmanagement.finance_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "financial_transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialTransaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long financialTransactionId;
    
    private Long transactionNumber;
    
    private String schoolId;
    
    @Enumerated(EnumType.STRING)
    private TransactionType type;
    
    @Enumerated(EnumType.STRING)
    private TransactionCategory category;
    
    private BigDecimal amount;
    
    private BigDecimal fixedAmount;
    
    private LocalDate transactionDate;
    
    private String description;
    
    private boolean isActive;
    
    private String createdBy;
    
    private LocalDateTime createdAt;
    
    private String updatedBy;
    
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "financialTransaction")
    private List<Payment> payments = new ArrayList<>();
    
    @OneToMany(mappedBy = "financialTransaction")
    private List<Invoice> invoices = new ArrayList<>();
    
    public enum TransactionType {
        INCOME, EXPENSE, TRANSFER
    }
    
    public enum TransactionCategory {
        FEE_PAYMENT, SALARY, MAINTENANCE, SUPPLIES, UTILITY, OTHER
    }

    // Methods
    public String getFinancialReport() {
        // Logic to generate financial report
        return "Financial Report for Transaction #" + this.transactionNumber;
    }
    
    public String generateFinancialReport() {
        // More detailed report generation logic
        return "Detailed Financial Report for Transaction #" + this.transactionNumber;
    }
    
    public void addTransaction() {
        this.isActive = true;
        this.createdAt = LocalDateTime.now();
    }
}
