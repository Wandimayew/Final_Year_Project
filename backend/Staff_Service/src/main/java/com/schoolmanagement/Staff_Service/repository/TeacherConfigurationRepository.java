package com.schoolmanagement.Staff_Service.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.Staff_Service.model.TeacherConfiguration;

@Repository
public interface TeacherConfigurationRepository extends JpaRepository<TeacherConfiguration, Long> {

    @Query("SELECT tc FROM TeacherConfiguration tc WHERE tc.teacher.teacherId = :teacherId AND tc.schoolId = :schoolId")
    Optional<TeacherConfiguration> findByTeacherIdAndSchoolId(Long teacherId, String schoolId);
}
