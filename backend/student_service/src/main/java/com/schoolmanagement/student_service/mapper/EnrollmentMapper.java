package com.schoolmanagement.student_service.mapper;

import com.schoolmanagement.student_service.dto.EnrollmentRequest;
import com.schoolmanagement.student_service.dto.EnrollmentResponse;
import com.schoolmanagement.student_service.model.Enrollment;
import com.schoolmanagement.student_service.model.Student;

public class EnrollmentMapper {

    public static Enrollment toEntity(EnrollmentRequest request) {
        Enrollment enrollment = new Enrollment();
        enrollment.setSchoolId(request.getSchoolId());
        enrollment.setClassId(request.getClassId());
        enrollment.setAcademicYear(request.getAcademicYear());
        enrollment.setEnrollmentDate(request.getEnrollmentDate());
        enrollment.setIsTransferred(request.getIsTransferred());
        enrollment.setTransferReason(request.getTransferReason());

        // Set the student (assuming you have a Student entity)
        Student student = new Student();
        student.setStudentId(request.getStudentId());
        enrollment.setStudent(student);

        return enrollment;
    }

    public static EnrollmentResponse toResponse(Enrollment enrollment) {
        EnrollmentResponse response = new EnrollmentResponse();
        response.setId(enrollment.getId());
        response.setSchoolId(enrollment.getSchoolId());
        response.setClassId(enrollment.getClassId());
        response.setAcademicYear(enrollment.getAcademicYear());
        response.setEnrollmentDate(enrollment.getEnrollmentDate());
        response.setIsTransferred(enrollment.getIsTransferred());
        response.setTransferReason(enrollment.getTransferReason());
        response.setStudentId(enrollment.getStudent() != null ? enrollment.getStudent().getStudentId() : null);
        return response;
    }
}