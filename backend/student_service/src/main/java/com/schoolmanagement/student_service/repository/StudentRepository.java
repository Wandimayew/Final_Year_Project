package com.schoolmanagement.student_service.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.student_service.model.Student;
import com.schoolmanagement.student_service.model.Student.PassedOrFail;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
     @Query("SELECT s FROM Student s WHERE s.studentId = :studentId AND s.isActive = ACTIVE")
     Optional<Student> findByStudentId(String studentId);

     @Query("SELECT s FROM Student s WHERE s.isPassed = :isPassed")
     List<Student> findAllIsPassed(PassedOrFail isPassed);

     @Query("SELECT s FROM Student s WHERE s.classId = :classId AND s.isPassed =:isPassed")
     List<Student> findByClassIdAndIsPassed(Long classId, PassedOrFail isPassed);

     @Query("SELECT s FROM Student s WHERE s.sectionId =:sectionId AND s.isPassed =:isPassed")
     List<Student> findBySectionIdAndIsPassed(Long sectionId, PassedOrFail isPassed);

     @Query("SELECT s FROM Student s WHERE s.classId = :classId AND s.sectionId =:sectionId AND s.isPassed =:isPassed")
     List<Student> findByClassIdAndSectionIdAndIsPassed(Long classId, Long sectionId, PassedOrFail isPassed);

     List<Student> findByClassId(Long classId);

     List<Student> findBySectionId(Long sectionId);

     List<Student> findByClassIdAndSectionId(Long classId, Long sectionId);
}
