package com.schoolmanagement.communication_service.repository;

import com.schoolmanagement.communication_service.enums.NotificationStatus;
import com.schoolmanagement.communication_service.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Fetch all active notifications for a school
    @Query("SELECT n FROM Notification n WHERE n.schoolId = :schoolId AND n.isActive = true")
    List<Notification> findBySchoolId(@Param("schoolId") String schoolId);

    // Fetch notifications by announcementId with active check
    @Query("SELECT n FROM Notification n WHERE n.announcement.announcementId = :announcementId AND n.isActive = true")
    List<Notification> findByAnnouncementAnnouncementId(@Param("announcementId") Long announcementId);

//     // Fetch failed notifications by schoolId for retry logic
//     @Query("SELECT n FROM Notification n WHERE n.schoolId = :schoolId AND n.status = :status AND n.isActive = true")
//     List<Notification> findBySchoolIdAndStatus(@Param("schoolId") String schoolId, @Param("status") NotificationStatus status);

    // Fetch notifications by recipientId and schoolId with active check
    @Query("SELECT n FROM Notification n WHERE n.schoolId = :schoolId AND n.recipientId = :userId AND n.isActive = true")
    List<Notification> findByRecipientIdAndSchoolId(@Param("schoolId") String schoolId, @Param("userId") String userId);

//     // Fetch unread notifications (status = PENDING) by recipientId and schoolId
//     @Query("SELECT n FROM Notification n WHERE n.schoolId = :schoolId AND n.recipientId = :userId " +
//            "AND n.status = :status AND n.isActive = true")
//     List<Notification> findUnreadByRecipientIdAndSchoolId(
//             @Param("schoolId") String schoolId,
//             @Param("userId") String userId,
//             @Param("status") NotificationStatus status);

    // Fetch a single notification by ID with schoolId and active check
    @Query("SELECT n FROM Notification n WHERE n.notificationId = :notificationId " +
           "AND n.schoolId = :schoolId AND n.isActive = true")
    Notification findByNotificationId(@Param("notificationId") Long notificationId, @Param("schoolId") String schoolId);
}