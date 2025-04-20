package com.schoolmanagement.Staff_Service.controller;

import com.schoolmanagement.Staff_Service.dto.StaffAttendanceRequestDTO;
import com.schoolmanagement.Staff_Service.dto.StaffAttendanceResponseDTO;
import com.schoolmanagement.Staff_Service.service.AttendanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/staff/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping("/record")
    public ResponseEntity<StaffAttendanceResponseDTO> recordAttendance(
            @RequestBody StaffAttendanceRequestDTO requestDTO,
            @RequestHeader("QR-JWT-Token") String qrJwtToken,
            Authentication authentication) {
        return attendanceService.recordAttendance(requestDTO, authentication, qrJwtToken);
    }

    @GetMapping
    public ResponseEntity<List<StaffAttendanceResponseDTO>> getAllAttendanceRecords() {
        return attendanceService.getAllAttendanceRecords();
    }

    @GetMapping("/history/{staffId}")
    public ResponseEntity<List<StaffAttendanceResponseDTO>> getAttendanceHistory(
            @PathVariable Long staffId,
            @RequestParam String startDate,
            @RequestParam String endDate,
            Authentication authentication) {
        return attendanceService.getAttendanceHistory(staffId, LocalDate.parse(startDate), LocalDate.parse(endDate), authentication);
    }

    @GetMapping("/by-date/{staffId}")
    public ResponseEntity<List<StaffAttendanceResponseDTO>> getAttendanceByTeacherAndDate(
            @PathVariable Long staffId,
            @RequestParam String attendanceDate,
            Authentication authentication) {
        return attendanceService.getAttendanceByTeacherAndDate(staffId, LocalDate.parse(attendanceDate), authentication);
    }
}