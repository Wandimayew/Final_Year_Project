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
@Table(name = "discounts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Discount {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long discountId;
    
    private String schoolId;
    
    private String studentId;
    
    private String discountName;
    
    @Enumerated(EnumType.STRING)
    private DiscountType type;
    
    private BigDecimal percentage;
    
    private BigDecimal fixedAmount;
    
    private LocalDate validFrom;
    
    private LocalDate validTo;
    
    private boolean isActive;
    
    private String createdBy;
    
    private LocalDateTime createdAt;
    
    private String updatedBy;
    
    private LocalDateTime updatedAt;
    
    @ManyToOne
    @JoinColumn(name = "fee_id")
    private Fee fee;
    
    // Methods
    public void applyDiscountToInvoice(Invoice invoice) {
        // Logic to apply discount to an invoice
        BigDecimal discountAmount;
        
        if (this.type == DiscountType.PERCENTAGE) {
            discountAmount = invoice.getTotalAmount().multiply(this.percentage.divide(new BigDecimal("100")));
        } else {
            discountAmount = this.fixedAmount;
        }
        
        // Apply discount logic
        BigDecimal newTotal = invoice.getTotalAmount().subtract(discountAmount);
        invoice.setTotalAmount(newTotal);
        invoice.setUpdatedAt(LocalDateTime.now());
        invoice.setRemarks(invoice.getRemarks() + " | Discount applied: " + this.discountName);
    }
    
    public void addDiscount() {
        this.isActive = true;
        this.createdAt = LocalDateTime.now();
    }
    
    public void removeDiscount() {
        this.isActive = false;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void updateDiscount() {
        this.updatedAt = LocalDateTime.now();
    }
    
    public void getDiscount() {
        // Logic to retrieve discount details
    }
}

enum DiscountType {
    PERCENTAGE, FIXED_AMOUNT
}