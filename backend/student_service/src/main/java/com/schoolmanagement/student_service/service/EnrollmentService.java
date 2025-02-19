package com.schoolmanagement.student_service.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.schoolmanagement.student_service.model.Enrollment;
import com.schoolmanagement.student_service.repository.EnrollmentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EnrollmentService {
    private final EnrollmentRepository enrollmentRepository;

    // Get all enrollments
    public List<Enrollment> getAllEnrollments() {
        return enrollmentRepository.findAll();
    }

    // Get an enrollment by ID
    public Enrollment getEnrollmentById(Long id) {
        return enrollmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enrollment not found with id: " + id));
    }

    // Create a new enrollment
    public Enrollment createEnrollment(Enrollment enrollment) {
        return enrollmentRepository.save(enrollment);
    }

    // Update an existing enrollment
    public Enrollment updateEnrollment(Long id, Enrollment enrollmentDetails) {
        Enrollment existingEnrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enrollment not found with id: " + id));

        // Update fields
        existingEnrollment.setSchoolId(enrollmentDetails.getSchoolId());
        existingEnrollment.setClassId(enrollmentDetails.getClassId());
        existingEnrollment.setAcademicYear(enrollmentDetails.getAcademicYear());
        existingEnrollment.setEnrollmentDate(enrollmentDetails.getEnrollmentDate());
        existingEnrollment.setIsTransferred(enrollmentDetails.getIsTransferred());
        existingEnrollment.setTransferReason(enrollmentDetails.getTransferReason());
        existingEnrollment.setStudent(enrollmentDetails.getStudent());

        // Save the updated enrollment
        return enrollmentRepository.save(existingEnrollment);
    }

    // Delete an enrollment
    public void deleteEnrollment(Long id) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enrollment not found with id: " + id));
        enrollmentRepository.delete(enrollment);
    }
}
