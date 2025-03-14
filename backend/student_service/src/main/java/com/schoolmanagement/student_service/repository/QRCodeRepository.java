package com.schoolmanagement.student_service.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.student_service.model.QRCode;

@Repository
public interface QRCodeRepository extends JpaRepository<QRCode, Long> {
    // Optional<QRCode> findBySchoolIdAndClassIdAndSectionId(Long schoolId, Long classId, Long sectionId);
    Optional<List<QRCode>> findByClassIdOrSectionId(Long classId, Long sectionId);
    List<QRCode> findByClassId(Long classId);

    List<QRCode> findBySectionId(Long sectionId);

    List<QRCode> findByClassIdAndSectionId(Long classId, Long sectionId);
}
