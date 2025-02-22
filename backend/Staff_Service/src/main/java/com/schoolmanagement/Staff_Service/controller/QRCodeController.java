package com.schoolmanagement.Staff_Service.controller;

import java.net.MalformedURLException;

import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.schoolmanagement.Staff_Service.service.QRCodeService;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import java.nio.file.Path;
import java.nio.file.Paths;

import com.schoolmanagement.Staff_Service.dto.QRCodeRequestDTO;
import com.schoolmanagement.Staff_Service.dto.QRCodeResponseDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/qrcodes")
@RequiredArgsConstructor
@Slf4j
public class QRCodeController {

    private final QRCodeService qrCodeService;

    private final String QR_CODE_DIRECTORY = "uploads/qrcodes/";

    /**
     * Endpoint to generate a QR code for a specific school.
     *
     * @param requestDTO DTO containing the school ID and user information.
     * @return ResponseEntity containing the generated QR code details.
     */
    @PostMapping("/generate")
    public ResponseEntity<QRCodeResponseDTO> generateQRCode(@RequestBody QRCodeRequestDTO requestDTO) {
        log.info("Generating QR Code for school ID: {}", requestDTO.getSchoolId());
        return qrCodeService.generateQRCode(requestDTO);
    }

    /**
     * Endpoint to validate a QR code using the session token.
     *
     * @param schoolId     ID of the school.
     * @param sessionToken Session token of the QR code.
     * @return ResponseEntity containing the validated QR code details.
     */
    @GetMapping("/validate/{schoolId}")
    public ResponseEntity<QRCodeResponseDTO> validateQRCode(@PathVariable Long schoolId,
            @RequestParam String sessionToken) {
        return qrCodeService.validateQRCode(schoolId, sessionToken);
    }

    @GetMapping("/active")
    public ResponseEntity<Resource> getActiveQRCode(@RequestParam Long schoolId) {
        log.info("Fetching active QR Code for school ID: {}", schoolId);
        try {
            // Fetch the active QR code by school ID from the database or other source.
            String fileName = schoolId + "_active.png";  // Name the file based on schoolId or another identifier.
            Path filePath = Paths.get(QR_CODE_DIRECTORY + fileName);
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(null); // Active QR code not found for the schoolId
            }
        } catch (MalformedURLException e) {
            log.error("Error fetching active QR code for school ID: {}", schoolId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

}
