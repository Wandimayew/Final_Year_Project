package com.schoolmanagement.Staff_Service.service;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.schoolmanagement.Staff_Service.config.JwtUtil;
import com.schoolmanagement.Staff_Service.dto.QRCodeRequestDTO;
import com.schoolmanagement.Staff_Service.dto.QRCodeResponseDTO;
import com.schoolmanagement.Staff_Service.enums.QRCodeStatus;
import com.schoolmanagement.Staff_Service.exception.BadRequestException;
import com.schoolmanagement.Staff_Service.model.QRCode;
import com.schoolmanagement.Staff_Service.repository.QRCodeRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import javax.imageio.ImageIO;
import java.util.Base64;

@Service
@Slf4j
@Transactional
@RequiredArgsConstructor
public class QRCodeService {

    private final QRCodeRepository qrCodeRepository;
    private final JwtUtil jwtUtil;
    private final String frontendBaseUrl = "http://10.194.61.74:3000";

    public ResponseEntity<QRCodeResponseDTO> generateQRCode(QRCodeRequestDTO requestDTO, Authentication authentication) {
        try {
            String schoolId = requestDTO.getSchoolId();
            if (schoolId == null && authentication != null && authentication.getPrincipal() instanceof Jwt) {
                Jwt jwt = (Jwt) authentication.getPrincipal();
                schoolId = jwt.getClaimAsString("schoolId");
                if (schoolId == null) {
                    throw new BadRequestException("School ID not found in token or request.");
                }
            }

            validateTimeWindow(
                requestDTO.getStartTimeHour(),
                requestDTO.getStartTimeMinute(),
                requestDTO.getEndTimeHour(),
                requestDTO.getEndTimeMinute());
            log.info("Generating QR Code for school ID: {}", schoolId);

            qrCodeRepository.findActiveQRCode(schoolId, QRCodeStatus.ACTIVE, LocalDateTime.now())
                .ifPresent(existingQR -> {
                    existingQR.setStatus(QRCodeStatus.EXPIRED);
                    existingQR.setIsActive(false);
                    qrCodeRepository.save(existingQR);
                    log.info("Deactivated existing QR Code with qrCodeUUID: {}", existingQR.getQrCodeUUID());
                });

            QRCode qrCode = new QRCode();
            qrCode.setSchoolId(schoolId);
            qrCode.setGeneratedBy(requestDTO.getGeneratedBy());

            QRCode savedQRCode = generateQRCodeInternal(qrCode);
            log.info("QR Code generated successfully with qrCodeUUID: {}", savedQRCode.getQrCodeUUID());

            QRCodeResponseDTO responseDTO = convertToResponseDTO(savedQRCode);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            log.error("Error generating QR Code", e);
            throw new BadRequestException("Error generating QR Code: " + e.getMessage());
        }
    }

    private QRCode generateQRCodeInternal(QRCode qrCode) throws WriterException, java.io.IOException {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiryTime = now.plusHours(10); // Default 10 hours
        String qrCodeUUID = UUID.randomUUID().toString();

        String jwtToken = JwtUtil.generateToken(
            qrCode.getSchoolId(),
            qrCodeUUID,
            expiryTime
        );

        String qrCodeUrl = String.format("%s/attendance/scan?token=%s", frontendBaseUrl, jwtToken);
        String qrCodeImageBase64 = generateQRCodeImage(qrCodeUrl, 200, 200);

        qrCode.setGeneratedTime(now);
        qrCode.setExpiryTime(qrCode.getExpiryTime() != null ? qrCode.getExpiryTime() : expiryTime);
        qrCode.setSessionToken(jwtToken);
        qrCode.setQrCodeUUID(qrCodeUUID);
        qrCode.setQrCodeImage(qrCodeImageBase64);
        qrCode.setStatus(QRCodeStatus.ACTIVE);
        qrCode.setIsActive(true);

        return qrCodeRepository.save(qrCode);
    }

