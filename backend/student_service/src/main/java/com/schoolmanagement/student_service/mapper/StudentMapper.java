package com.schoolmanagement.student_service.mapper;

import com.schoolmanagement.student_service.dto.StudentRequest;
import com.schoolmanagement.student_service.dto.StudentResponse;
import com.schoolmanagement.student_service.model.Student;

public class StudentMapper {

    public static Student toEntity(StudentRequest request) {
        Student student = new Student();
        student.setStudentId(request.getStudentId());
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
        student.setActive(request.isActive());
        student.setPassed(request.isPassed());
        student.setAdmissionDate(request.getAdmissionDate());
        return student;
    }

    public static StudentResponse toResponse(Student student) {
        StudentResponse response = new StudentResponse();
        response.setId(student.getId());
        response.setStudentId(student.getStudentId());
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
        response.setActive(student.isActive());
        response.setPassed(student.isPassed());
        response.setAdmissionDate(student.getAdmissionDate());
        response.setParentId(student.getParentGuardian() != null ? student.getParentGuardian().getParentId() : null);
        return response;
    }
}