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

    @Query("SELECT q FROM QRCode q WHERE q.schoolId = :schoolId " +
            "AND q.status = :status " +
            "AND q.isActive = true " +
            "AND FUNCTION('TIME', q.generatedTime) <= FUNCTION('TIME', :currentTime) " +
            "AND FUNCTION('TIME', CONCAT(q.startTimeHour, ':', q.startTimeMinute)) <= FUNCTION('TIME', :currentTime) " +
            "AND FUNCTION('TIME', CONCAT(q.endTimeHour, ':', q.endTimeMinute)) >= FUNCTION('TIME', :currentTime)")
    Optional<QRCode> findActiveQRCode(@Param("schoolId") Long schoolId,
            @Param("status") QRCodeStatus status,
            @Param("currentTime") LocalDateTime currentTime);

}