    private String generateQRCodeImage(String qrCodeUrl, int width, int height) throws WriterException, java.io.IOException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();

        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.L);
        hints.put(EncodeHintType.MARGIN, 1);

        BitMatrix bitMatrix = qrCodeWriter.encode(qrCodeUrl, BarcodeFormat.QR_CODE, width, height, hints);
        BufferedImage qrImage = MatrixToImageWriter.toBufferedImage(bitMatrix);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(qrImage, "PNG", baos);
        byte[] imageBytes = baos.toByteArray();
        return Base64.getEncoder().encodeToString(imageBytes);
    }

    public ResponseEntity<QRCodeResponseDTO> getActiveQRCode(String schoolId) {
        log.info("Looking for an active QR Code for school ID: {}", schoolId);

        LocalDateTime currentTime = LocalDateTime.now();
        Optional<QRCode> activeQRCode = qrCodeRepository.findActiveQRCode(schoolId, QRCodeStatus.ACTIVE, currentTime);

        if (activeQRCode.isEmpty()) {
            throw new EntityNotFoundException("No active QR Code found for school ID: " + schoolId);
        }

        QRCodeResponseDTO responseDTO = convertToResponseDTO(activeQRCode.get());
        return ResponseEntity.ok(responseDTO);
    }

    public ResponseEntity<QRCodeResponseDTO> validateQRCode(String qrCodeUUID, String schoolId) {
        log.info("Validating QR Code with qrCodeUUID: {}", qrCodeUUID);

        QRCode qrCode = qrCodeRepository.findByQrCodeUUID(qrCodeUUID)
            .orElseThrow(() -> new EntityNotFoundException("QR Code not found with qrCodeUUID: " + qrCodeUUID));

        if (!isWithinValidTimeWindow(qrCode)) {
            throw new BadRequestException("QR Code is expired or not yet valid.");
        }

        if (!qrCode.getSchoolId().equals(schoolId)) {
            throw new BadRequestException("QR Code is not valid for this school.");
        }
        log.info("QR Code validation successful for qrCodeUUID: {}", qrCodeUUID);

        QRCodeResponseDTO responseDTO = convertToResponseDTO(qrCode);
        return ResponseEntity.ok(responseDTO);
    }

    private boolean isWithinValidTimeWindow(QRCode qrCode) {
        LocalDateTime now = LocalDateTime.now();
        return now.isAfter(qrCode.getGeneratedTime()) && now.isBefore(qrCode.getExpiryTime());
    }

    private void validateTimeWindow(int startHour, int startMinute, int endHour, int endMinute) {
        LocalTime startTime = LocalTime.of(startHour, startMinute);
        LocalTime endTime = LocalTime.of(endHour, endMinute);

        if (endTime.isBefore(startTime)) {
            throw new BadRequestException("End time must be after start time");
        }

        long minutesBetween = java.time.Duration.between(startTime, endTime).toMinutes();
        if (minutesBetween > 120) {
            throw new BadRequestException("Time window cannot exceed 2 hours");
        }
    }

    private QRCodeResponseDTO convertToResponseDTO(QRCode qrCode) {
        return QRCodeResponseDTO.builder()
            .qrCodeId(qrCode.getQrCodeId())
            .schoolId(qrCode.getSchoolId())
            .startTimeHour(qrCode.getStartTimeHour())
            .startTimeMinute(qrCode.getStartTimeMinute())
            .endTimeHour(qrCode.getEndTimeHour())
            .endTimeMinute(qrCode.getEndTimeMinute())
            .generatedTime(qrCode.getGeneratedTime())
            .sessionToken(qrCode.getSessionToken())
            .qrCodeUUID(qrCode.getQrCodeUUID())
            .qrCodeImage(qrCode.getQrCodeImage())
            .status(qrCode.getStatus())
            .generatedBy(qrCode.getGeneratedBy())
            .createdAt(qrCode.getCreatedAt())
            .updatedAt(qrCode.getUpdatedAt())
            .createdBy(qrCode.getCreatedBy())
            .updatedBy(qrCode.getUpdatedBy())
            .isActive(qrCode.getIsActive())
            .build();
    }
}