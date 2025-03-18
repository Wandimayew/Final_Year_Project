package com.schoolmanagement.Staff_Service.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.Staff_Service.enums.QRCodeStatus;
import com.schoolmanagement.Staff_Service.model.QRCode;

@Repository
public interface QRCodeRepository extends JpaRepository<QRCode, Long> {
    Optional<QRCode> findBySessionToken(String sessionToken);

    @Query("SELECT q FROM QRCode q " +
           "WHERE q.schoolId = :schoolId " +
           "AND q.status = :status " +
           "AND q.isActive = true " +
           "AND TIME(q.generatedTime) <= TIME(:currentTime) " +
           "AND TIME(CONCAT(q.startTimeHour, ':', q.startTimeMinute)) <= TIME(:currentTime) " +
           "AND TIME(CONCAT(q.endTimeHour, ':', q.endTimeMinute)) >= TIME(:currentTime) " +
           "ORDER BY q.generatedTime DESC LIMIT 1")
    Optional<QRCode> findActiveQRCode(@Param("schoolId") String schoolId,
    @Param("status") QRCodeStatus status,
    @Param("currentTime") LocalDateTime currentTime);
}

   

