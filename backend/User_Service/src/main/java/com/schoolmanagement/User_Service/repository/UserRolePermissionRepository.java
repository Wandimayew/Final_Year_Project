package com.schoolmanagement.User_Service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.schoolmanagement.User_Service.model.Permission;
import com.schoolmanagement.User_Service.model.Role;
import com.schoolmanagement.User_Service.model.UserRolePermission;

@Repository
public interface UserRolePermissionRepository extends JpaRepository<UserRolePermission, Long> {

        // Fetch active permissions for a user within a school (used in
        // PermissionService.getUserPermissions)
        @Query("SELECT urp FROM UserRolePermission urp WHERE urp.user.userId = :userId AND urp.schoolId = :schoolId AND urp.isActive = true")
        List<UserRolePermission> findActivePermissionsByUserIdAndSchoolId(@Param("userId") String userId,
                        @Param("schoolId") String schoolId);

        // Fetch active UserRolePermissions for a specific user and role
        @Query("SELECT urp FROM UserRolePermission urp WHERE urp.user.userId = :userId AND urp.role.roleId = :roleId AND urp.schoolId = :schoolId AND urp.isActive = true")
        List<UserRolePermission> findActiveByUserAndRole(@Param("userId") String userId, @Param("roleId") Long roleId,
                        @Param("schoolId") String schoolId);

        // Soft delete UserRolePermissions by user and role
        @Modifying
        @Transactional
        @Query("UPDATE UserRolePermission urp SET urp.isActive = false, urp.updatedAt = CURRENT_TIMESTAMP WHERE urp.user.userId = :userId AND urp.role.roleId = :roleId AND urp.schoolId = :schoolId")
        void softDeleteByUserAndRole(@Param("userId") String userId, @Param("roleId") Long roleId,
                        @Param("schoolId") String schoolId);

        // Hard delete UserRolePermissions by user and role
        @Modifying
        @Transactional
        @Query("DELETE FROM UserRolePermission urp WHERE urp.user.userId = :userId AND urp.role.roleId = :roleId AND urp.schoolId = :schoolId")
        void deleteByUserIdAndRoleId(@Param("userId") String userId, @Param("roleId") Long roleId,
                        @Param("schoolId") String schoolId);

        // Optional: Fetch all active permissions for a user (alternative to
        // findActivePermissionsByUserIdAndSchoolId)
        @Query("SELECT urp FROM UserRolePermission urp WHERE urp.user.userId = :userId AND urp.schoolId = :schoolId AND urp.isActive = true")
        List<UserRolePermission> findActiveRoleByUser(@Param("userId") String userId,
                        @Param("schoolId") String schoolId);

        @Query("SELECT urp FROM UserRolePermission urp JOIN FETCH urp.permission WHERE urp.role = :role AND urp.schoolId = :schoolId AND urp.isActive= true")
        List<UserRolePermission> findByRoleAndSchoolId(@Param("role") Role role,
                        @Param("schoolId") String schoolId);

        boolean existsByRoleAndPermissionAndSchoolId(Role role, Permission permission, String schoolId);

        @Query("SELECT urp FROM UserRolePermission urp WHERE urp.role.roleId = :roleId AND urp.schoolId = :schoolId AND urp.type = 'default' AND urp.isActive = true")
        List<UserRolePermission> findPermissionsByRoleAndSchool(@Param("roleId") Long roleId,
                        @Param("schoolId") String schoolId);
}