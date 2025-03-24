package com.schoolmanagement.communication_service.repository;

import com.schoolmanagement.communication_service.enums.NotificationStatus;
import com.schoolmanagement.communication_service.model.UserNotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserNotificationStatusRepository extends JpaRepository<UserNotificationStatus, Long> {

    // Fetch status by notification ID and user ID
    Optional<UserNotificationStatus> findByNotificationNotificationIdAndUserId(
            @Param("notificationId") Long notificationId, @Param("userId") String userId);

    // Fetch all statuses for a user by status (e.g., unread notifications)
    @Query("SELECT uns FROM UserNotificationStatus uns WHERE uns.userId = :userId AND uns.status = :status")
    List<UserNotificationStatus> findByUserIdAndStatus(
            @Param("userId") String userId, @Param("status") NotificationStatus status);

    // Fetch all statuses for a notification (useful for multi-recipient notifications)
    @Query("SELECT uns FROM UserNotificationStatus uns WHERE uns.notification.notificationId = :notificationId")
    List<UserNotificationStatus> findByNotificationNotificationId(@Param("notificationId") Long notificationId);
}