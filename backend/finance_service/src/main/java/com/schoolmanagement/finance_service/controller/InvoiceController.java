package com.schoolmanagement.finance_service.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.schoolmanagement.finance_service.dto.InvoiceDTO;
import com.schoolmanagement.finance_service.dto.InvoiceGenerationRequestDTO;
import com.schoolmanagement.finance_service.service.InvoiceService;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/finance/invoices")
@RequiredArgsConstructor
public class InvoiceController {
    
    private final InvoiceService invoiceService;
    
    @PostMapping("/generate")
    public ResponseEntity<InvoiceDTO> generateInvoice(
            @Valid @RequestBody InvoiceGenerationRequestDTO request) {
        return new ResponseEntity<>(invoiceService.generateInvoice(request), HttpStatus.CREATED);
    }
    
    @GetMapping("/{invoiceId}")
    public ResponseEntity<InvoiceDTO> getInvoiceById(@PathVariable Long invoiceId) {
        return ResponseEntity.ok(invoiceService.getInvoiceById(invoiceId));
    }
    
    @GetMapping("/number/{invoiceNumber}")
    public ResponseEntity<InvoiceDTO> getInvoiceByNumber(@PathVariable String invoiceNumber) {
        return ResponseEntity.ok(invoiceService.getInvoiceByNumber(invoiceNumber));
    }
    
    @GetMapping("/student/{studentId}/school/{schoolId}")
    public ResponseEntity<List<InvoiceDTO>> getStudentInvoices(
            @PathVariable String studentId,
            @PathVariable String schoolId) {
        return ResponseEntity.ok(invoiceService.getStudentInvoices(studentId, schoolId));
    }
    
    @PutMapping("/{invoiceId}/status")
    public ResponseEntity<Void> updateInvoiceStatus(
            @PathVariable Long invoiceId,
            @RequestParam String status) {
        invoiceService.updateInvoiceStatus(invoiceId, status);
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping("/{invoiceId}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable Long invoiceId) {
        invoiceService.deleteInvoice(invoiceId);
        return ResponseEntity.noContent().build();
    }
}