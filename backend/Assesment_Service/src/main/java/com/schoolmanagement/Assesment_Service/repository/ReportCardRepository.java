package com.schoolmanagement.Assesment_Service.repository;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.Assesment_Service.model.ReportCard;

@Repository
public interface ReportCardRepository extends JpaRepository<ReportCard, Long> {
    @Query("SELECT r FROM ReportCard r WHERE r.isActive = true")
    List<ReportCard> findAllActiveReportCards();
    
    List<ReportCard> findByStudentIdAndIsActiveTrue(String studentId);
    
    List<ReportCard> findBySchoolIdAndIsActiveTrue(String schoolId);
    
    List<ReportCard> findByClassIdAndIsActiveTrue(Long classId);
    
    @Query("SELECT r FROM ReportCard r JOIN r.assessments a WHERE a.assessmentId = :assessmentId AND r.isActive = true")
    List<ReportCard> findByAssessment_AssessmentIdAndIsActiveTrue(Long assessmentId);

    @Query("SELECT rc FROM ReportCard rc WHERE rc.studentId = :studentId AND rc.academicYear = :academicYear AND rc.isActive = true")
    Optional<ReportCard> findByStudentIdAndAcademicYearAndIsActiveTrue(String studentId, String academicYear);
}