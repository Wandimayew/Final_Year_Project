package com.schoolmanagement.User_Service.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.User_Service.model.Permission;
import com.schoolmanagement.User_Service.model.Role;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {

    // Find a permission by name and schoolId, ensuring uniqueness within a tenant
    @Query("SELECT p FROM Permission p WHERE p.name = :name AND p.schoolId = :schoolId AND p.isActive = true")
    Optional<Permission> findByNameAndSchoolId(@Param("name") String name, @Param("schoolId") String schoolId);

    // Fetch all active permissions for a specific school
    @Query("SELECT p FROM Permission p WHERE p.schoolId = :schoolId AND p.isActive = true")
    List<Permission> findBySchoolId(@Param("schoolId") String schoolId);

    // Check if a permission name already exists within a school
    @Query("SELECT COUNT(p) > 0 FROM Permission p WHERE p.name = :name AND p.schoolId = :schoolId AND p.isActive = true")
    boolean existsByNameAndSchoolId(@Param("name") String name, @Param("schoolId") String schoolId);

    // Optional: Find permissions by endpoint and HTTP method (for
    // PermissionCheckFilter optimization)
    @Query("SELECT p FROM Permission p WHERE p.endpoint = :endpoint AND p.httpMethod = :httpMethod AND p.schoolId = :schoolId AND p.isActive = true")
    Optional<Permission> findByEndpointAndHttpMethodAndSchoolId(@Param("endpoint") String endpoint,
            @Param("httpMethod") String httpMethod, @Param("schoolId") String schoolId);

    Optional<Role> findByName(String name);
}