package com.schoolmanagement.communication_service.repository;

import com.schoolmanagement.communication_service.enums.AnnouncementStatus;
import com.schoolmanagement.communication_service.model.Announcement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Repository interface for managing Announcement entities.
 * Provides CRUD operations and custom queries for announcements.
 */
@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

        /**
         * Find all announcements for a given school with statuses PUBLISHED, CANCELLED,
         * or EXPIRED, with pagination support.
         *
         * @param schoolId the ID of the school
         * @param pageable pagination information (page number, size, sorting)
         * @return a page of announcements with specified statuses
         */
        @Query("SELECT a FROM Announcement a WHERE a.schoolId = :schoolId AND a.status IN ('PUBLISHED', 'EXPIRED') AND a.isActive = true")
        Page<Announcement> findBySchoolId(@Param("schoolId") String schoolId, Pageable pageable);

        /**
         * Find all announcements for a given user with statuses DRAFT, PENDING,CANCELLED,
         * with pagination support.
         *
         * @param schoolId the ID of the school
         * @param userId the ID of the user
         * @param pageable pagination information (page number, size, sorting)
         * @return a page of announcements with specified statuses
         */
        @Query("SELECT a FROM Announcement a WHERE a.schoolId = :schoolId AND a.authorId = :userId AND a.status IN ('PENDING','CANCELLED','DRAFT') AND a.isActive= true")
        Page<Announcement> findByStatusDraft(@Param("schoolId") String schoolId,@Param("userId") String userId, Pageable pageable);

        /**
         * Find all announcements for a given school and author except PENDING.
         */
        @Query("SELECT a FROM Announcement a WHERE a.schoolId = :schoolId AND a.authorId = :authorId AND a.status != 'PENDING'")
        Page<Announcement> findBySchoolIdAndAuthorId(@Param("schoolId") String schoolId,
                        @Param("authorId") String authorId, Pageable pageable);

        /**
         * Find an announcement by its ID and school ID, ensuring it’s active.
         *
         * @param announcementId the ID of the announcement
         * @param schoolId       the ID of the school
         * @return an Optional containing the announcement if found
         */
        @Query("SELECT a FROM Announcement a WHERE a.announcementId = :announcementId AND a.schoolId = :schoolId AND a.isActive = true")
        Optional<Announcement> findByAnnouncementIdAndSchoolId(@Param("announcementId") Long announcementId,
                        @Param("schoolId") String schoolId);

        /**
         * Find all active announcements that are scheduled or sent, within the active
         * date range.
         *
         * @param schoolId    the ID of the school
         * @param currentTime the current time to check against startDate and endDate
         * @param pageable    pagination information
         * @return a page of active announcements
         */
        @Query("SELECT a FROM Announcement a WHERE a.schoolId = :schoolId AND a.isActive = true " +
                        "AND (a.status = 'SCHEDULED' OR a.status = 'SENT') " +
                        "AND a.startDate <= :currentTime AND a.endDate >= :currentTime")
        Page<Announcement> findActiveAnnouncements(@Param("schoolId") String schoolId,
                        @Param("currentTime") LocalDateTime currentTime, Pageable pageable);

        /**
         * Find all active announcements for a given school and status, with pagination
         * support.
         * Used to fetch announcements by specific status (e.g., PENDING) for admin
         * review.
         *
         * @param schoolId the ID of the school
         * @param status   the status of the announcements (e.g., PENDING)
         * @param pageable pagination information
         * @return a page of announcements matching the school ID and status
         */
        @Query("SELECT a FROM Announcement a WHERE a.schoolId = :schoolId AND a.status = :status AND a.isActive = true")
        Page<Announcement> findBySchoolIdAndStatus(@Param("schoolId") String schoolId,
                        @Param("status") AnnouncementStatus status,
                        Pageable pageable);

        /**
         * Find all active announcements for a given school, status, and author, with
         * pagination support.
         * Used to fetch a creator's pending announcements awaiting approval.
         *
         * @param schoolId the ID of the school
         * @param status   the status of the announcements (e.g., PENDING)
         * @param authorId the ID of the creator/author
         * @param pageable pagination information
         * @return a page of announcements matching the school ID, status, and author ID
         */
        @Query("SELECT a FROM Announcement a WHERE a.schoolId = :schoolId AND a.status = :status AND a.authorId = :authorId AND a.isActive = true")
        Page<Announcement> findBySchoolIdAndStatusAndAuthorId(@Param("schoolId") String schoolId,
                        @Param("status") AnnouncementStatus status,
                        @Param("authorId") String authorId,
                        Pageable pageable);
}