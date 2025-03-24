package com.schoolmanagement.User_Service.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.User_Service.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByUsername(String username);

    List<User> findBySchoolId(String schoolId);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.roleId IN :roleIds AND u.isActive = true")
    List<User> findByRoles(@Param("roleIds") List<Long> roleIds);

    User findByEmail(String email);

    @Query("SELECT u.userId FROM User u WHERE u.schoolId = :schoolId ORDER BY u.userId DESC LIMIT 1")
    String findLastUserIdBySchoolId(@Param("schoolId") String schoolId);

    @Query("SELECT u FROM User u WHERE u.schoolId= :schoolId AND u.userId= :userId and u.isActive= true")
    User findBySchoolAndUserId(@Param("schoolId") String schoolId,@Param("userId") String userId);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name IN :role AND u.schoolId = :schoolId AND u.isActive = true")
    List<User> findByRoleAndSchoolId(@Param("role") String role, @Param("schoolId") String schoolId);

    
}
