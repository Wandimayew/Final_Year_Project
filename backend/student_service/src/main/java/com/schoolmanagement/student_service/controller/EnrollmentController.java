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

import com.schoolmanagement.student_service.dto.EnrollmentRequest;
import com.schoolmanagement.student_service.dto.EnrollmentResponse;
import com.schoolmanagement.student_service.mapper.EnrollmentMapper;
import com.schoolmanagement.student_service.model.Enrollment;
import com.schoolmanagement.student_service.service.EnrollmentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/student/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {
    private final EnrollmentService enrollmentService;

    // Get all enrollments
    @GetMapping
    public ResponseEntity<List<EnrollmentResponse>> getAllEnrollments() {
        List<Enrollment> enrollments = enrollmentService.getAllEnrollments();
        List<EnrollmentResponse> response = enrollments.stream()
                .map(EnrollmentMapper::toResponse)
                .collect(Collectors.toList());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Get an enrollment by ID
    @GetMapping("/{id}")
    public ResponseEntity<EnrollmentResponse> getEnrollmentById(@PathVariable Long id) {
        Enrollment enrollment = enrollmentService.getEnrollmentById(id);
        EnrollmentResponse response = EnrollmentMapper.toResponse(enrollment);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Create a new enrollment
    @PostMapping
    public ResponseEntity<EnrollmentResponse> createEnrollment(@Valid @RequestBody EnrollmentRequest request) {
        Enrollment enrollment = EnrollmentMapper.toEntity(request);
        Enrollment createdEnrollment = enrollmentService.createEnrollment(enrollment);
        EnrollmentResponse response = EnrollmentMapper.toResponse(createdEnrollment);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Update an existing enrollment
    @PutMapping("/{id}")
    public ResponseEntity<EnrollmentResponse> updateEnrollment(
            @PathVariable Long id,
            @Valid @RequestBody EnrollmentRequest request) {
        Enrollment enrollmentDetails = EnrollmentMapper.toEntity(request);
        Enrollment updatedEnrollment = enrollmentService.updateEnrollment(id, enrollmentDetails);
        EnrollmentResponse response = EnrollmentMapper.toResponse(updatedEnrollment);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Delete an enrollment
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEnrollment(@PathVariable Long id) {
        enrollmentService.deleteEnrollment(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
