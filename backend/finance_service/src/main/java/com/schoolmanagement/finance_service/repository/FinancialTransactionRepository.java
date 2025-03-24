package com.schoolmanagement.finance_service.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.finance_service.model.FinancialTransaction;
import com.schoolmanagement.finance_service.model.FinancialTransaction.TransactionCategory;
import com.schoolmanagement.finance_service.model.FinancialTransaction.TransactionType;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FinancialTransactionRepository extends JpaRepository<FinancialTransaction, Long> {
    List<FinancialTransaction> findBySchoolId(String schoolId);
    List<FinancialTransaction> findBySchoolIdAndTransactionDateBetween(String schoolId, LocalDate startDate, LocalDate endDate);
    List<FinancialTransaction> findBySchoolIdAndType(String schoolId, TransactionType type);
    List<FinancialTransaction> findBySchoolIdAndCategory(String schoolId, TransactionCategory category);
}
