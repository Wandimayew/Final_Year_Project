package com.schoolmanagement.Staff_Service.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.schoolmanagement.Staff_Service.config.JwtUtil;
import com.schoolmanagement.Staff_Service.dto.QRCodeResponseDTO;
import com.schoolmanagement.Staff_Service.dto.StaffAttendanceRequestDTO;
import com.schoolmanagement.Staff_Service.dto.StaffAttendanceResponseDTO;
import com.schoolmanagement.Staff_Service.enums.AttendanceStatus;
import com.schoolmanagement.Staff_Service.exception.BadRequestException;
import com.schoolmanagement.Staff_Service.model.QRCode;
import com.schoolmanagement.Staff_Service.model.Staff;
import com.schoolmanagement.Staff_Service.model.StaffAttendance;
import com.schoolmanagement.Staff_Service.repository.QRCodeRepository;
import com.schoolmanagement.Staff_Service.repository.StaffAttendanceRepository;

import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class AttendanceService {

    private final StaffAttendanceRepository attendanceRepository;
    private final QRCodeRepository qrCodeRepository;
    private final QRCodeService qrCodeService;

    public ResponseEntity<StaffAttendanceResponseDTO> recordAttendance(
            StaffAttendanceRequestDTO requestDTO, Authentication authentication, String qrJwtToken) {
        try {
            Long staffId = null;
            if (authentication != null && authentication.getPrincipal() instanceof Jwt) {
                Jwt jwt = (Jwt) authentication.getPrincipal();
                String staffIdStr = jwt.getClaimAsString("staffId");
                if (staffIdStr != null) {
                    staffId = Long.parseLong(staffIdStr);
                }
            }
            if (staffId == null) {
                throw new BadRequestException("Staff ID is required.");
            }

            Claims claims = JwtUtil.verifyToken(qrJwtToken);
            String qrCodeUUID = claims.get("qrCodeUUID", String.class);
            String schoolId = claims.get("schoolId", String.class);

            QRCodeResponseDTO qrCodeResponse = qrCodeService.validateQRCode(qrCodeUUID, schoolId)
                    .getBody();
            if (qrCodeResponse == null || !qrCodeResponse.getIsActive()) {
                throw new BadRequestException("Invalid or inactive QR Code.");
            }

            QRCode qrCode = qrCodeRepository.findByQrCodeUUID(qrCodeUUID)
                    .orElseThrow(() -> new BadRequestException("QRCode not found."));

            LocalDate attendanceDate = requestDTO.getDate() != null ? requestDTO.getDate() : LocalDate.now();

            validateAttendance(staffId, attendanceDate);

            StaffAttendance attendance = StaffAttendance.builder()
                    .staff(Staff.builder().staffId(staffId).build())
                    .schoolId(qrCode.getSchoolId())
                    .sessionToken(qrCode.getSessionToken())
                    .date(attendanceDate)
                    .recordedBy(requestDTO.getRecordedBy() != null ? requestDTO.getRecordedBy() : staffId.toString())
                    .status(requestDTO.getStatus() != null ? requestDTO.getStatus() : AttendanceStatus.PRESENT)
                    .qrCode(qrCode)
                    .remark(requestDTO.getRemark() != null ? requestDTO.getRemark() : "Scanned via QR Code")
                    .isActive(true)
                    .createdBy(requestDTO.getRecordedBy() != null ? requestDTO.getRecordedBy() : staffId.toString())
                    .createdAt(LocalDateTime.now())
                    .build();

            if (requestDTO.getInTime() != null) {
                attendance.setInTime(requestDTO.getInTime());
            } else if (requestDTO.getIsInTime()) {
                attendance.setInTime(LocalDateTime.now());
            }
            if (requestDTO.getOutTime() != null) {
                attendance.setOutTime(requestDTO.getOutTime());
            } else if (!requestDTO.getIsInTime()) {
                attendance.setOutTime(LocalDateTime.now());
            }

            StaffAttendance savedAttendance = attendanceRepository.save(attendance);
            StaffAttendanceResponseDTO responseDTO = convertToResponseDTO(savedAttendance);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            log.error("Error recording attendance", e);
            throw new BadRequestException("Failed to record attendance: " + e.getMessage());
        }
    }

    public ResponseEntity<List<StaffAttendanceResponseDTO>> getAllAttendanceRecords() {
        List<StaffAttendance> attendanceRecords = attendanceRepository.findAll();
        List<StaffAttendanceResponseDTO> responseDTOs = attendanceRecords.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responseDTOs);
    }

    public ResponseEntity<List<StaffAttendanceResponseDTO>> getAttendanceHistory(
            Long staffId, LocalDate startDate, LocalDate endDate, Authentication authentication) {
        if (!hasRole(authentication, "ROLE_ADMIN")) {
            Long jwtStaffId = extractStaffIdFromJwt(authentication);
            if (!staffId.equals(jwtStaffId)) {
                throw new BadRequestException("You can only view your own attendance history.");
            }
        }

        List<StaffAttendance> attendanceRecords = attendanceRepository.findAttendanceHistory(staffId, startDate, endDate);
        List<StaffAttendanceResponseDTO> responseDTOs = attendanceRecords.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responseDTOs);
    }

    public ResponseEntity<List<StaffAttendanceResponseDTO>> getAttendanceByTeacherAndDate(
            Long staffId, LocalDate attendanceDate, Authentication authentication) {
        if (!hasRole(authentication, "ROLE_ADMIN")) {
            Long jwtStaffId = extractStaffIdFromJwt(authentication);
            if (!staffId.equals(jwtStaffId)) {
                throw new BadRequestException("You can only view your own attendance.");
            }
        }

        List<StaffAttendance> attendanceRecords = attendanceRepository.findByStaffIdAndDateBetween(staffId, attendanceDate, attendanceDate);
        List<StaffAttendanceResponseDTO> responseDTOs = attendanceRecords.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responseDTOs);
    }

    private void validateAttendance(Long staffId, LocalDate attendanceDate) {
        boolean exists = attendanceRepository.existsByStaff_StaffIdAndDate(staffId, attendanceDate);
        if (exists) {
            throw new BadRequestException("Attendance already marked for this date.");
        }
    }

    private StaffAttendanceResponseDTO convertToResponseDTO(StaffAttendance attendance) {
        return StaffAttendanceResponseDTO.builder()
                .attendanceId(attendance.getAttendanceId())
                .staffId(attendance.getStaff().getStaffId())
                .date(attendance.getDate())
                .status(attendance.getStatus())
                .schoolId(attendance.getSchoolId())
                .sessionToken(attendance.getSessionToken())
                .qrCodeId(attendance.getQrCode() != null ? attendance.getQrCode().getQrCodeId() : null)
                .remark(attendance.getRemark())
                .inTime(attendance.getInTime())
                .outTime(attendance.getOutTime())
                .isActive(attendance.getIsActive())
                .createdAt(attendance.getCreatedAt())
                .updatedAt(attendance.getUpdatedAt())
                .createdBy(attendance.getCreatedBy())
                .updatedBy(attendance.getUpdatedBy())
                .build();
    }

    private Long extractStaffIdFromJwt(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getPrincipal();
            String staffIdStr = jwt.getClaimAsString("staffId");
            return staffIdStr != null ? Long.parseLong(staffIdStr) : null;
        }
        return null;
    }

    private boolean hasRole(Authentication authentication, String role) {
        if (authentication != null && authentication.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getPrincipal();
            List<String> roles = jwt.getClaimAsStringList("roles");
            return roles != null && roles.contains(role);
        }
        return false;
    }
}