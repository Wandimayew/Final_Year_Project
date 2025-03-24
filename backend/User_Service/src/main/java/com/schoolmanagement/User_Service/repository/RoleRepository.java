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

        // Find a role by name and schoolId, ensuring tenant-specific uniqueness
        @Query("SELECT r FROM Role r WHERE r.name = :name AND r.schoolId = :schoolId AND r.isActive = true")
        Optional<Role> findByNameAndSchoolId(@Param("name") String name, @Param("schoolId") String schoolId);

        // Fetch all active roles for a specific school
        @Query("SELECT r FROM Role r WHERE r.schoolId = :schoolId AND r.isActive = true")
        List<Role> findBySchoolId(@Param("schoolId") String schoolId);

        // Check if a role name already exists within a school
        @Query("SELECT COUNT(r) > 0 FROM Role r WHERE r.name = :name AND r.schoolId = :schoolId AND r.isActive = true")
        boolean existsByNameAndSchoolId(@Param("name") String name, @Param("schoolId") String schoolId);

        // New method to fetch roles by userId
        @Query(value = "SELECT r.role_id, r.name, r.school_id, r.description, r.is_active, r.created_at, r.updated_at, r.created_by, r.updated_by "
                        +
                        "FROM roles r " +
                        "JOIN user_roles ur ON r.role_id = ur.role_id " +
                        "WHERE ur.user_id = :userId AND r.is_active = 1", nativeQuery = true)
        List<Object[]> findRolesByUserIdNative(@Param("userId") String userId);

        @Query("SELECT r.name FROM Role r " +
                        "JOIN r.users u " +
                        "WHERE u.userId = :userId AND r.isActive = true")
        List<String> findRolesByUserId(@Param("userId") String userId);

        @Query("SELECT CASE WHEN COUNT(r) > 0 THEN TRUE ELSE FALSE END FROM Role r WHERE r.schoolId = :schoolId")
        boolean existsBySchoolId(@Param("schoolId") String schoolId);
}