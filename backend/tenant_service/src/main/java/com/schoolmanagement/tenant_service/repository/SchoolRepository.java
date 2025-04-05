package com.schoolmanagement.tenant_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.tenant_service.model.School;

@Repository
public interface SchoolRepository extends JpaRepository<School, String> {
    @Query("SELECT s FROM School s WHERE s.school_id = :school_id AND s.isActive = true")
    School findBySchool_id(@Param("school_id") String school_id);

    @Query("SELECT s FROM School s WHERE s.isActive = true")
    List<School> findAllSchoolThatIsActive();

    @Query("SELECT s FROM School s WHERE s.isActive = false")
    List<School> findAllSchoolThatIsNotActive();

}
