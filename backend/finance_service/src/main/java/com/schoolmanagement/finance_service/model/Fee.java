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
@Table(name = "fees")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Fee {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long feeId;
    
    private String schoolId;
    
    private String feeCode;
    
    private String feeName;
    
    private BigDecimal amount;
    
    @Enumerated(EnumType.STRING)
    private FeeType feeType;
    
    @Enumerated(EnumType.STRING)
    private Frequency frequency;
    
    private LocalDate dueDate;
    
    private boolean isActive;
    
    private String createdBy;
    
    private LocalDateTime createdAt;
    
    private String updatedBy;
    
    private LocalDateTime updatedAt;

    public enum FeeType {
        TUITION, TRANSPORTATION, BOOKS, UNIFORM, EXAM, LABORATORY, SPORTS, MISCELLANEOUS, REGISTRATION
    }
    
    public enum Frequency {
        YEARLY, HALF_YEARLY, QUARTERLY, MONTHLY, ONE_TIME
    }
    
    // Methods
    public void addFee() {
        this.isActive = true;
        this.createdAt = LocalDateTime.now();
    }
    
    public void removeFee() {
        this.isActive = false;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void updateFee() {
        this.updatedAt = LocalDateTime.now();
    }
}

