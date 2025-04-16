package com.schoolmanagement.Staff_Service.service;

import java.time.Duration;
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
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;

import com.schoolmanagement.Staff_Service.dto.QRCodeRequestDTO;
import com.schoolmanagement.Staff_Service.dto.QRCodeResponseDTO;
import com.schoolmanagement.Staff_Service.enums.QRCodeStatus;
import com.schoolmanagement.Staff_Service.exception.BadRequestException;
import com.schoolmanagement.Staff_Service.model.QRCode;
import com.schoolmanagement.Staff_Service.repository.QRCodeRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.Base64;
import javax.imageio.ImageIO;

@Service
@Slf4j
@Transactional
@RequiredArgsConstructor
public class QRCodeService {

    private final QRCodeRepository qrCodeRepository;

    /**
     * Generate a QR code for a specific school, extracting schoolId from the token if not provided.
     */
    public ResponseEntity<QRCodeResponseDTO> generateQRCode(QRCodeRequestDTO requestDTO, Authentication authentication) {
        try {
            // Extract schoolId from JWT if not provided in request
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

            // Deactivate existing active QR code
            qrCodeRepository.findActiveQRCode(schoolId, QRCodeStatus.ACTIVE, LocalDateTime.now())
                .ifPresent(existingQR -> {
                    existingQR.setStatus(QRCodeStatus.EXPIRED);
                    existingQR.setIsActive(false);
                    qrCodeRepository.save(existingQR);
                    log.info("Deactivated existing QR Code with session token: {}", existingQR.getSessionToken());
                });

            String sessionToken = generateSessionToken();
            String qrCodeImageBase64 = generateQRCodeImage(sessionToken, schoolId);

            QRCode qrCode = QRCode.builder()
                .schoolId(schoolId)
                .startTimeHour(requestDTO.getStartTimeHour())
                .startTimeMinute(requestDTO.getStartTimeMinute())
                .endTimeHour(requestDTO.getEndTimeHour())
                .endTimeMinute(requestDTO.getEndTimeMinute())
                .generatedTime(LocalDateTime.now())
                .sessionToken(sessionToken)
                .qrCodeImage(qrCodeImageBase64) // Store Base64 string directly
                .status(QRCodeStatus.ACTIVE)
                .generatedBy(requestDTO.getGeneratedBy())
                .isActive(true)
                .build();

            QRCode savedQRCode = qrCodeRepository.save(qrCode);
            log.info("QR Code generated successfully with session token: {}", savedQRCode.getSessionToken());

            QRCodeResponseDTO responseDTO = convertToResponseDTO(savedQRCode);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            log.error("Error generating QR Code", e);
            throw new BadRequestException("Error generating QR Code: " + e.getMessage());
        }
    }

    private String generateQRCodeImage(String sessionToken, String schoolId) throws Exception {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        String qrContent = String.format("schoolId=%s&token=%s", schoolId, sessionToken);

        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.L);
        hints.put(EncodeHintType.MARGIN, 1);

        BitMatrix bitMatrix = qrCodeWriter.encode(qrContent, BarcodeFormat.QR_CODE, 200, 200, hints);
        BufferedImage qrImage = MatrixToImageWriter.toBufferedImage(bitMatrix);

        // Convert to Base64 directly instead of saving to file
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

    public ResponseEntity<QRCodeResponseDTO> validateQRCode(String schoolId, String sessionToken) {
        log.info("Validating QR Code with session token: {}", sessionToken);

        QRCode qrCode = qrCodeRepository.findBySessionToken(sessionToken)
            .orElseThrow(() -> new EntityNotFoundException("QR Code not found with session token: " + sessionToken));

        if (!isWithinValidTimeWindow(qrCode)) {
            throw new BadRequestException("QR Code can only be used between " +
                formatTime(qrCode.getStartTimeHour(), qrCode.getStartTimeMinute()) + " and " +
                formatTime(qrCode.getEndTimeHour(), qrCode.getEndTimeMinute()));
        }

        if (!qrCode.getSchoolId().equals(schoolId)) {
            throw new BadRequestException("QR Code is not valid for this school");
        }
        log.info("QR Code validation successful for session token: {}", sessionToken);

        QRCodeResponseDTO responseDTO = convertToResponseDTO(qrCode);
        return ResponseEntity.ok(responseDTO);
    }

    private String generateSessionToken() {
        return UUID.randomUUID().toString();
    }

    private boolean isWithinValidTimeWindow(QRCode qrCode) {
        LocalTime now = LocalTime.now();
        LocalTime startTime = LocalTime.of(qrCode.getStartTimeHour(), qrCode.getStartTimeMinute());
        LocalTime endTime = LocalTime.of(qrCode.getEndTimeHour(), qrCode.getEndTimeMinute());
        return !now.isBefore(startTime) && !now.isAfter(endTime);
    }

    private void validateTimeWindow(int startHour, int startMinute, int endHour, int endMinute) {
        LocalTime startTime = LocalTime.of(startHour, startMinute);
        LocalTime endTime = LocalTime.of(endHour, endMinute);

        if (endTime.isBefore(startTime)) {
            throw new BadRequestException("End time must be after start time");
        }

        if (Duration.between(startTime, endTime).toMinutes() > 120) {
            throw new BadRequestException("Time window cannot exceed 2 hours");
        }
    }

    private String formatTime(int hour, int minute) {
        return String.format("%02d:%02d", hour, minute);
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
            .qrCodeImage(qrCode.getQrCodeImage()) // Already Base64
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