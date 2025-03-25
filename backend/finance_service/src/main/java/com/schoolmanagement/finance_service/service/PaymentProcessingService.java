package com.schoolmanagement.finance_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.schoolmanagement.finance_service.dto.ChapaInitiatePaymentRequest;
import com.schoolmanagement.finance_service.dto.ChapaInitiatePaymentResponse;
import com.schoolmanagement.finance_service.dto.ChapaPaymentResponseDTO;
import com.schoolmanagement.finance_service.dto.ChapaVerifyPaymentResponse;
import com.schoolmanagement.finance_service.dto.PaymentRequestDTO;
import com.schoolmanagement.finance_service.dto.PaymentResponseDTO;
import com.schoolmanagement.finance_service.dto.PaymentStatusDTO;
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
@Slf4j
public class PaymentProcessingService {
    
    private final PaymentRepository paymentRepository;
    private final StudentFeeRepository studentFeeRepository;
    private final FinancialTransactionRepository financialTransactionRepository;
    private final FeeManagementService feeManagementService;
    private final ChapaPaymentService chapaPaymentService;

    /**
     * Initiates a payment through Chapa payment gateway
     */
    public ChapaPaymentResponseDTO initiateOnlinePayment(PaymentRequestDTO paymentRequest) {
      
        // Create Chapa payment request
        ChapaInitiatePaymentRequest chapaRequest = ChapaInitiatePaymentRequest.builder()
                .amount(paymentRequest.getAmount())
                .currency("ETB") // Ethiopian Birr
                .email(paymentRequest.getEmail())
                .firstName(paymentRequest.getFirstName())
                .lastName(paymentRequest.getLastName())
                .title("School Fee Payment")
                .description("Fee payment for " + paymentRequest.getStudentId())
                .build();
        
        // Initiate payment with Chapa
        ChapaInitiatePaymentResponse response = chapaPaymentService.initiatePayment(chapaRequest);

        if (response.isSuccess()) {
            // Save pending payment record in database
            List<StudentFee> studentFees = studentFeeRepository.findAllById(paymentRequest.getStudentFeeIds());
            Payment payment = Payment.builder()
                    .schoolId(paymentRequest.getSchoolId())
                    .amount(paymentRequest.getAmount())
                    .status(PaymentStatus.PENDING)
                    .paymentDate(LocalDate.now())
                    .paymentReference(response.getData().getTxRef())
                    .remarks("Chapa online payment initiated")
                    .studentFees(studentFees)
                    .isActive(true)
                    .createdBy(paymentRequest.getCreatedBy())
                    .createdAt(LocalDateTime.now())
                    .build();
            
            Payment savedPayment = paymentRepository.save(payment);
            
            // Return response with checkout URL
            return ChapaPaymentResponseDTO.builder()
                    .paymentId(savedPayment.getPaymentId())
                    .txRef(response.getData().getTxRef())
                    .checkoutUrl(response.getData().getCheckoutUrl())
                    .amount(paymentRequest.getAmount())
                    .status("PENDING")
                    .build();
        } else {
            throw new RuntimeException("Failed to initiate payment: " + response.getMessage());
        }
    }
    
    /**
     * Handles Chapa payment callback/webhook
     */
    @Transactional
    public PaymentResponseDTO handleChapaCallback(String txRef) {
        // Verify payment with Chapa
        ChapaVerifyPaymentResponse verifyResponse = chapaPaymentService.verifyPayment(txRef);
        
        if (verifyResponse.isSuccess() && "success".equalsIgnoreCase(verifyResponse.getData().getStatus())) {
            // Find pending payment with this reference
            Payment payment = paymentRepository.findByPaymentReference(txRef)
                    .orElseThrow(() -> new RuntimeException("Payment not found with reference: " + txRef));
            
            // Create financial transaction
            FinancialTransaction transaction = FinancialTransaction.builder()
                    .transactionNumber(generateTransactionNumber())
                    .schoolId(payment.getSchoolId())
                    .type(TransactionType.INCOME)
                    .category(TransactionCategory.FEE_PAYMENT)
                    .amount(payment.getAmount())
                    .transactionDate(LocalDate.now())
                    .description("Online payment via Chapa: " + txRef)
                    .isActive(true)
                    .createdBy("SYSTEM")
                    .createdAt(LocalDateTime.now())
                    .build();
            
            transaction.addTransaction();
            FinancialTransaction savedTransaction = financialTransactionRepository.save(transaction);
            
            // Update payment record
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setFinancialTransaction(savedTransaction);
            payment.setPaymentGatewayResponse(verifyResponse.toString());
            payment.setUpdatedAt(LocalDateTime.now());
            payment.setUpdatedBy("SYSTEM");
            
            paymentRepository.save(payment);
            
            if (!payment.getStudentFees().isEmpty()) {
                BigDecimal feeAmount = payment.getAmount().divide(
                        new BigDecimal(payment.getStudentFees().size()),
                        2, RoundingMode.HALF_UP);
            
                for (StudentFee studentFee : payment.getStudentFees()) {
                    feeManagementService.updateStudentFeePayment(studentFee.getStudentFeeId(), feeAmount);
                }
            } else {
                log.warn("No student fees associated with payment for txRef: {}", txRef);
            }
            // TODO: Update student fee records based on the payment
            // This would typically involve retrieving the student fee IDs associated with the payment
            // For now, this is a placeholder
            String receipt = payment.generatePaymentReceipt();
            return PaymentResponseDTO.builder()
                .paymentId(payment.getPaymentId())
                .transactionId(savedTransaction.getTransactionNumber().toString())
                .status(payment.getStatus().toString())
                .amount(payment.getAmount())
                .receiptNumber(receipt)
                .paymentDate(payment.getPaymentDate())
                .build();
        } else {
            // Handle failed payment
            Payment payment = paymentRepository.findByPaymentReference(txRef)
                    .orElseThrow(() -> new RuntimeException("Payment not found with reference: " + txRef));
            
            payment.setStatus(PaymentStatus.FAILED);
            payment.setPaymentGatewayResponse(verifyResponse.toString());
            payment.setUpdatedAt(LocalDateTime.now());
            payment.setUpdatedBy("SYSTEM");
            
            paymentRepository.save(payment);
            // Generate receipt
            String receipt = payment.generatePaymentReceipt();
            return PaymentResponseDTO.builder()
                .paymentId(payment.getPaymentId())
                // .transactionId(savedTransaction.getTransactionNumber().toString())
                .status(payment.getStatus().toString())
                .amount(payment.getAmount())
                .receiptNumber(receipt)
                .paymentDate(payment.getPaymentDate())
                .build();
        }
    }
    
