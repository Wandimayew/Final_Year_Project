package com.schoolmanagement.communication_service.repository;

import com.schoolmanagement.communication_service.model.EmailMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmailMessageRepository extends JpaRepository<EmailMessage, String> {

       // Fetch an email by ID with schoolId and isActive check with attachments
       @Query("SELECT e FROM EmailMessage e LEFT JOIN FETCH e.attachments WHERE e.emailId = :emailId AND e.schoolId = :schoolId AND e.isActive = true")
       EmailMessage findByEmailId(
                     @Param("emailId") String emailId,
                     @Param("schoolId") String schoolId);

       // Fetch an email by ID with schoolId, isActive, and userId (sender or receiver)
       // check with attachments
       @Query("SELECT e FROM EmailMessage e LEFT JOIN FETCH e.attachments " +
                     "WHERE e.emailId = :emailId AND e.schoolId = :schoolId AND e.isActive = true " +
                     "AND ((e.senderId = :userId AND e.senderDeleted = false) OR (e.recipientId = :userId AND e.recipientDeleted = false))")
       EmailMessage findByEmailIdAndUserId(
                     @Param("emailId") String emailId,
                     @Param("schoolId") String schoolId,
                     @Param("userId") String userId);

       // Paginated query for SENT emails (no FETCH)
       @Query("SELECT e FROM EmailMessage e " +
                     "WHERE e.senderId = :userId AND e.senderStatus = :status AND e.schoolId = :schoolId AND e.isActive = true AND e.senderDeleted = false")
       Page<EmailMessage> findBySenderIdAndStatus(
                     @Param("userId") String userId,
                     @Param("status") EmailMessage.Status status,
                     @Param("schoolId") String schoolId,
                     Pageable pageable);

       // Paginated query for DRAFT emails (no FETCH)
       @Query("SELECT e FROM EmailMessage e " +
                     "WHERE e.senderId = :userId AND e.senderStatus = :status AND e.schoolId = :schoolId AND e.isActive = true AND e.isDraft = true AND e.senderDeleted = false")
       Page<EmailMessage> findDraftsBySenderId(
                     @Param("userId") String userId,
                     @Param("status") EmailMessage.Status status,
                     @Param("schoolId") String schoolId,
                     Pageable pageable);

       // Paginated query for INBOX emails (no FETCH), excluding TRASH
       @Query("SELECT e FROM EmailMessage e " +
                     "WHERE e.recipientId = :userId " +
                     "AND e.recipientStatus != com.schoolmanagement.communication_service.model.EmailMessage.Status.TRASH "
                     +
                     "AND e.schoolId = :schoolId " +
                     "AND e.isActive = true AND e.recipientDeleted = false")
       Page<EmailMessage> findInboxByRecipientId(
                     @Param("userId") String userId,
                     @Param("schoolId") String schoolId,
                     Pageable pageable);

       // Paginated query for recipient emails (INBOX, IMPORTANT, TRASH) (no FETCH)
       @Query("SELECT e FROM EmailMessage e " +
                     "WHERE e.recipientId = :userId AND e.recipientStatus = :status AND e.schoolId = :schoolId AND e.isActive = true AND e.recipientDeleted = false")
       Page<EmailMessage> findByRecipientIdAndStatus(
                     @Param("userId") String userId,
                     @Param("status") EmailMessage.Status status,
                     @Param("schoolId") String schoolId,
                     Pageable pageable);

       // Fetch full EmailMessage entities with attachments for a list of IDs
       @Query("SELECT e FROM EmailMessage e LEFT JOIN FETCH e.attachments " +
                     "WHERE e.emailId IN :emailIds AND e.schoolId = :schoolId AND e.isActive = true " +
                     "AND ((e.senderId = :userId AND e.senderDeleted = false) OR (e.recipientId = :userId AND e.recipientDeleted = false))")
       List<EmailMessage> findByEmailIdsWithAttachments(
                     @Param("emailIds") List<String> emailIds,
                     @Param("schoolId") String schoolId,
                     @Param("userId") String userId);
}