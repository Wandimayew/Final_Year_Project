package com.schoolmanagement.student_service.controller;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.google.zxing.WriterException;
import com.schoolmanagement.student_service.dto.QRCodeRequest;
import com.schoolmanagement.student_service.dto.QRCodeResponse;
import com.schoolmanagement.student_service.mapper.QRCodeMapper;
import com.schoolmanagement.student_service.model.QRCode;
import com.schoolmanagement.student_service.service.QRCodeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/student/api/qrcodes")
@RequiredArgsConstructor
@Slf4j
public class QRCodeController {
    private final QRCodeService qrCodeService;

    // Get all QR codes filtered by classId and sectionId
    @GetMapping
    public ResponseEntity<List<QRCodeResponse>> getAllQRCodes(
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) Long sectionId) {

        List<QRCode> qrCodes = qrCodeService.getAllQRCodes(classId, sectionId);
        List<QRCodeResponse> response = qrCodes.stream()
                .map(QRCodeMapper::toResponse)
                .collect(Collectors.toList());

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Get a QR code by ID
    @GetMapping("/{id}")
    public ResponseEntity<QRCodeResponse> getQRCodeById(@PathVariable Long id) {
        QRCode qrCode = qrCodeService.getQRCodeById(id);
        QRCodeResponse response = QRCodeMapper.toResponse(qrCode);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Create a new QR code
    @PostMapping
    public ResponseEntity<QRCodeResponse> createQRCode(@Valid @RequestBody QRCodeRequest request) {
        QRCode qrCode = QRCodeMapper.toEntity(request);
        QRCode createdQRCode = qrCodeService.createQRCode(qrCode);
        QRCodeResponse response = QRCodeMapper.toResponse(createdQRCode);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Update an existing QR code
    @PutMapping("/{id}")
    public ResponseEntity<QRCodeResponse> updateQRCode(
            @PathVariable Long id,
            @Valid @RequestBody QRCodeRequest request) {
        QRCode qrCodeDetails = QRCodeMapper.toEntity(request);
        QRCode updatedQRCode = qrCodeService.updateQRCode(id, qrCodeDetails);
        QRCodeResponse response = QRCodeMapper.toResponse(updatedQRCode);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Delete a QR code
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQRCode(@PathVariable Long id) {
        qrCodeService.deleteQRCode(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // @PostMapping("/generate")
    // public QRCode generateQRCode(@RequestParam(required = false) Long schoolId, @RequestParam Long classId, @RequestParam Long sectionId,
    //         @RequestParam String generatedBy) throws WriterException, IOException {

    //     return qrCodeService.generateQRCode(schoolId, classId, sectionId, generatedBy);
    // }

    @PostMapping("/generate")
public ResponseEntity<QRCodeResponse> generateQRCode(@Valid @RequestBody QRCodeRequest qrCodeRequest) 
        throws WriterException, IOException {
    // Convert DTO to Entity
    QRCode qrCode = QRCodeMapper.toEntity(qrCodeRequest);
    
    // Call Service to Generate QR Code
    QRCode generatedQRCode = qrCodeService.generateQRCode(qrCode);
    
    // Convert Entity to Response DTO
    QRCodeResponse response = QRCodeMapper.toResponse(generatedQRCode);
    
    return ResponseEntity.ok(response);
}

}