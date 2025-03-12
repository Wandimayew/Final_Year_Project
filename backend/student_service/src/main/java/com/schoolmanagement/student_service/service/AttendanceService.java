package com.schoolmanagement.student_service.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.schoolmanagement.student_service.model.Attendance;
import com.schoolmanagement.student_service.model.QRCode;
import com.schoolmanagement.student_service.model.QRCode.QRCodeStatus;
import com.schoolmanagement.student_service.model.Student;
import com.schoolmanagement.student_service.repository.AttendanceRepository;
import com.schoolmanagement.student_service.repository.QRCodeRepository;
import com.schoolmanagement.student_service.repository.StudentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AttendanceService {
    private final AttendanceRepository attendanceRepository;
    private final QRCodeRepository qrCodeRepository;
    private final StudentRepository studentRepository;

    // Get all attendance records
    public List<Attendance> getAllAttendances() {
        return attendanceRepository.findAll();
    }

    // Get an attendance record by ID
    public Attendance getAttendanceById(Long id) {
        return attendanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendance not found with id: " + id));
    }

    // Create a new attendance record
    public Attendance createAttendance(Attendance attendance) {
        return attendanceRepository.save(attendance);
    }

    // Update an existing attendance record
    public Attendance updateAttendance(Long id, Attendance attendanceDetails) {
        Attendance existingAttendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendance not found with id: " + id));

        // Update fields
        existingAttendance.setSchoolId(attendanceDetails.getSchoolId());
        existingAttendance.setClassId(attendanceDetails.getClassId());
        existingAttendance.setStudentId(attendanceDetails.getStudentId());
        existingAttendance.setQrCodeId(attendanceDetails.getQrCodeId());
        existingAttendance.setAttendanceDate(attendanceDetails.getAttendanceDate());
        existingAttendance.setRecordedBy(attendanceDetails.getRecordedBy());
        existingAttendance.setRemarks(attendanceDetails.getRemarks());

        // Save the updated attendance record
        return attendanceRepository.save(existingAttendance);
    }

    // Delete an attendance record
    public void deleteAttendance(Long id) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendance not found with id: " + id));
        attendanceRepository.delete(attendance);
    }

    public void validateAndMarkAttendance(Long qrCodeId, Long studentId) {
    // Fetch the QR Code
    QRCode qrCode = qrCodeRepository.findById(qrCodeId)
            .orElseThrow(() -> new IllegalArgumentException("QR Code not found."));

    // Check if the QR Code is active and not expired
    if (!QRCodeStatus.ACTIVE.equals(qrCode.getStatus()) || qrCode.getExpiryTime().isBefore(LocalDateTime.now())) {
        throw new IllegalArgumentException("QR Code is invalid or expired.");
    }

    // Fetch the student
    Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new IllegalArgumentException("Student not found."));

    // Validate that the student belongs to the same school, class, and section
    if (!student.getSchoolId().equals(qrCode.getSchoolId())
            || !student.getClassId().equals(qrCode.getClassId())
            || !student.getSectionId().equals(qrCode.getSectionId())) {
        throw new IllegalArgumentException("Student does not belong to the school, class, or section for this QR Code.");
    }

    // Check if attendance for this session is already marked
    boolean alreadyMarked = attendanceRepository.existsByStudentIdAndQrCodeId(studentId, qrCodeId);
    if (alreadyMarked) {
        throw new IllegalArgumentException("Attendance already marked for this student in this session.");
    }

    // Mark attendance
    Attendance attendance = new Attendance();
    attendance.setStudentId(studentId);
    attendance.setQrCodeId(qrCodeId);
    attendance.setRecordedBy(qrCode.getGeneratedBy());
    attendance.setAttendanceDate(LocalDateTime.now());
    attendanceRepository.save(attendance);
}
}
