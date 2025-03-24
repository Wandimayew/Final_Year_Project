package com.schoolmanagement.Assessment_Service.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.Assessment_Service.model.ProgressTracker;

@Repository
public interface ProgressTrackerRepository extends JpaRepository<ProgressTracker, Long> {
    @Query("SELECT p FROM ProgressTracker p WHERE p.isActive = true")
    List<ProgressTracker> findAllActiveProgressTrackers();
    
    List<ProgressTracker> findByStudentIdAndIsActiveTrue(String studentId);
    
    List<ProgressTracker> findBySchoolIdAndIsActiveTrue(String schoolId);
    
    List<ProgressTracker> findByClassIdAndIsActiveTrue(Long classId);
    
    List<ProgressTracker> findBySubjectIdAndIsActiveTrue(Long subjectId);
    
    Optional<ProgressTracker> findByAssessment_AssessmentIdAndIsActiveTrue(Long assessmentId);

    @Query("SELECT pt FROM ProgressTracker pt WHERE pt.isActive = true " +
           "AND (:schoolId IS NULL OR pt.schoolId = :schoolId) " +
           "AND (:studentId IS NULL OR pt.studentId = :studentId) " +
           "AND (:classId IS NULL OR pt.classId = :classId) " +
           "AND (:subjectId IS NULL OR pt.subjectId = :subjectId)")
    List<ProgressTracker> findByFiltersAndIsActiveTrue(
            @Param("schoolId") String schoolId,
            @Param("studentId") String studentId,
            @Param("classId") Long classId,
            @Param("subjectId") Long subjectId);
}