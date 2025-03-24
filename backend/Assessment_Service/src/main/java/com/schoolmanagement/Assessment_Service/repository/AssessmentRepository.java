package com.schoolmanagement.Assessment_Service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.Assessment_Service.model.Assessment;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
        @Query("SELECT a FROM Assessment a WHERE a.isActive = true")
        List<Assessment> findAllActiveAssessments();

        List<Assessment> findBySchoolIdAndIsActiveTrue(String schoolId);

        List<Assessment> findByStudentIdAndIsActiveTrue(String studentId);

        List<Assessment> findByClassIdAndIsActiveTrue(Long classId);

        List<Assessment> findBySubjectIdAndIsActiveTrue(Long subjectId);

        // New method for combined filtering
        @Query("SELECT a FROM Assessment a WHERE a.isActive = true " +
                        "AND (:streamId IS NULL OR a.streamId = :streamId) " +
                        "AND (:classId IS NULL OR a.classId = :classId) " +
                        "AND (:sectionId IS NULL OR a.sectionId = :sectionId) " +
                        "AND (:subjectId IS NULL OR a.subjectId = :subjectId) " +
                        "AND (:studentId IS NULL OR a.studentId = :studentId)")
        List<Assessment> findByFiltersAndIsActiveTrue(
                        @Param("streamId") Long streamId,
                        @Param("classId") Long classId,
                        @Param("sectionId") Long sectionId,
                        @Param("subjectId") Long subjectId,
                        @Param("studentId") String studentId);

        @Query("SELECT a FROM Assessment a WHERE a.studentId = :studentId " +
                        "AND a.subjectId = :subjectId " +
                        "AND a.schoolId = :schoolId " +
                        "AND a.isActive = true")
        List<Assessment> findByStudentIdAndSubjectIdAndSchoolIdAndIsActiveTrue(
                        @Param("studentId") String studentId,
                        @Param("subjectId") Long subjectId,
                        @Param("schoolId") String schoolId);

        @Query("SELECT a FROM Assessment a WHERE a.studentId = :studentId " +
                        "AND a.classId = :classId " +
                        "AND a.schoolId = :schoolId " +
                        "AND a.isActive = true")
        List<Assessment> findByStudentIdAndClassIdAndSchoolIdAndIsActiveTrue(
                        @Param("studentId") String studentId,
                        @Param("classId") Long classId,
                        @Param("schoolId") String schoolId);

        @Query("SELECT a FROM Assessment a WHERE a.studentId = :studentId " +
                        "AND a.schoolId = :schoolId " +
                        "AND a.isActive = true")
        List<Assessment> findByStudentIdAndSchoolIdAndIsActiveTrue(
                        @Param("studentId") String studentId,
                        @Param("schoolId") String schoolId);

        @Query("SELECT a FROM Assessment a WHERE a.streamId = :streamId AND a.classId = :classId " +
                        "AND a.sectionId = :sectionId AND a.isActive = true")
        List<Assessment> findByStreamIdAndClassIdAndSectionIdAndIsActiveTrue(
                        Long streamId, Long classId, Long sectionId);

        @Query("SELECT a FROM Assessment a " +
                        "WHERE a.studentId = :studentId " +
                        "AND a.subjectId = :subjectId " +
                        "AND a.classId = :classId " +
                        "AND a.isActive = true")
        List<Assessment> findByStudentIdAndSubjectIdAndClassIdAndIsActiveTrue(
                        @Param("studentId") String studentId,
                        @Param("subjectId") Long subjectId,
                        @Param("classId") Long classId);
}