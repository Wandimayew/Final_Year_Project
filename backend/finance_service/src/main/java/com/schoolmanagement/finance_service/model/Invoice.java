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
@Table(name = "invoices")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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
    
    private String createdBy;
    
    private LocalDateTime createdAt;
    
    private String updatedBy;
    
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "invoice")
    private List<StudentFee> studentFees = new ArrayList<>();
    
    @ManyToOne
    @JoinColumn(name = "financial_transaction_id")
    private FinancialTransaction financialTransaction;
    
    // Methods
    public void addInvoice() {
        this.isActive = true;
        this.createdAt = LocalDateTime.now();
        this.status = "UNPAID";
    }
    
    public void removeInvoice() {
        this.isActive = false;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void getInvoice() {
        // Logic to retrieve invoice details
    }
}