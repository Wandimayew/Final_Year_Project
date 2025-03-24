package com.schoolmanagement.finance_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.finance_service.model.Discount;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DiscountRepository extends JpaRepository<Discount, Long> {
    List<Discount> findBySchoolId(String schoolId);
    List<Discount> findByStudentId(String studentId);
    List<Discount> findByValidFromBeforeAndValidToAfterAndIsActiveTrue(LocalDate date, LocalDate sameDate);
    List<Discount> findBySchoolIdAndDiscountName(String schoolId, String discountName);
}
