package com.schoolmanagement.student_service.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.schoolmanagement.student_service.model.QRCode;
import com.schoolmanagement.student_service.repository.QRCodeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class QRCodeService {
    private final QRCodeRepository qrCodeRepository;

    // Get all QR codes
    public List<QRCode> getAllQRCodes() {
        return qrCodeRepository.findAll();
    }

    // Get a QR code by ID
    public QRCode getQRCodeById(Long id) {
        return qrCodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("QR Code not found with id: " + id));
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
    
    public QRCode generateQRCode(Long schoolId, Long classId, Long sectionId, String generatedBy) throws WriterException, IOException {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiryTime = now.plusHours(1);
        String sessionToken = "TOKEN-" + sectionId + "-" + now.toString();

        // Generate QR code
        String qrCodeText = "SchoolID:" + schoolId + ",ClassID:" + classId + ",SectionID:" + sectionId + ",Token:" + sessionToken;
        String qrCodePath = generateQRCodeImage(qrCodeText, 200, 200);

        QRCode qrCode = new QRCode();
        qrCode.setSchoolId(schoolId);
        qrCode.setClassId(classId);
        qrCode.setSectionId(sectionId);
        qrCode.setGeneratedTime(now);
        qrCode.setExpiryTime(expiryTime);
        qrCode.setSessionToken(sessionToken);
        qrCode.setGeneratedBy(generatedBy);
        qrCode.setQrCodePath(qrCodePath);
        qrCode.setStatus(QRCode.QRCodeStatus.ACTIVE);

        return qrCodeRepository.save(qrCode);
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
