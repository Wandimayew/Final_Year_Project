package com.schoolmanagement.finance_service.controller;

// import com.schoolmanagement.finance.dto.ChapaPaymentResponseDTO;
// import com.schoolmanagement.finance.dto.PaymentRequestDTO;
// import com.schoolmanagement.finance.dto.PaymentStatusDTO;
// import com.schoolmanagement.finance.service.PaymentProcessingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.schoolmanagement.finance_service.dto.ChapaPaymentResponseDTO;
import com.schoolmanagement.finance_service.dto.PaymentRequestDTO;
import com.schoolmanagement.finance_service.dto.PaymentStatusDTO;
import com.schoolmanagement.finance_service.service.PaymentProcessingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/finance/chapa-payments")
@RequiredArgsConstructor
@Slf4j
public class ChapaPaymentController {
    
    private final PaymentProcessingService paymentProcessingService;
    
    @PostMapping("/initiate")
    public ResponseEntity<ChapaPaymentResponseDTO> initiatePayment(
            @Valid @RequestBody PaymentRequestDTO paymentRequest) {
        return new ResponseEntity<>(
                paymentProcessingService.initiateOnlinePayment(paymentRequest), 
                HttpStatus.CREATED);
    }
    
    @GetMapping("/verify/{txRef}")
    public ResponseEntity<PaymentStatusDTO> verifyPayment(@PathVariable String txRef) {
        return ResponseEntity.ok(paymentProcessingService.verifyPaymentStatus(txRef));
    }
    
    @PostMapping("/webhook")
    public ResponseEntity<Void> chapaWebhook(@RequestParam String tx_ref) {
        paymentProcessingService.handleChapaCallback(tx_ref);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/callback")
    public String chapaCallback(@RequestParam String trx_ref, @RequestParam String status) {
        // This endpoint is for browser redirects after payment
        // Would typically redirect to a frontend payment result page
        log.info("Payment request: {}", trx_ref);
        paymentProcessingService.handleChapaCallback(trx_ref);
        return "Payment " + status + " for transaction: " + trx_ref;
    }
}
