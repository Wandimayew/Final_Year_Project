package com.schoolmanagement.finance_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.finance_service.model.Invoice;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByStudentIdAndSchoolId(String studentId, String schoolId);
    List<Invoice> findBySchoolIdAndIssueDateBetween(String schoolId, LocalDate startDate, LocalDate endDate);
    List<Invoice> findBySchoolIdAndStatus(String schoolId, String status);
    Invoice findByInvoiceNumber(String invoiceNumber);
}