    /**
     * Verifies a Chapa payment's status
     */
    public PaymentStatusDTO verifyPaymentStatus(String txRef) {
        try {
            ChapaVerifyPaymentResponse verifyResponse = chapaPaymentService.verifyPayment(txRef);
            
            // Find payment in our database
            Payment payment = paymentRepository.findByPaymentReference(txRef)
                    .orElseThrow(() -> new RuntimeException("Payment not found with reference: " + txRef));
            
            // Update payment status if it's changed
            if (verifyResponse.isSuccess() && "success".equalsIgnoreCase(verifyResponse.getData().getStatus()) 
                    && payment.getStatus() != PaymentStatus.COMPLETED) {
                handleChapaCallback(txRef);
            }
            
            return PaymentStatusDTO.builder()
                    .paymentId(payment.getPaymentId())
                    .txRef(txRef)
                    .status(payment.getStatus().toString())
                    .amount(payment.getAmount())
                    .paymentDate(payment.getPaymentDate())
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Failed to verify payment status: " + e.getMessage());
        }
    }
    
    // @Transactional
    // public PaymentResponseDTO processPayment(PaymentRequestDTO paymentRequest) {
    //     // Create a new financial transaction
    //     FinancialTransaction transaction = FinancialTransaction.builder()
    //             .transactionNumber(generateTransactionNumber())
    //             .schoolId(paymentRequest.getSchoolId())
    //             .type(TransactionType.INCOME)
    //             .category(TransactionCategory.FEE_PAYMENT)
    //             .amount(paymentRequest.getAmount())
    //             .transactionDate(LocalDate.now())
    //             .description("Fee payment for student: " + paymentRequest.getStudentId())
    //             .isActive(true)
    //             .createdBy(paymentRequest.getCreatedBy())
    //             .createdAt(LocalDateTime.now())
    //             .build();
        
    //     transaction.addTransaction();
    //     FinancialTransaction savedTransaction = financialTransactionRepository.save(transaction);
        
    //     // Process the payment
    //     Payment payment = Payment.builder()
    //             .schoolId(paymentRequest.getSchoolId())
    //             .transactionId(LocalDate.now())
    //             .amount(paymentRequest.getAmount())
    //             .status(PaymentStatus.COMPLETED)
    //             .paymentDate(LocalDate.now())
    //             .paymentReference(generatePaymentReference())
    //             .remarks(paymentRequest.getRemarks())
    //             .paymentGatewayResponse(simulatePaymentGatewayResponse())
    //             .isActive(true)
    //             .createdBy(paymentRequest.getCreatedBy())
    //             .createdAt(LocalDateTime.now())
    //             .financialTransaction(savedTransaction)
    //             .build();
        
    //     Payment savedPayment = paymentRepository.save(payment);
        
    //     // Update student fee records
    //     for (Long studentFeeId : paymentRequest.getStudentFeeIds()) {
    //         StudentFee studentFee = studentFeeRepository.findById(studentFeeId)
    //                 .orElseThrow(() -> new RuntimeException("Student Fee not found with id: " + studentFeeId));
            
    //         // Calculate proportional payment amount (simplified version)
    //         BigDecimal feeAmount = paymentRequest.getAmount().divide(
    //                 new BigDecimal(paymentRequest.getStudentFeeIds().size()),
    //                 2, RoundingMode.HALF_UP);
            
    //         // Update the student fee payment record
    //         feeManagementService.updateStudentFeePayment(studentFeeId, feeAmount);
    //     }
        
    //     // Generate receipt
    //     String receipt = savedPayment.generatePaymentReceipt();
        
    //     return PaymentResponseDTO.builder()
    //             .paymentId(savedPayment.getPaymentId())
    //             .transactionId(savedTransaction.getTransactionNumber().toString())
    //             .status(savedPayment.getStatus().toString())
    //             .amount(savedPayment.getAmount())
    //             .receiptNumber(receipt)
    //             .paymentDate(savedPayment.getPaymentDate())
    //             .build();
    // }
    
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
