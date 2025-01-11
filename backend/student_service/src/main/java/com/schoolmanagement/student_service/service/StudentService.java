package com.schoolmanagement.student_service.service;

import java.util.List;

import org.springframework.stereotype.Service;


import com.schoolmanagement.student_service.model.Student;
import com.schoolmanagement.student_service.repository.StudentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StudentService {
    private final StudentRepository studentRepository;

    // Get all students
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    // Get a student by ID
    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
    }

    // Create a new student
    public Student createStudent(Student student) {
        return studentRepository.save(student);
    }

    // Update an existing student
    public Student updateStudent(Long id, Student studentDetails) {
        Student existingStudent = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));

        // Update fields
        existingStudent.setStudentId(studentDetails.getStudentId());
        existingStudent.setUserId(studentDetails.getUserId());
        existingStudent.setSchoolId(studentDetails.getSchoolId());
        existingStudent.setClassId(studentDetails.getClassId());
        existingStudent.setSectionId(studentDetails.getSectionId());
        existingStudent.setFirstName(studentDetails.getFirstName());
        existingStudent.setMiddleName(studentDetails.getMiddleName());
        existingStudent.setLastName(studentDetails.getLastName());
        existingStudent.setNationalId(studentDetails.getNationalId());
        existingStudent.setUsername(studentDetails.getUsername());
        existingStudent.setDateOfBirth(studentDetails.getDateOfBirth());
        existingStudent.setGender(studentDetails.getGender());
        existingStudent.setContactInfo(studentDetails.getContactInfo());
        existingStudent.setPhoto(studentDetails.getPhoto());
        existingStudent.setAddress(studentDetails.getAddress());
        existingStudent.setActive(studentDetails.isActive());
        existingStudent.setPassed(studentDetails.isPassed());
        existingStudent.setAdmissionDate(studentDetails.getAdmissionDate());

        // Save the updated student
        return studentRepository.save(existingStudent);
    }

    // Delete a student
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
        studentRepository.delete(student);
    }
}
