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

    public ResponseEntity<List<StaffAttendanceResponseDTO>> getAllAttendanceRecords() {
        List<StaffAttendance> attendanceRecords = attendanceRepository.findAll();
        List<StaffAttendanceResponseDTO> responseDTOs = attendanceRecords.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responseDTOs);
    }

    /**
     * Record attendance for a staff member, using JWT for authentication.
     */
    public ResponseEntity<StaffAttendanceResponseDTO> recordAttendance(
            StaffAttendanceRequestDTO requestDTO, Authentication authentication) {
        try {
            // Extract staffId from JWT if not provided in request
            Long staffId = requestDTO.getStaffId();
            if (staffId == null && authentication != null && authentication.getPrincipal() instanceof Jwt) {
                Jwt jwt = (Jwt) authentication.getPrincipal();
                String staffIdStr = jwt.getClaimAsString("staffId"); // Adjust claim name as per your JWT
                if (staffIdStr != null) {
                    staffId = Long.parseLong(staffIdStr);
                }
            }
            if (staffId == null) {
                throw new BadRequestException("Staff ID is required.");
            }

            String sessionToken = requestDTO.getSessionToken();
            LocalDate attendanceDate = requestDTO.getDate();

            // Validate QR code
            QRCodeResponseDTO qrCodeResponse = qrCodeService.validateQRCode(requestDTO.getSchoolId(), sessionToken)
                    .getBody();
            if (qrCodeResponse == null || !qrCodeResponse.getIsActive()) {
                throw new BadRequestException("Invalid or inactive QR Code.");
            }

            QRCode qrCode = qrCodeRepository.findById(qrCodeResponse.getQrCodeId())
                    .orElseThrow(() -> new BadRequestException("QRCode not found."));

            // Validate attendance not already marked
            validateAttendance(staffId, attendanceDate);

            // Create attendance record
            StaffAttendance attendance = StaffAttendance.builder()
                    .staff(Staff.builder().staffId(staffId).build())
                    .schoolId(qrCode.getSchoolId())
                    .sessionToken(qrCode.getSessionToken())
                    .date(attendanceDate)
                    .classId(requestDTO.getClassId())
                    .recordedBy(requestDTO.getRecordedBy())
                    .status(requestDTO.getStatus() != null ? requestDTO.getStatus() : AttendanceStatus.PRESENT)
                    .qrCode(qrCode)
                    .remark(requestDTO.getRemark())
                    .isActive(true)
                    .createdBy(requestDTO.getRecordedBy())
                    .createdAt(LocalDateTime.now())
                    .build();

            // Set inTime or outTime based on request
            if (requestDTO.getInTime() != null) {
                attendance.setInTime(requestDTO.getInTime());
            }
            if (requestDTO.getOutTime() != null) {
                attendance.setOutTime(requestDTO.getOutTime());
            }

            // Save attendance
            StaffAttendance savedAttendance = attendanceRepository.save(attendance);
            StaffAttendanceResponseDTO responseDTO = convertToResponseDTO(savedAttendance);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            log.error("Error recording attendance", e);
            throw new BadRequestException("Failed to record attendance: " + e.getMessage());
        }
    }

    public ResponseEntity<List<StaffAttendanceResponseDTO>> getAttendanceHistory(
            Long staffId, LocalDate startDate, LocalDate endDate, Authentication authentication) {
        // Optional: Restrict to own records unless admin
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
        // Optional: Restrict to own records unless admin
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
                .classId(attendance.getClassId())
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
            String staffIdStr = jwt.getClaimAsString("staffId"); // Adjust claim name
            return staffIdStr != null ? Long.parseLong(staffIdStr) : null;
        }
        return null;
    }

    private boolean hasRole(Authentication authentication, String role) {
        if (authentication != null && authentication.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getPrincipal();
            List<String> roles = jwt.getClaimAsStringList("roles"); // Adjust claim name
            return roles != null && roles.contains(role);
        }
        return false;
    }
}