package com.schoolmanagement.student_service.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.schoolmanagement.student_service.config.JwtUtil;
import com.schoolmanagement.student_service.model.QRCode;
import com.schoolmanagement.student_service.repository.QRCodeRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class QRCodeService {
    private final QRCodeRepository qrCodeRepository;

    // Get all QR codes
    public List<QRCode> getAllQRCodes() {
        return qrCodeRepository.findAll();
    }

    // Get a QR code by ID
    public QRCode getQRCodeById(Long id) {
        QRCode qrCode = qrCodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("QR Code not found with id: " + id));
        String qrCodeImageBase64;
        try {
            // Assuming qrCodeImage is a file path; adjust if it's different
            byte[] imageBytes = Files.readAllBytes(Path.of(qrCode.getQrCodePath()));
            qrCodeImageBase64 = Base64.getEncoder().encodeToString(imageBytes);
        } catch (Exception e) {
            log.error("Error converting QR Code image to Base64", e);
            throw new RuntimeException("Failed to convert QR Code image to Base64");
        }
        qrCode.setQrCodePath(qrCodeImageBase64);
        return qrCode;
    }

    public List<QRCode> getAllQRCodes(Long classId, Long sectionId) {
        if (classId != null && sectionId != null) {
            // Filter by both classId and sectionId
            return qrCodeRepository.findByClassIdAndSectionId(classId, sectionId);
        } else if (classId != null) {
            // Filter by classId only
            return qrCodeRepository.findByClassId(classId);
        } else if (sectionId != null) {
            // Filter by sectionId only
            return qrCodeRepository.findBySectionId(sectionId);
        } else {
            // No filters applied, return all QR codes
            return qrCodeRepository.findAll();
        }
    }

    // Create a new QR code
    public QRCode createQRCode(QRCode qrCode) {
        return qrCodeRepository.save(qrCode);
    }

    // Update an existing QR code
    public QRCode updateQRCode(Long id, QRCode qrCodeDetails) {
        QRCode existingQRCode = qrCodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("QR Code not found with id: " + id));

        // Update fields
        existingQRCode.setSchoolId(qrCodeDetails.getSchoolId());
        existingQRCode.setClassId(qrCodeDetails.getClassId());
        existingQRCode.setSectionId(qrCodeDetails.getSectionId());
        existingQRCode.setGeneratedTime(qrCodeDetails.getGeneratedTime());
        existingQRCode.setExpiryTime(qrCodeDetails.getExpiryTime());
        existingQRCode.setSessionToken(qrCodeDetails.getSessionToken());
        existingQRCode.setGeneratedBy(qrCodeDetails.getGeneratedBy());
        existingQRCode.setQrCodePath(qrCodeDetails.getQrCodePath());
        existingQRCode.setStatus(qrCodeDetails.getStatus());

        // Save the updated QR code
        return qrCodeRepository.save(existingQRCode);
    }

    // Delete a QR code
    public void deleteQRCode(Long id) {
        QRCode qrCode = qrCodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("QR Code not found with id: " + id));
        qrCodeRepository.delete(qrCode);
    }

    public QRCode generateQRCode(QRCode qrCode) throws WriterException, IOException {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiryTime = now.plusHours(10);
        // String jwtToken = "TOKEN-" + qrCode.getSectionId() + "-" + now.toString();

        String qrCodeUUID = UUID.randomUUID().toString();

        long schoolId = 1L;
        ;

        String jwtToken = JwtUtil.generateToken(
                schoolId,
                qrCode.getClassId(),
                qrCode.getSectionId(),
                qrCodeUUID,
                qrCode.getExpiryTime());
        // Generate QR code
        String qrCodeText = "SchoolID:" + qrCode.getSchoolId() + ",ClassID:" + qrCode.getClassId() + ",SectionID:"
                + qrCode.getSectionId() + ",Token:" + jwtToken;
        String qrCodeUrl = "http://10.194.61.73:3000/attendance/students/mark?token=" + jwtToken;
        String qrCodePath = generateQRCodeImage(qrCodeUrl, 200, 200);

        QRCode newQRCode = new QRCode();
        newQRCode.setSchoolId(schoolId);
        newQRCode.setClassId(qrCode.getClassId());
        newQRCode.setSectionId(qrCode.getSectionId());
        newQRCode.setGeneratedTime(now);
        if (qrCode.getExpiryTime() != null) {
            expiryTime = qrCode.getExpiryTime();
        }
        newQRCode.setExpiryTime(expiryTime);
        newQRCode.setSessionToken(jwtToken);
        newQRCode.setQrCodeUUID(qrCodeUUID);
        newQRCode.setGeneratedBy(qrCode.getGeneratedBy());
        newQRCode.setQrCodePath(qrCodePath);
        newQRCode.setStatus(QRCode.QRCodeStatus.ACTIVE);

        return qrCodeRepository.save(newQRCode);
    }

    public String generateQRCodeImage(String text, int width, int height) throws WriterException, IOException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);

        String filePath = "qrcodes/" + text.hashCode() + ".png";
        Path path = Paths.get(filePath);

        Files.createDirectories(path.getParent());
        try (ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream()) {
            MatrixToImageWriter.writeToPath(bitMatrix, "PNG", path);
        }

        return filePath;
    }

}
