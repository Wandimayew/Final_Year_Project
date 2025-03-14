package com.schoolmanagement.student_service.mapper;

import com.schoolmanagement.student_service.dto.StudentRequest;
import com.schoolmanagement.student_service.dto.StudentResponse;
import com.schoolmanagement.student_service.model.ParentGuardian;
import com.schoolmanagement.student_service.model.Student;

public class StudentMapper {

    public static Student toEntity(StudentRequest request) {
        Student student = new Student();
        student.setRegistNo(request.getRegistId());
        student.setUserId(request.getUserId());
        student.setSchoolId(request.getSchoolId());
        student.setClassId(request.getClassId());
        student.setSectionId(request.getSectionId());
        student.setFirstName(request.getFirstName());
        student.setMiddleName(request.getMiddleName());
        student.setLastName(request.getLastName());
        student.setNationalId(request.getNationalId());
        student.setUsername(request.getUsername());
        student.setDateOfBirth(request.getDateOfBirth());
        student.setGender(request.getGender());
        student.setContactInfo(request.getContactInfo());
        student.setPhoto(request.getPhoto());
        student.setAddress(request.getAddress());
        student.setAdmissionDate(request.getAdmissionDate());

         // Convert string to enum for isActive
         if (request.getIsActive().equalsIgnoreCase("ACTIVE")) {
            student.setIsActive(Student.Status.ACTIVE);
        } else {
            student.setIsActive(Student.Status.INACTIVE);
        }

        // Convert string to enum for isPassed
        if (request.getIsPassed().equalsIgnoreCase("PASSED")) {
            student.setIsPassed(Student.PassedOrFail.PASSED);
        } else {
            student.setIsPassed(Student.PassedOrFail.FAILED);
        }

        // Initialize ParentGuardian if provided
        if (request.getParentId() != null) {
            ParentGuardian parentGuardian = new ParentGuardian();
            parentGuardian.setParentId(request.getParentId());
            student.setParentGuardian(parentGuardian);
        }

        return student;
    }

    public static StudentResponse toResponse(Student student) {
        StudentResponse response = new StudentResponse();
        response.setStudentId(student.getStudentId());
        response.setRegistId(student.getRegistNo());
        response.setUserId(student.getUserId());
        response.setSchoolId(student.getSchoolId());
        response.setClassId(student.getClassId());
        response.setSectionId(student.getSectionId());
        response.setFirstName(student.getFirstName());
        response.setMiddleName(student.getMiddleName());
        response.setLastName(student.getLastName());
        response.setNationalId(student.getNationalId());
        response.setUsername(student.getUsername());
        response.setDateOfBirth(student.getDateOfBirth());
        response.setGender(student.getGender());
        response.setContactInfo(student.getContactInfo());
        response.setPhoto(student.getPhoto());
        response.setAddress(student.getAddress());
        response.setAdmissionDate(student.getAdmissionDate());

        // Convert enum to boolean
        response.setActive(student.getIsActive() == Student.Status.ACTIVE);
        response.setPassed(student.getIsPassed() == Student.PassedOrFail.PASSED);

        response.setParentId(student.getParentGuardian() != null ? student.getParentGuardian().getParentId() : null);
        return response;
    }
}
