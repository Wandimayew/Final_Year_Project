package com.schoolmanagement.student_service.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.student_service.model.Student;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
     @Query("SELECT s FROM Student s WHERE s.studentId = :studentId AND s.isActive = true")
     Optional<Student> findByStudentId(String studentId);

     @Query("SELECT s FROM Student s WHERE s.classId = :classId AND s.isPassed = true")
     List<Student> findByClassIdAndIsPassed(Long classId, boolean isPassed);
}
