package com.schoolmanagement.Staff_Service.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import javax.imageio.ImageIO;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.schoolmanagement.Staff_Service.dto.QRCodeRequestDTO;
import com.schoolmanagement.Staff_Service.dto.QRCodeResponseDTO;
import com.schoolmanagement.Staff_Service.enums.QRCodeStatus;
import com.schoolmanagement.Staff_Service.exception.BadRequestException;
import com.schoolmanagement.Staff_Service.model.QRCode;
import com.schoolmanagement.Staff_Service.repository.QRCodeRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;

import java.awt.image.BufferedImage;
import java.io.File;
import java.util.HashMap;

@Service
@Slf4j
@Transactional
@RequiredArgsConstructor
public class QRCodeService {

    private final QRCodeRepository qrCodeRepository;
    private static final String QR_CODE_DIRECTORY = "./uploads/qrcodes";

    /**
     * Generate a QR code for a specific school.
     *
     * @param schoolId    ID of the school.
     * @param generatedBy User who generated the QR code.
     * @return ResponseEntity containing the generated QR code details.
     */
    public ResponseEntity<QRCodeResponseDTO> generateQRCode(QRCodeRequestDTO requestDTO) {
        try {
        validateTimeWindow(
                requestDTO.getStartTimeHour(),
                requestDTO.getStartTimeMinute(),
                requestDTO.getEndTimeHour(),
                requestDTO.getEndTimeMinute());
        log.info("Generating QR Code for school ID: {}", requestDTO.getSchoolId());
        Long schoolId = requestDTO.getSchoolId();

        if (schoolId == null) {
            throw new BadRequestException("School ID is required.");
        }

        String sessionToken = generateSessionToken();
        String qrCodeImage = generateQRCodeImage(sessionToken, requestDTO.getSchoolId());

        QRCode qrCode = QRCode.builder()
                .schoolId(schoolId)
                .startTimeHour(requestDTO.getStartTimeHour())
                .startTimeMinute(requestDTO.getStartTimeMinute())
                .endTimeHour(requestDTO.getEndTimeHour())
                .endTimeMinute(requestDTO.getEndTimeMinute())
                .generatedTime(LocalDateTime.now())
                .sessionToken(sessionToken)
                .qrCodeImage(qrCodeImage)
                .status(QRCodeStatus.ACTIVE)
                .generatedBy(requestDTO.getGeneratedBy())
                .isActive(true)
                .build();

        QRCode savedQRCode = qrCodeRepository.save(qrCode);

        log.info("QR Code generated successfully with session token: {}", savedQRCode.getSessionToken());

        QRCodeResponseDTO responseDTO = convertToResponseDTO(savedQRCode);
        return ResponseEntity.ok(responseDTO);
    }catch (Exception e) {
        log.error("Error generating QR Code", e);
        throw new BadRequestException("Error generating QR Code");
    }
    }

    private String generateQRCodeImage(String sessionToken, Long schoolId) throws Exception {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        String qrContent = String.format("schoolId=%d&token=%s", schoolId, sessionToken);

        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.L);
        hints.put(EncodeHintType.MARGIN, 1);

        BitMatrix bitMatrix = qrCodeWriter.encode(qrContent, BarcodeFormat.QR_CODE, 100, 100, hints);
        BufferedImage qrImage = MatrixToImageWriter.toBufferedImage(bitMatrix);

        File directory = new File(QR_CODE_DIRECTORY);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        String fileName = "qr_" + schoolId + "_" + sessionToken + ".png";
        String filePath = QR_CODE_DIRECTORY + fileName;
        File qrFile = new File(filePath);
        ImageIO.write(qrImage, "PNG", qrFile);

        return filePath;
    }
    public ResponseEntity<QRCodeResponseDTO> getActiveQRCode(Long schoolId) {
        log.info("Looking for an active QR Code for school ID: {}", schoolId);

        LocalDateTime currentTime = LocalDateTime.now();
        Optional<QRCode> activeQRCode = qrCodeRepository.findActiveQRCode(schoolId, QRCodeStatus.ACTIVE, currentTime);

        if (activeQRCode.isEmpty()) {
            throw new EntityNotFoundException("No active QR Code found for school ID: " + schoolId);
        }

        QRCodeResponseDTO responseDTO = convertToResponseDTO(activeQRCode.get());
        return ResponseEntity.ok(responseDTO);
    }

    /**
     * Validate a QR code using the session token.
     *
     * @param sessionToken Session token of the QR code.
     * @return ResponseEntity containing the validated QR code details.
     */
    public ResponseEntity<QRCodeResponseDTO> validateQRCode(Long schoolId, String sessionToken) {
        log.info("Validating QR Code with session token: {}", sessionToken);

        QRCode qrCode = qrCodeRepository.findBySessionToken(sessionToken)
                .orElseThrow(
                        () -> new EntityNotFoundException("QR Code not found with session token: " + sessionToken));

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
   
    /**
     * Generate a unique session token for the QR code.
     *
     * @return Session token.
     */
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

        // Optional: Add additional validations as needed
        if (Duration.between(startTime, endTime).toMinutes() > 120) {
            throw new BadRequestException("Time window cannot exceed 2 hours");
        }
    }

    private String formatTime(int hour, int minute) {
        return String.format("%02d:%02d", hour, minute);
    }

    /**
     * Convert a QRCode entity to a response DTO.
     *
     * @param qrCode QRCode entity.
     * @return QRCodeResponseDTO.
     */
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
