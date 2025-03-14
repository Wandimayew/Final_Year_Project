package com.schoolmanagement.finance_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.finance_service.model.Fee;

import java.util.List;

@Repository
public interface FeeRepository extends JpaRepository<Fee, Long> {
    List<Fee> findBySchoolId(String schoolId);
    List<Fee> findBySchoolIdAndIsActiveTrue(String schoolId);
    Fee findByFeeCodeAndSchoolId(String feeCode, String schoolId);
}
