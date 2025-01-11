package com.schoolmanagement.student_service.mapper;

import com.schoolmanagement.student_service.dto.AttendanceRequest;
import com.schoolmanagement.student_service.dto.AttendanceResponse;
import com.schoolmanagement.student_service.model.Attendance;

public class AttendanceMapper {

    public static Attendance toEntity(AttendanceRequest request) {
        Attendance attendance = new Attendance();
        attendance.setSchoolId(request.getSchoolId());
        attendance.setClassId(request.getClassId());
        attendance.setStudentId(request.getStudentId());
        attendance.setQrCodeId(request.getQrCodeId());
        attendance.setAttendanceDate(request.getAttendanceDate());
        attendance.setRecordedBy(request.getRecordedBy());
        attendance.setRemarks(request.getRemarks());
        return attendance;
    }

    public static AttendanceResponse toResponse(Attendance attendance) {
        AttendanceResponse response = new AttendanceResponse();
        response.setAttendanceId(attendance.getAttendanceId());
        response.setSchoolId(attendance.getSchoolId());
        response.setClassId(attendance.getClassId());
        response.setStudentId(attendance.getStudentId());
        response.setQrCodeId(attendance.getQrCodeId());
        response.setAttendanceDate(attendance.getAttendanceDate());
        response.setRecordedBy(attendance.getRecordedBy());
        response.setRemarks(attendance.getRemarks());
        return response;
    }
}