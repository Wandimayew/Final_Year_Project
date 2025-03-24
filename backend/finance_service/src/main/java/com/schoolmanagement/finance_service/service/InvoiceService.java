package com.schoolmanagement.finance_service.service;

import com.schoolmanagement.finance_service.dto.InvoiceDTO;
import com.schoolmanagement.finance_service.dto.InvoiceGenerationRequestDTO;
import com.schoolmanagement.finance_service.mapper.InvoiceMapper;
import com.schoolmanagement.finance_service.model.Discount;
import com.schoolmanagement.finance_service.model.FinancialTransaction;
import com.schoolmanagement.finance_service.model.Invoice;
import com.schoolmanagement.finance_service.model.StudentFee;
import com.schoolmanagement.finance_service.model.FinancialTransaction.TransactionCategory;
import com.schoolmanagement.finance_service.model.FinancialTransaction.TransactionType;
import com.schoolmanagement.finance_service.repository.DiscountRepository;
import com.schoolmanagement.finance_service.repository.FinancialTransactionRepository;
import com.schoolmanagement.finance_service.repository.InvoiceRepository;
import com.schoolmanagement.finance_service.repository.StudentFeeRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {
    
    private final InvoiceRepository invoiceRepository;
    private final StudentFeeRepository studentFeeRepository;
    private final FinancialTransactionRepository financialTransactionRepository;
    private final DiscountRepository discountRepository;
    
    @Transactional
    public InvoiceDTO generateInvoice(InvoiceGenerationRequestDTO request) {
        // Find all applicable student fees
        List<StudentFee> studentFees = studentFeeRepository.findByStudentIdAndSchoolId(
                request.getStudentId(), request.getSchoolId());
        
        // Filter to only include fees with outstanding balances
        List<StudentFee> outstandingFees = studentFees.stream()
                .filter(fee -> fee.getRemainingAmount().compareTo(BigDecimal.ZERO) > 0)
                .collect(Collectors.toList());
        
        if (outstandingFees.isEmpty()) {
            throw new RuntimeException("No outstanding fees found for student");
        }
        
        // Calculate total amount
        BigDecimal totalAmount = outstandingFees.stream()
                .map(StudentFee::getRemainingAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Create financial transaction
        FinancialTransaction transaction = FinancialTransaction.builder()
                .transactionNumber(generateTransactionNumber())
                .schoolId(request.getSchoolId())
                .type(TransactionType.INCOME)
                .category(TransactionCategory.FEE_PAYMENT)
                .amount(totalAmount)
                .transactionDate(LocalDate.now())
                .description("Invoice generation for student: " + request.getStudentId())
                .isActive(true)
                .createdBy(request.getCreatedBy())
                .createdAt(LocalDateTime.now())
                .build();
        
        transaction.addTransaction();
        FinancialTransaction savedTransaction = financialTransactionRepository.save(transaction);
        
        // Create invoice
        Invoice invoice = Invoice.builder()
                .invoiceNumber(generateInvoiceNumber())
                .schoolId(request.getSchoolId())
                .studentId(request.getStudentId())
                .totalAmount(totalAmount)
                .issueDate(LocalDate.now())
                .dueDate(request.getDueDate())
                .status("UNPAID")
                .remarks(request.getRemarks())
                .isActive(true)
                .createdBy(request.getCreatedBy())
                .createdAt(LocalDateTime.now())
                .financialTransaction(savedTransaction)
                .build();
        
        invoice.addInvoice();
        Invoice savedInvoice = invoiceRepository.save(invoice);
        
        // Link student fees to this invoice
        for (StudentFee fee : outstandingFees) {
            fee.getStudentFeeId();  // This would be a JPA managed entity
        }
        
        // Apply discounts if applicable
        if (request.isApplyDiscounts()) {
            LocalDate today = LocalDate.now();
            List<Discount> applicableDiscounts = discountRepository.findByValidFromBeforeAndValidToAfterAndIsActiveTrue(
                    today, today);
            
            // Filter to only include discounts for this student or school-wide discounts
            applicableDiscounts = applicableDiscounts.stream()
                    .filter(discount -> discount.getStudentId() == null || 
                            discount.getStudentId().equals(request.getStudentId()))
                    .filter(discount -> discount.getSchoolId().equals(request.getSchoolId()))
                    .collect(Collectors.toList());
            
            // Apply each discount
            for (Discount discount : applicableDiscounts) {
                discount.applyDiscountToInvoice(savedInvoice);
            }
            
            // Save the invoice again with applied discounts
            if (!applicableDiscounts.isEmpty()) {
                savedInvoice = invoiceRepository.save(savedInvoice);
            }
        }
        
        return InvoiceMapper.toDTO(savedInvoice);
    }
    
    public InvoiceDTO getInvoiceById(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + invoiceId));
        return InvoiceMapper.toDTO(invoice);
    }
    
    public InvoiceDTO getInvoiceByNumber(String invoiceNumber) {
        Invoice invoice = invoiceRepository.findByInvoiceNumber(invoiceNumber);
        if (invoice == null) {
            throw new RuntimeException("Invoice not found with number: " + invoiceNumber);
        }
        return InvoiceMapper.toDTO(invoice);
    }
    
    public List<InvoiceDTO> getStudentInvoices(String studentId, String schoolId) {
        List<Invoice> invoices = invoiceRepository.findByStudentIdAndSchoolId(studentId, schoolId);
        return invoices.stream()
                .map(InvoiceMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    public void updateInvoiceStatus(Long invoiceId, String status) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + invoiceId));
        
        invoice.setStatus(status);
        invoice.setUpdatedAt(LocalDateTime.now());
        
        invoiceRepository.save(invoice);
    }
    
    public void deleteInvoice(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + invoiceId));
        
        invoice.removeInvoice();
        invoiceRepository.save(invoice);
    }
    
    private Long generateTransactionNumber() {
        return System.currentTimeMillis();
    }
    
    private String generateInvoiceNumber() {
        return "INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}