package com.schoolmanagement.Staff_Service.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.schoolmanagement.Staff_Service.service.QRCodeService;
import com.schoolmanagement.Staff_Service.dto.QRCodeRequestDTO;
import com.schoolmanagement.Staff_Service.dto.QRCodeResponseDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/staff/api/qrcodes")
@RequiredArgsConstructor
@Slf4j
public class QRCodeController {

    private final QRCodeService qrCodeService;

    /**
     * Endpoint to generate a QR code, using schoolId from token if not provided.
     */
    @PostMapping("/generate")
    public ResponseEntity<QRCodeResponseDTO> generateQRCode(
            @RequestBody QRCodeRequestDTO requestDTO,
            Authentication authentication) {
        log.info("Received QR Code generation request: {}", requestDTO);
        return qrCodeService.generateQRCode(requestDTO, authentication);
    }

    /**
     * Endpoint to validate a QR code using the session token.
     */
    @GetMapping("/validate/{schoolId}")
    public ResponseEntity<QRCodeResponseDTO> validateQRCode(
            @PathVariable String schoolId,
            @RequestParam String sessionToken) {
        return qrCodeService.validateQRCode(schoolId, sessionToken);
    }

    /**
     * Endpoint to get the active QR code for a school.
     */
    @GetMapping("/active")
    public ResponseEntity<QRCodeResponseDTO> getActiveQRCode(@RequestParam String schoolId) {
        log.info("Fetching active QR Code for school ID: {}", schoolId);
        return qrCodeService.getActiveQRCode(schoolId);
    }
}