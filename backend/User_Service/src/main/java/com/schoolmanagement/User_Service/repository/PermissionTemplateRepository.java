package com.schoolmanagement.User_Service.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.schoolmanagement.User_Service.model.PermissionTemplate;

public interface PermissionTemplateRepository extends JpaRepository<PermissionTemplate, Long> {

    // Fetch all active permission templates for bootstrapping
    @Query("SELECT pt FROM PermissionTemplate pt WHERE pt.isActive = true")
    List<PermissionTemplate> findByIsActiveTrue();

    // Find a permission template by endpoint and HTTP method for permission
    // checking
    @Query("SELECT pt FROM PermissionTemplate pt WHERE pt.endpoint = :endpoint AND pt.httpMethod = :httpMethod AND pt.isActive = true")
    Optional<PermissionTemplate> findByEndpointAndHttpMethod(@Param("endpoint") String endpoint,
            @Param("httpMethod") String httpMethod);

    // Optional: Check for existence to avoid duplicates during template creation
    @Query("SELECT COUNT(pt) > 0 FROM PermissionTemplate pt WHERE pt.name = :name AND pt.isActive = true")
    boolean existsByName(@Param("name") String name);
}