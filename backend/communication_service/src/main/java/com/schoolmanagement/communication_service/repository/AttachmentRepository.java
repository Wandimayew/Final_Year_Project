package com.schoolmanagement.communication_service.repository;

import com.schoolmanagement.communication_service.model.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, String> {

    // Fetch attachments for a specific email with schoolId and isActive check
    @Query("SELECT a FROM Attachment a WHERE a.emailMessage.emailId = :emailId " +
           "AND a.schoolId = :schoolId AND a.isActive = true")
    List<Attachment> findByEmailId(
            @Param("emailId") String emailId,
            @Param("schoolId") String schoolId);

    // Fetch an attachment by ID with schoolId and isActive check
    @Query("SELECT a FROM Attachment a WHERE a.attachmentId = :attachmentId " +
           "AND a.schoolId = :schoolId AND a.isActive = true")
    Attachment findByAttachmentId(
            @Param("attachmentId") String attachmentId,
            @Param("schoolId") String schoolId);
}