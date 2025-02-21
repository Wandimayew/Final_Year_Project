package com.schoolmanagement.Staff_Service.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.Staff_Service.model.Teacher;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {

    @Query("SELECT t FROM Teacher t JOIN t.staff s WHERE s.isActive = true")
    List<Teacher> findAllTeachersThatAreActive();

    @Query("SELECT t FROM Teacher t JOIN t.staff s WHERE s.isActive = false")
    List<Teacher> findAllTeachersThatAreNotActive();

    @Query("SELECT t FROM Teacher t JOIN t.staff s WHERE s.staffId = :staffId")

    Optional<Teacher> findByStaffId(@Param("staffId") Long staffId);

}