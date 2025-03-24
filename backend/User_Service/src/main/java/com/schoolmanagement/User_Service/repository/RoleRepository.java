package com.schoolmanagement.User_Service.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.User_Service.model.Role;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);
    List<Role> findBySchoolId(String schoolId);
    @Query("SELECT r FROM Role r WHERE LOWER(r.name) = LOWER(:name) AND r.schoolId = :schoolId")
    Optional<Role> findBySchoolIdAndName(@Param("schoolId") String schoolId, @Param("name") String name);
}