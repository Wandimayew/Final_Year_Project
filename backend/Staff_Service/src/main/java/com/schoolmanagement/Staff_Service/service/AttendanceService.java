package com.schoolmanagement.Staff_Service.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.schoolmanagement.Staff_Service.dto.QRCodeResponseDTO;
import com.schoolmanagement.Staff_Service.dto.StaffAttendanceRequestDTO;
import com.schoolmanagement.Staff_Service.dto.StaffAttendanceResponseDTO;
import com.schoolmanagement.Staff_Service.enums.AttendanceStatus;
import com.schoolmanagement.Staff_Service.model.QRCode;
import com.schoolmanagement.Staff_Service.model.Staff;
import com.schoolmanagement.Staff_Service.model.StaffAttendance;
import com.schoolmanagement.Staff_Service.repository.QRCodeRepository;
import com.schoolmanagement.Staff_Service.repository.StaffAttendanceRepository;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class AttendanceService {

    private final StaffAttendanceRepository attendanceRepository;
    private final QRCodeRepository qrCodeRepository;
    private final QRCodeService qrCodeService;


    public ResponseEntity<List<StaffAttendanceResponseDTO>> getAllAttendanceRecords() {
        List<StaffAttendance> attendanceRecords = attendanceRepository.findAll(); // Fetch all records
    
        List<StaffAttendanceResponseDTO> responseDTOs = attendanceRecords.stream()
                .map(this::convertToResponseDTO) // Convert each record to DTO
                .collect(Collectors.toList());
    
        return ResponseEntity.ok(responseDTOs); // Return the DTOs wrapped in ResponseEntity
    }

    /**
     * Record attendance for a staff member.
     *
     * @param requestDTO Request DTO containing staffId, sessionToken, and attendance details.
     * @return ResponseEntity containing the saved attendance details.
     */
    public ResponseEntity<StaffAttendanceResponseDTO> recordAttendance(StaffAttendanceRequestDTO requestDTO) {
        Long staffId = requestDTO.getStaffId();
        String sessionToken = requestDTO.getSessionToken();
        LocalDate attendanceDate = requestDTO.getDate();
        
        // Validate QR code session token
        QRCodeResponseDTO qrCodeResponse = qrCodeService.validateQRCode(requestDTO.getSchoolId(), sessionToken).getBody();
    
        if (qrCodeResponse == null || !qrCodeResponse.getIsActive()) {
            throw new IllegalArgumentException("Invalid or inactive QR Code.");
        }
        
        // Fetch the QRCode from the repository
        QRCode qrCode = qrCodeRepository.findById(qrCodeResponse.getQrCodeId())
                .orElseThrow(() -> new IllegalArgumentException("QRCode not found."));

        // Validate if attendance already marked
        validateAttendance(staffId, attendanceDate);
    
        // Create attendance record
        StaffAttendance attendance = StaffAttendance.builder()
                .staff(Staff.builder().staffId(staffId).build())
                .schoolId(qrCode.getSchoolId())
                .sessionToken(qrCode.getSessionToken())
                .date(attendanceDate)
                .classId(requestDTO.getClassId())
                .recordedBy(requestDTO.getRecordedBy())
                .status(AttendanceStatus.PRESENT)
                .qrCode(qrCode) // Set the existing QRCode entity
                .remark(requestDTO.getRemark())
                .isActive(true)
                .createdBy(requestDTO.getRecordedBy())
                .build();
            if (requestDTO.getStatus() == AttendanceStatus.PRESENT) {
            // Check In
            attendance.setInTime(LocalDateTime.now());
        } else {
            // Check Out
            attendance.setOutTime(LocalDateTime.now());
        }
    
        // Save attendance record
        StaffAttendance savedAttendance = attendanceRepository.save(attendance);
    
        // Convert to Response DTO
        StaffAttendanceResponseDTO responseDTO = convertToResponseDTO(savedAttendance);
        return ResponseEntity.ok(responseDTO);
    }


    /**
     * Fetch attendance history for a staff member between two dates.
     *
     * @param staffId   ID of the staff (teacher).
     * @param startDate Start date for the attendance records.
     * @param endDate   End date for the attendance records.
     * @return ResponseEntity containing a list of attendance records.
     */
    public ResponseEntity<List<StaffAttendanceResponseDTO>> getAttendanceHistory(Long staffId, LocalDate startDate, LocalDate endDate) {
        List<StaffAttendance> attendanceRecords = attendanceRepository.findAttendanceHistory(staffId, startDate, endDate);
        List<StaffAttendanceResponseDTO> responseDTOs = attendanceRecords.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responseDTOs);
    }

    /**
     * Fetch attendance for a staff member by date.
     *
     * @param staffId        ID of the staff (teacher).
     * @param attendanceDate Date of attendance.
     * @return ResponseEntity containing attendance records for the date.
     */
    public ResponseEntity<List<StaffAttendanceResponseDTO>> getAttendanceByTeacherAndDate(Long staffId, LocalDate attendanceDate) {
        List<StaffAttendance> attendanceRecords = attendanceRepository.findByStaffIdAndDateBetween(staffId, attendanceDate, attendanceDate);
        List<StaffAttendanceResponseDTO> responseDTOs = attendanceRecords.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responseDTOs);
    }

    /**
     * Validate if attendance has already been marked for the given date.
     *
     * @param staffId       ID of the staff (teacher).
     * @param attendanceDate Date of attendance.
     */
    private void validateAttendance(Long staffId, LocalDate attendanceDate) {
        boolean exists = attendanceRepository.existsByStaff_StaffIdAndDate(staffId, attendanceDate);
        if (exists) {
            throw new IllegalArgumentException("Attendance already marked for this date.");
        }
    }

    /**
     * Convert a StaffAttendance entity to a response DTO.
     *
     * @param attendance StaffAttendance entity.
     * @return StaffAttendanceResponseDTO.
     */
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
}
