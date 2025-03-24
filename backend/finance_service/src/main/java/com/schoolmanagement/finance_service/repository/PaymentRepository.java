package com.schoolmanagement.finance_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.finance_service.model.Payment;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findBySchoolId(String schoolId);
    List<Payment> findByPaymentDateBetween(LocalDate startDate, LocalDate endDate);
    List<Payment> findByFinancialTransaction_FinancialTransactionId(Long transactionId);

    // @Query("SELECT p FROM Payment p WHERE p.payment_reference = :payment_reference")
    Optional<Payment> findByPaymentReference(@Param("paymentReference") String paymentReference);

}

