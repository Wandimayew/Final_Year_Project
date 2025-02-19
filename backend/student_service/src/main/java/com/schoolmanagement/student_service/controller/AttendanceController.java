package com.schoolmanagement.student_service.controller;

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
import org.springframework.web.bind.annotation.RestController;

import com.schoolmanagement.student_service.dto.AttendanceRequest;
import com.schoolmanagement.student_service.dto.AttendanceResponse;
import com.schoolmanagement.student_service.dto.QRCodeScanRequest;
import com.schoolmanagement.student_service.mapper.AttendanceMapper;
import com.schoolmanagement.student_service.model.Attendance;
import com.schoolmanagement.student_service.service.AttendanceService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {
    private final AttendanceService attendanceService;

    // Get all attendance records
    @GetMapping
    public ResponseEntity<List<AttendanceResponse>> getAllAttendances() {
        List<Attendance> attendances = attendanceService.getAllAttendances();
        List<AttendanceResponse> response = attendances.stream()
                .map(AttendanceMapper::toResponse)
                .collect(Collectors.toList());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Get an attendance record by ID
    @GetMapping("/{id}")
    public ResponseEntity<AttendanceResponse> getAttendanceById(@PathVariable Long id) {
        Attendance attendance = attendanceService.getAttendanceById(id);
        AttendanceResponse response = AttendanceMapper.toResponse(attendance);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Create a new attendance record
    @PostMapping
    public ResponseEntity<AttendanceResponse> createAttendance(@Valid @RequestBody AttendanceRequest request) {
        Attendance attendance = AttendanceMapper.toEntity(request);
        Attendance createdAttendance = attendanceService.createAttendance(attendance);
        AttendanceResponse response = AttendanceMapper.toResponse(createdAttendance);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Update an existing attendance record
    @PutMapping("/{id}")
    public ResponseEntity<AttendanceResponse> updateAttendance(
            @PathVariable Long id,
            @Valid @RequestBody AttendanceRequest request) {
        Attendance attendanceDetails = AttendanceMapper.toEntity(request);
        Attendance updatedAttendance = attendanceService.updateAttendance(id, attendanceDetails);
        AttendanceResponse response = AttendanceMapper.toResponse(updatedAttendance);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Delete an attendance record
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttendance(@PathVariable Long id) {
        attendanceService.deleteAttendance(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/validateQRCodeAndMarkAttendance")
    public ResponseEntity<String> validateQRCodeAndMarkAttendance(@RequestBody QRCodeScanRequest request) {
        attendanceService.validateAndMarkAttendance(request.getQrCodeId(), request.getStudentId());
        return ResponseEntity.ok("Attendance marked successfully.");
    }

}