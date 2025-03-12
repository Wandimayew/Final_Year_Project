package com.schoolmanagement.finance_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.schoolmanagement.finance_service.dto.PaymentRequestDTO;
import com.schoolmanagement.finance_service.dto.PaymentResponseDTO;
import com.schoolmanagement.finance_service.mapper.PaymentMapper;
import com.schoolmanagement.finance_service.model.FinancialTransaction;
import com.schoolmanagement.finance_service.model.Payment;
import com.schoolmanagement.finance_service.model.StudentFee;
import com.schoolmanagement.finance_service.model.FinancialTransaction.TransactionCategory;
import com.schoolmanagement.finance_service.model.FinancialTransaction.TransactionType;
import com.schoolmanagement.finance_service.model.Payment.PaymentStatus;
import com.schoolmanagement.finance_service.repository.FinancialTransactionRepository;
import com.schoolmanagement.finance_service.repository.PaymentRepository;
import com.schoolmanagement.finance_service.repository.StudentFeeRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentProcessingService {
    
    private final PaymentRepository paymentRepository;
    private final StudentFeeRepository studentFeeRepository;
    private final FinancialTransactionRepository financialTransactionRepository;
    private final FeeManagementService feeManagementService;
    
    @Transactional
    public PaymentResponseDTO processPayment(PaymentRequestDTO paymentRequest) {
        // Create a new financial transaction
        FinancialTransaction transaction = FinancialTransaction.builder()
                .transactionNumber(generateTransactionNumber())
                .schoolId(paymentRequest.getSchoolId())
                .type(TransactionType.INCOME)
                .category(TransactionCategory.FEE_PAYMENT)
                .amount(paymentRequest.getAmount())
                .transactionDate(LocalDate.now())
                .description("Fee payment for student: " + paymentRequest.getStudentId())
                .isActive(true)
                .createdBy(paymentRequest.getCreatedBy())
                .createdAt(LocalDateTime.now())
                .build();
        
        transaction.addTransaction();
        FinancialTransaction savedTransaction = financialTransactionRepository.save(transaction);
        
        // Process the payment
        Payment payment = Payment.builder()
                .schoolId(paymentRequest.getSchoolId())
                .transactionId(LocalDate.now())
                .amount(paymentRequest.getAmount())
                .status(PaymentStatus.COMPLETED)
                .paymentDate(LocalDate.now())
                .paymentReference(generatePaymentReference())
                .remarks(paymentRequest.getRemarks())
                .paymentGatewayResponse(simulatePaymentGatewayResponse())
                .isActive(true)
                .createdBy(paymentRequest.getCreatedBy())
                .createdAt(LocalDateTime.now())
                .financialTransaction(savedTransaction)
                .build();
        
        Payment savedPayment = paymentRepository.save(payment);
        
        // Update student fee records
        for (Long studentFeeId : paymentRequest.getStudentFeeIds()) {
            StudentFee studentFee = studentFeeRepository.findById(studentFeeId)
                    .orElseThrow(() -> new RuntimeException("Student Fee not found with id: " + studentFeeId));
            
            // Calculate proportional payment amount (simplified version)
            BigDecimal feeAmount = paymentRequest.getAmount().divide(
                    new BigDecimal(paymentRequest.getStudentFeeIds().size()),
                    2, RoundingMode.HALF_UP);
            
            // Update the student fee payment record
            feeManagementService.updateStudentFeePayment(studentFeeId, feeAmount);
        }
        
        // Generate receipt
        String receipt = savedPayment.generatePaymentReceipt();
        
        return PaymentResponseDTO.builder()
                .paymentId(savedPayment.getPaymentId())
                .transactionId(savedTransaction.getTransactionNumber().toString())
                .status(savedPayment.getStatus().toString())
                .amount(savedPayment.getAmount())
                .receiptNumber(receipt)
                .paymentDate(savedPayment.getPaymentDate())
                .build();
    }
    
    public PaymentResponseDTO getPaymentById(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + paymentId));
        return PaymentMapper.toDTO(payment);
    }
    
    public List<PaymentResponseDTO> getPaymentsByDateRange(String schoolId, LocalDate startDate, LocalDate endDate) {
        List<Payment> payments = paymentRepository.findByPaymentDateBetween(startDate, endDate);
        return payments.stream()
                .filter(payment -> payment.getSchoolId().equals(schoolId))
                .map(PaymentMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    public String generateReceipt(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + paymentId));
        return payment.generatePaymentReceipt();
    }
    
    public void cancelPayment(Long paymentId, String reason) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + paymentId));
        
        // Only allow cancellation if payment is recent (e.g., within 24 hours)
        LocalDate yesterday = LocalDate.now().minusDays(1);
        if (payment.getPaymentDate().isBefore(yesterday)) {
            throw new RuntimeException("Cannot cancel payments older than 24 hours");
        }
        
        payment.setStatus(PaymentStatus.CANCELLED);
        payment.setRemarks(payment.getRemarks() + " | Cancelled: " + reason);
        payment.setUpdatedAt(LocalDateTime.now());
        
        paymentRepository.save(payment);
    }
    
    private Long generateTransactionNumber() {
        // Simple implementation - in production you might use a more sophisticated approach
        return System.currentTimeMillis();
    }
    
    private String generatePaymentReference() {
        return "PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    private String simulatePaymentGatewayResponse() {
        // In a real implementation, this would come from the payment gateway
        return "{\"status\":\"success\",\"transactionId\":\"" + UUID.randomUUID().toString() + "\"}";
    }
}
