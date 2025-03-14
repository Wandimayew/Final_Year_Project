package com.schoolmanagement.finance_service.mapper;

import com.schoolmanagement.finance_service.dto.InvoiceDTO;
import com.schoolmanagement.finance_service.dto.InvoiceGenerationRequestDTO;
import com.schoolmanagement.finance_service.model.Invoice;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

public class InvoiceMapper {

    public static Invoice toEntity(InvoiceGenerationRequestDTO dto) {
        Invoice invoice = new Invoice();
        invoice.setSchoolId(dto.getSchoolId());
        invoice.setStudentId(dto.getStudentId());
        invoice.setDueDate(dto.getDueDate());
        invoice.setRemarks(dto.getRemarks());
        invoice.setActive(true);
        invoice.setCreatedBy(dto.getCreatedBy());
        invoice.setCreatedAt(LocalDateTime.now());
        invoice.setStatus("UNPAID");
        
        return invoice;
    }

    public static InvoiceDTO toDTO(Invoice invoice) {
        InvoiceDTO dto = new InvoiceDTO();
        dto.setInvoiceId(invoice.getInvoiceId());
        dto.setInvoiceNumber(invoice.getInvoiceNumber());
        dto.setSchoolId(invoice.getSchoolId());
        dto.setStudentId(invoice.getStudentId());
        dto.setTotalAmount(invoice.getTotalAmount());
        dto.setIssueDate(invoice.getIssueDate());
        dto.setDueDate(invoice.getDueDate());
        dto.setStatus(invoice.getStatus());
        dto.setRemarks(invoice.getRemarks());
        dto.setActive(invoice.isActive());
        
        if (invoice.getStudentFees() != null) {
            dto.setStudentFees(invoice.getStudentFees().stream()
                    .map(StudentFeeMapper::toDTO)
                    .collect(Collectors.toList()));
        }
        
        return dto;
    }
}

