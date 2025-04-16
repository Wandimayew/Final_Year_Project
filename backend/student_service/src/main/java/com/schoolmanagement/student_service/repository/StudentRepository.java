package com.schoolmanagement.student_service.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.student_service.model.Student;
import com.schoolmanagement.student_service.model.Student.PassedOrFail;
import com.schoolmanagement.student_service.model.Student.Status;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
     @Query("SELECT s FROM Student s WHERE s.studentId = :studentId AND s.isActive = ACTIVE")
     Optional<Student> findByStudentId(String studentId);

     @Query("SELECT s FROM Student s WHERE s.isPassed = :isPassed AND s.isActive = ACTIVE")
     List<Student> findAllIsPassed(PassedOrFail isPassed);

     @Query("SELECT s FROM Student s WHERE s.classId = :classId AND s.isPassed =:isPassed AND s.isActive = ACTIVE")
     List<Student> findByClassIdAndIsPassed(Long classId, PassedOrFail isPassed);

     @Query("SELECT s FROM Student s WHERE s.sectionId =:sectionId AND s.isPassed =:isPassed AND s.isActive = ACTIVE")
     List<Student> findBySectionIdAndIsPassed(Long sectionId, PassedOrFail isPassed);

     @Query("SELECT s FROM Student s WHERE s.classId = :classId AND s.sectionId =:sectionId AND s.isPassed =:isPassed AND s.isActive = ACTIVE")
     List<Student> findByClassIdAndSectionIdAndIsPassed(Long classId, Long sectionId, PassedOrFail isPassed);

     @Query("SELECT s FROM Student s WHERE s.classId = :classId AND s.isActive = ACTIVE")
     List<Student> findByClassId(Long classId);

     @Query("SELECT s FROM Student s WHERE s.sectionId = :sectionId AND s.isActive = ACTIVE")
     List<Student> findBySectionId(Long sectionId);

     @Query("SELECT s FROM Student s WHERE s.classId = :classId AND s.sectionId =:sectionId AND s.isActive = ACTIVE")
     List<Student> findByClassIdAndSectionId(Long classId, Long sectionId);

     @Query("SELECT s FROM Student s WHERE s.isActive = :status")
     List<Student> findAllIsActive(Status status);
}
