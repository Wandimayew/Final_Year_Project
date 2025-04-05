package com.schoolmanagement.User_Service.repository;

import com.schoolmanagement.User_Service.model.UserActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserActivityRepository extends JpaRepository<UserActivity, Long> {

    List<UserActivity> findBySchoolId(String schoolId);

    List<UserActivity> findByUserIdIn(List<String> userIds);

    @Query("SELECT ua FROM UserActivity ua " +
            "WHERE ua.userId IN :userIds")
    List<UserActivity> findByUserIds(@Param("userIds") List<String> userIds);
}