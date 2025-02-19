package com.schoolmanagement.student_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.student_service.model.QRCode;

@Repository
public interface QRCodeRepository extends JpaRepository<QRCode, Long> {
    // Optional<QRCode> findBySchoolIdAndClassIdAndSectionId(Long schoolId, Long classId, Long sectionId);
}
