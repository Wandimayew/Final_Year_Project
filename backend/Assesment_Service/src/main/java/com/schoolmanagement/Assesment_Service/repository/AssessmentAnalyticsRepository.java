package com.schoolmanagement.Assesment_Service.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.Assesment_Service.model.AssessmentAnalytics;

@Repository
public interface AssessmentAnalyticsRepository extends JpaRepository<AssessmentAnalytics, Long> {
    @Query("SELECT a FROM AssessmentAnalytics a WHERE a.isActive = true")
    List<AssessmentAnalytics> findAllActiveAnalytics();
    
    List<AssessmentAnalytics> findBySchoolIdAndIsActiveTrue(String schoolId);
    
    @Query("SELECT aa FROM AssessmentAnalytics aa JOIN aa.assessments a WHERE a.assessmentId = :assessmentId AND aa.isActive = true")
    Optional<AssessmentAnalytics> findByAssessment_AssessmentIdAndIsActiveTrue(Long assessmentId);

    @Query("SELECT aa FROM AssessmentAnalytics aa WHERE aa.isActive = true " +
           "AND (:schoolId IS NULL OR aa.schoolId = :schoolId) " +
           "AND (:studentId IS NULL OR aa.studentId = :studentId)")
    List<AssessmentAnalytics> findByFiltersAndIsActiveTrue(
            @Param("schoolId") String schoolId,
            @Param("studentId") String studentId);
}