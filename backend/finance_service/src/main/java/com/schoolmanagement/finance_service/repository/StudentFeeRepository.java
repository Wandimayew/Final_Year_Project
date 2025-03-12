package com.schoolmanagement.finance_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.finance_service.model.StudentFee;

import java.util.List;

@Repository
public interface StudentFeeRepository extends JpaRepository<StudentFee, Long> {
    List<StudentFee> findByStudentIdAndSchoolId(String studentId, String schoolId);
    List<StudentFee> findBySchoolIdAndStatus(String schoolId, String status);
    List<StudentFee> findByFee_FeeIdAndIsActiveTrue(Long feeId);
}
