package com.schoolmanagement.finance_service.mapper;

import com.schoolmanagement.finance_service.dto.PaymentRequestDTO;
import com.schoolmanagement.finance_service.dto.PaymentResponseDTO;
import com.schoolmanagement.finance_service.model.Payment;
import com.schoolmanagement.finance_service.model.Payment.PaymentStatus;

public class PaymentMapper {

    public static Payment toEntity(PaymentRequestDTO dto) {
        Payment payment = new Payment();
        payment.setSchoolId(dto.getSchoolId());
        payment.setAmount(dto.getAmount());
        payment.setRemarks(dto.getRemarks());
        payment.setStatus(PaymentStatus.PENDING); // Default to pending
        payment.setActive(true);
        payment.setCreatedBy(dto.getCreatedBy());
        payment.setCreatedAt(java.time.LocalDateTime.now());
        
        return payment;
    }

    public static PaymentResponseDTO toDTO(Payment payment) {
        PaymentResponseDTO dto = new PaymentResponseDTO();
        dto.setPaymentId(payment.getPaymentId());
        dto.setTransactionId(payment.getTransactionId() != null ? payment.getTransactionId().toString() : null);
        dto.setStatus(payment.getStatus().name());
        dto.setAmount(payment.getAmount());
        dto.setReceiptNumber(payment.generatePaymentReceipt());
        dto.setPaymentDate(payment.getPaymentDate());
        
        return dto;
    }
}
