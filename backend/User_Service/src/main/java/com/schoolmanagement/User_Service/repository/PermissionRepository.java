package com.schoolmanagement.User_Service.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.User_Service.model.Permission;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {
   @Query("SELECT p FROM Permission p WHERE LOWER(p.name) = LOWER(:name)")
    Optional<Permission> findByName(@Param("name") String name);
}