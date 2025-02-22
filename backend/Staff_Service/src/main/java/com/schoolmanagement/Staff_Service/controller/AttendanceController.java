package com.schoolmanagement.Staff_Service.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.schoolmanagement.Staff_Service.dto.StaffAttendanceRequestDTO;
import com.schoolmanagement.Staff_Service.dto.StaffAttendanceResponseDTO;
import com.schoolmanagement.Staff_Service.service.AttendanceService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    /**
 * Fetch all recorded attendance records.
 *
 * @return ResponseEntity containing a list of attendance records.
 */
@GetMapping
public ResponseEntity<List<StaffAttendanceResponseDTO>> getAllAttendanceRecords() {
    return attendanceService.getAllAttendanceRecords();
}

    /**
     * Record attendance for a staff member.
     *
     * @param requestDTO Request DTO containing staffId, sessionToken, and attendance details.
     * @return ResponseEntity containing the saved attendance details.
     */
    @PostMapping("/record")
    public ResponseEntity<StaffAttendanceResponseDTO> recordAttendance(@RequestBody StaffAttendanceRequestDTO requestDTO) {
        return attendanceService.recordAttendance(requestDTO);
    }

    /**
     * Fetch attendance history for a staff member between two dates.
     *
     * @param staffId   ID of the staff (teacher).
     * @param startDate Start date for the attendance records.
     * @param endDate   End date for the attendance records.
     * @return ResponseEntity containing a list of attendance records.
     */
    @GetMapping("/history/{staffId}")
    public ResponseEntity<List<StaffAttendanceResponseDTO>> getAttendanceHistory(
            @PathVariable Long staffId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        return attendanceService.getAttendanceHistory(staffId, startDate, endDate);
    }

    /**
     * Fetch attendance for a staff member by date.
     *
     * @param staffId        ID of the staff (teacher).
     * @param attendanceDate Date of attendance.
     * @return ResponseEntity containing attendance records for the date.
     */
    @GetMapping("/by-date/{staffId}")
    public ResponseEntity<List<StaffAttendanceResponseDTO>> getAttendanceByTeacherAndDate(
            @PathVariable Long staffId,
            @RequestParam LocalDate attendanceDate) {
        return attendanceService.getAttendanceByTeacherAndDate(staffId, attendanceDate);
    }
}