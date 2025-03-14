package com.schoolmanagement.finance_service.service;

// import com.schoolmanagement.finance.dto.SalaryDTO;
// import com.schoolmanagement.finance.dto.SalaryPaymentDTO;
// import com.schoolmanagement.finance.entity.FinancialTransaction;
// import com.schoolmanagement.finance.entity.Payment;
// import com.schoolmanagement.finance.entity.PaymentStatus;
// import com.schoolmanagement.finance.entity.TransactionCategory;
// import com.schoolmanagement.finance.entity.TransactionType;
// import com.schoolmanagement.finance.repository.FinancialTransactionRepository;
// import com.schoolmanagement.finance.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.schoolmanagement.finance_service.dto.SalaryDTO;
import com.schoolmanagement.finance_service.dto.SalaryPaymentDTO;
import com.schoolmanagement.finance_service.model.FinancialTransaction;
import com.schoolmanagement.finance_service.model.Payment;
import com.schoolmanagement.finance_service.model.FinancialTransaction.TransactionCategory;
import com.schoolmanagement.finance_service.model.FinancialTransaction.TransactionType;
import com.schoolmanagement.finance_service.model.Payment.PaymentStatus;
import com.schoolmanagement.finance_service.repository.FinancialTransactionRepository;
import com.schoolmanagement.finance_service.repository.PaymentRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalaryManagementService {
    
    private final FinancialTransactionRepository transactionRepository;
    private final PaymentRepository paymentRepository;
    
    @Transactional
    public SalaryPaymentDTO processSalaryPayment(SalaryDTO salaryDTO) {
        // Create a financial transaction for salary payment
        FinancialTransaction transaction = FinancialTransaction.builder()
                .transactionNumber(generateTransactionNumber())
                .schoolId(salaryDTO.getSchoolId())
                .type(TransactionType.EXPENSE)
                .category(TransactionCategory.SALARY)
                .amount(salaryDTO.getAmount())
                .transactionDate(LocalDate.now())
                .description("Salary payment for staff: " + salaryDTO.getStaffId())
                .isActive(true)
                .createdBy(salaryDTO.getCreatedBy())
                .createdAt(LocalDateTime.now())
                .build();
        
        transaction.addTransaction();
        FinancialTransaction savedTransaction = transactionRepository.save(transaction);
        
        // Create a payment record
        Payment payment = Payment.builder()
                .schoolId(salaryDTO.getSchoolId())
                .transactionId(LocalDate.now())
                .amount(salaryDTO.getAmount())
                .status(PaymentStatus.COMPLETED)
                .paymentDate(LocalDate.now())
                .paymentReference("SAL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .remarks("Salary payment for month: " + salaryDTO.getMonth())
                .isActive(true)
                .createdBy(salaryDTO.getCreatedBy())
                .createdAt(LocalDateTime.now())
                .financialTransaction(savedTransaction)
                .build();
        
        Payment savedPayment = paymentRepository.save(payment);
        
        // Generate payment receipt
        String receipt = savedPayment.generatePaymentReceipt();
        
        return SalaryPaymentDTO.builder()
                .paymentId(savedPayment.getPaymentId())
                .transactionId(savedTransaction.getTransactionNumber().toString())
                .staffId(salaryDTO.getStaffId())
                .amount(savedPayment.getAmount())
                .month(salaryDTO.getMonth())
                .year(salaryDTO.getYear())
                .paymentDate(savedPayment.getPaymentDate())
                .receiptNumber(receipt)
                .build();
    }
    
    public List<SalaryPaymentDTO> getStaffSalaryHistory(String staffId, String schoolId) {
        // Find all salary transactions for the staff
        List<FinancialTransaction> salaryTransactions = transactionRepository.findBySchoolId(schoolId)
                .stream()
                .filter(t -> t.getCategory() == TransactionCategory.SALARY)
                .filter(t -> t.getDescription().contains("staff: " + staffId))
                .collect(Collectors.toList());
        
        // Map to payment details
        return salaryTransactions.stream()
                .map(transaction -> {
                    // Find the corresponding payment
                    Payment payment = paymentRepository.findByFinancialTransaction_FinancialTransactionId(
                            transaction.getFinancialTransactionId())
                            .stream()
                            .findFirst()
                            .orElse(null);
                    
                    if (payment == null) {
                        return null;
                    }
                    
                    // Parse month and year from remarks
                    String remarks = payment.getRemarks();
                    String month = "Unknown";
                    int year = LocalDate.now().getYear();
                    
                    if (remarks.contains("month:")) {
                        month = remarks.split("month:")[1].trim();
                    }
                    
                    return SalaryPaymentDTO.builder()
                            .paymentId(payment.getPaymentId())
                            .transactionId(transaction.getTransactionNumber().toString())
                            .staffId(staffId)
                            .amount(payment.getAmount())
                            .month(month)
                            .year(year)
                            .paymentDate(payment.getPaymentDate())
                            .receiptNumber(payment.generatePaymentReceipt())
                            .build();
                })
                .filter(payment -> payment != null)
                .collect(Collectors.toList());
    }
    
    public Map<String, Object> getMonthlySalaryReport(String schoolId, int year, int month) {
        Map<String, Object> report = new HashMap<>();
        
        // Create date range for the month
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);
        
        // Find all salary transactions for the month
        List<FinancialTransaction> salaryTransactions = transactionRepository
                .findBySchoolIdAndTransactionDateBetween(schoolId, startDate, endDate)
                .stream()
                .filter(t -> t.getCategory() == TransactionCategory.SALARY)
                .collect(Collectors.toList());
        
        // Calculate total salary expenses
        report.put("totalSalaryExpense", salaryTransactions.stream()
                .map(FinancialTransaction::getAmount)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add));
        
        // Count number of salary payments
        report.put("totalPayments", salaryTransactions.size());
        
        return report;
    }
    
    private Long generateTransactionNumber() {
        return System.currentTimeMillis();
    }
}
