package com.schoolmanagement.Staff_Service.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.Staff_Service.enums.AssignmentStatus;
import com.schoolmanagement.Staff_Service.model.TeacherAssignment;

@Repository
public interface TeacherAssignmentRepository extends JpaRepository<TeacherAssignment, Long> {

        // Find assignments by teacherId
        @Query("SELECT ta FROM TeacherAssignment ta JOIN ta.teacher t WHERE t.id = :teacherId")
        List<TeacherAssignment> findByTeacherId(Long teacherId);

        // Find assignments by schoolId and classId
        List<TeacherAssignment> findBySchoolIdAndClassId(String schoolId, Long classId);

        // Find active assignments by teacherId, status, and endDate
        @Query("SELECT ta FROM TeacherAssignment ta " +
                        "WHERE ta.teacher.teacherId = :teacherId " + // Correct teacherId reference
                        "AND ta.status = :status " +
                        "AND ta.endDate >= :currentDate")
        List<TeacherAssignment> findActiveAssignments(
                        @Param("teacherId") Long teacherId,
                        @Param("status") AssignmentStatus status,
                        @Param("currentDate") LocalDate currentDate);

}
