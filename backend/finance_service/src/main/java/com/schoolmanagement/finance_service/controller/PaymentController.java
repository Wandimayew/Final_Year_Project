package com.schoolmanagement.finance_service.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.schoolmanagement.finance_service.dto.ChapaPaymentResponseDTO;
import com.schoolmanagement.finance_service.dto.PaymentRequestDTO;
import com.schoolmanagement.finance_service.dto.PaymentResponseDTO;
import com.schoolmanagement.finance_service.dto.PaymentStatusDTO;
import com.schoolmanagement.finance_service.service.PaymentProcessingService;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/finance/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {
    
    private final PaymentProcessingService paymentProcessingService;
    
     @PostMapping("/initiate")
    public ResponseEntity<ChapaPaymentResponseDTO> initiatePayment(
            @Valid @RequestBody PaymentRequestDTO paymentRequest) {
            log.info("Payment request: {}", paymentRequest);
        return new ResponseEntity<>(
                paymentProcessingService.initiateOnlinePayment(paymentRequest), 
                HttpStatus.CREATED);
    }

    @GetMapping("/verify/{txRef}")
    public ResponseEntity<PaymentStatusDTO> verifyPayment(@PathVariable String txRef) {
        return ResponseEntity.ok(paymentProcessingService.verifyPaymentStatus(txRef));
    }

    @GetMapping("/process")
    public ResponseEntity<Void> paymentProcess(@RequestParam String trx_ref, @RequestParam String status) {
        log.info("Payment request: {}", trx_ref);
        paymentProcessingService.handleChapaCallback(trx_ref);
        return ResponseEntity.ok().build();
    }
    // /process?tx_ref=
    // @PostMapping("/process")
    // public ResponseEntity<PaymentResponseDTO> processPayment(
    //         @Valid @RequestBody PaymentRequestDTO paymentRequest) {
    //     return new ResponseEntity<>(paymentProcessingService.processPayment(paymentRequest), HttpStatus.CREATED);
    // }
    
    @GetMapping("/{paymentId}")
    public ResponseEntity<PaymentResponseDTO> getPaymentById(@PathVariable Long paymentId) {
        return ResponseEntity.ok(paymentProcessingService.getPaymentById(paymentId));
    }
    
    @GetMapping("/school/{schoolId}")
    public ResponseEntity<List<PaymentResponseDTO>> getPaymentsByDateRange(
            @PathVariable String schoolId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(paymentProcessingService.getPaymentsByDateRange(schoolId, startDate, endDate));
    }
    
    @GetMapping("/{paymentId}/receipt")
    public ResponseEntity<String> generateReceipt(@PathVariable Long paymentId) {
        return ResponseEntity.ok(paymentProcessingService.generateReceipt(paymentId));
    }
    
    @PutMapping("/{paymentId}/cancel")
    public ResponseEntity<Void> cancelPayment(
            @PathVariable Long paymentId,
            @RequestParam String reason) {
        paymentProcessingService.cancelPayment(paymentId, reason);
        return ResponseEntity.noContent().build();
    }
}
