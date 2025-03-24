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
@Table(name = "student_fees")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentFee {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long studentFeeId;
    
    private String schoolId;
    
    private String studentId;
    
    private BigDecimal appliedAmount;
    
    private BigDecimal paidAmount;
    
    private BigDecimal remainingAmount;
    
    private String status;
    
    private LocalDate lastPaymentDate;
    
    private boolean isActive;
    
    private LocalDateTime createdAt;
    
    private String createdBy;
    
    private String updatedBy;
    
    private LocalDateTime updatedAt;
    
    @ManyToOne
    @JoinColumn(name = "feeId")
    private Fee fee;

    @ManyToOne
    @JoinColumn(name = "invoiceId")  
    private Invoice invoice;  
    
    // New ManyToMany relationship with Payment
    @ManyToMany(mappedBy = "studentFees")
    private List<Payment> payments = new ArrayList<>();

    // Methods
    public void addStudentFee() {
        this.isActive = true;
        this.createdAt = LocalDateTime.now();
        this.status = "PENDING";
        calculateRemainingAmount();
    }
    
    public void calculateRemainingAmount() {
        this.remainingAmount = this.appliedAmount.subtract(this.paidAmount != null ? this.paidAmount : BigDecimal.ZERO);
        if (this.remainingAmount.compareTo(BigDecimal.ZERO) == 0) {
            this.status = "PAID";
        } else if (this.paidAmount != null && this.paidAmount.compareTo(BigDecimal.ZERO) > 0) {
            this.status = "PARTIALLY_PAID";
        } else {
            this.status = "PENDING";
        }
        this.updatedAt = LocalDateTime.now();
    }
    
    public void updateStudentFee() {
        this.updatedAt = LocalDateTime.now();
        calculateRemainingAmount();
    }
}