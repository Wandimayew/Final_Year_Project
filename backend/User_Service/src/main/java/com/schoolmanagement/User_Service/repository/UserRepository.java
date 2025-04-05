package com.schoolmanagement.User_Service.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.User_Service.model.User;
import com.schoolmanagement.User_Service.model.UserActivity;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.roles r WHERE u.username = :username AND u.isActive = true")
    Optional<User> findByUsername(@Param("username") String username);

    @Query("SELECT u FROM User u WHERE u.schoolId = :schoolId AND u.isActive = true")
    List<User> findBySchoolId(@Param("schoolId") String schoolId);

    @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.username = :username AND u.isActive = true")
    boolean existsByUsername(@Param("username") String username);

    @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.email = :email AND u.isActive = true")
    boolean existsByEmail(@Param("email") String email);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.roleId IN :roleIds AND u.schoolId = :schoolId AND u.isActive = true")
    List<User> findByRolesAndSchoolId(@Param("roleIds") List<Long> roleIds, @Param("schoolId") String schoolId);

    @Query("SELECT u FROM User u WHERE u.email = :email AND u.isActive = true")
    Optional<User> findByEmailAndSchoolId(@Param("email") String email);

    @Query("SELECT u.userId FROM User u WHERE u.schoolId = :schoolId AND u.isActive = true ORDER BY u.userId DESC")
    List<String> findTopUserIdBySchoolId(@Param("schoolId") String schoolId, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.userId = :userId AND u.schoolId = :schoolId AND u.isActive = true")
    Optional<User> findBySchoolIdAndUserId(@Param("schoolId") String schoolId, @Param("userId") String userId);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :roleName AND u.schoolId = :schoolId AND u.isActive = true")
    List<User> findByRoleNameAndSchoolId(@Param("roleName") String roleName, @Param("schoolId") String schoolId);

    @Query("SELECT u FROM User u WHERE u.userId = :userId AND u.isActive = true")
    Optional<User> findByUserId(@Param("userId") String userId);

    @Query("SELECT u FROM User u WHERE u.userId = :userId AND u.isActive = true")
    User findByUserIdAndActive(@Param("userId") String userId);

    // List<User> findByRoleName(String string);

    @Query("SELECT u FROM User u JOIN u.roles r " +
            "WHERE r.name = :roleName AND u.isActive = true")
    List<User> findByRoleNameAndSchool(@Param("roleName") String roleName);
}