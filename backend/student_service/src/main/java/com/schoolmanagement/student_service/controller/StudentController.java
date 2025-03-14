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

import com.schoolmanagement.student_service.dto.StudentRequest;
import com.schoolmanagement.student_service.dto.StudentResponse;
import com.schoolmanagement.student_service.mapper.StudentMapper;
import com.schoolmanagement.student_service.model.Student;
import com.schoolmanagement.student_service.service.StudentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@Slf4j
public class StudentController {
    private final StudentService studentService;

    // Get all students
    @GetMapping
    public ResponseEntity<List<StudentResponse>> getAllStudents() {
        List<Student> students = studentService.getAllStudents();
        List<StudentResponse> response = students.stream()
                .map(StudentMapper::toResponse)
                .collect(Collectors.toList());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Get a student by ID
    @GetMapping("/{id}")
    public ResponseEntity<StudentResponse> getStudentById(@PathVariable String id) {
        log.info("in conroller class");
        Student student = studentService.getStudentById(id);
        log.info("Student info {}",id);
        StudentResponse response = StudentMapper.toResponse(student);
        log.info("Student response {}", response);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Create a new student
    @PostMapping
    public ResponseEntity<StudentResponse> createStudent(@Valid @RequestBody StudentRequest request) {
        Student student = StudentMapper.toEntity(request);
        Student createdStudent = studentService.createStudent(student);
        StudentResponse response = StudentMapper.toResponse(createdStudent);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Update an existing student
    @PutMapping("/{id}")
    public ResponseEntity<StudentResponse> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody StudentRequest request) {
        Student studentDetails = StudentMapper.toEntity(request);
        Student updatedStudent = studentService.updateStudent(id, studentDetails);
        StudentResponse response = StudentMapper.toResponse(updatedStudent);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Delete a student
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
