package com.schoolmanagement.Assesment_Service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.Assesment_Service.model.Grade;

@Repository
public interface GradeRepository extends JpaRepository<Grade, Long> {
    @Query("SELECT g FROM Grade g WHERE g.isActive = true")
    List<Grade> findAllActiveGrades();
    
    List<Grade> findByStudentIdAndIsActiveTrue(String studentId);
    
    List<Grade> findBySchoolIdAndIsActiveTrue(String schoolId);
    
    List<Grade> findByAssessment_AssessmentIdAndIsActiveTrue(Long assessmentId);
    
    List<Grade> findByStudentIdAndAssessment_AssessmentIdAndIsActiveTrue(String studentId, Long assessmentId);

    @Query("SELECT g FROM Grade g WHERE g.studentId = :studentId AND g.assessment.classId = :classId AND g.assessment.subjectId = :subjectId AND g.isActive = true")
    List<Grade> findByStudentIdAndAssessment_ClassIdAndAssessment_SubjectIdAndIsActiveTrue(
            @Param("studentId") String studentId,
            @Param("classId") Long classId,
            @Param("subjectId") Long subjectId);
}