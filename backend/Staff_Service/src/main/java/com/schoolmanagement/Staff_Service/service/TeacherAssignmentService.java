package com.schoolmanagement.Staff_Service.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.schoolmanagement.Staff_Service.dto.TeacherAssignmentRequestDTO;
import com.schoolmanagement.Staff_Service.dto.TeacherAssignmentResponseDTO;
import com.schoolmanagement.Staff_Service.enums.AssignmentStatus;
import com.schoolmanagement.Staff_Service.model.Staff;
import com.schoolmanagement.Staff_Service.model.Teacher;
import com.schoolmanagement.Staff_Service.model.TeacherAssignment;
import com.schoolmanagement.Staff_Service.repository.TeacherAssignmentRepository;
import com.schoolmanagement.Staff_Service.repository.TeacherRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class TeacherAssignmentService {

    private final TeacherAssignmentRepository assignmentRepository;

    private final TeacherRepository teacherRepository;

    // Assign teacher to a class using the request DTO and return ResponseEntity
    public ResponseEntity<TeacherAssignmentResponseDTO> assignTeacherToClass(TeacherAssignmentRequestDTO requestDTO) {

        Teacher teacher = teacherRepository.findById(requestDTO.getTeacherId())
                .orElseThrow(() -> new EntityNotFoundException("Teacher not found"));

        log.info("teacher id {}", teacher.getTeacherId());

        if (teacher.getStaff().getSchoolId() != requestDTO.getSchoolId()) {
            throw new IllegalArgumentException("Teacher is not assigned to the class");
        }

        if (!teacher.getStaff().getIsActive()) {
            throw new IllegalArgumentException("Teacher is not active");
        }

        TeacherAssignment assignment = new TeacherAssignment();
        teacher.setTeacherId(requestDTO.getTeacherId());
        assignment.setSchoolId(requestDTO.getSchoolId());
        assignment.setClassId(requestDTO.getClassId());
        assignment.setSubjectId(requestDTO.getSubjectId());
        assignment.setSectionId(requestDTO.getSectionId());
        assignment.setTeacher(teacher);
        assignment.setRole(requestDTO.getRole());
        assignment.setSchedule(requestDTO.getSchedule());
        assignment.setStartDate(requestDTO.getStartDate());
        assignment.setEndDate(requestDTO.getEndDate());

        // Validate the assignment to avoid conflicts
        validateAssignment(assignment);

        assignment.setStatus(AssignmentStatus.ASSIGNED);
        assignment.setIsActive(true);

        // Save the assignment
        TeacherAssignment savedAssignment = assignmentRepository.save(assignment);

        // Map the saved entity to a response DTO
        TeacherAssignmentResponseDTO responseDTO = mapToResponseDTO(savedAssignment);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }

    // Update an existing assignment using the request DTO and return
    public ResponseEntity<TeacherAssignmentResponseDTO> updateAssignment(Long id,
            TeacherAssignmentRequestDTO requestDTO) {
        TeacherAssignment existingAssignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Assignment not found"));

        // Validate the new assignment details
        validateAssignment(existingAssignment);

        // Update the existing assignment with new details
        existingAssignment.setClassId(requestDTO.getClassId());
        existingAssignment.setSchoolId(requestDTO.getSchoolId());
        existingAssignment.setSubjectId(requestDTO.getSubjectId());
        existingAssignment.setRole(requestDTO.getRole());
        existingAssignment.setSchedule(requestDTO.getSchedule());
        existingAssignment.setStartDate(requestDTO.getStartDate());
        existingAssignment.setEndDate(requestDTO.getEndDate());
        existingAssignment.setUpdatedBy(requestDTO.getUpdatedBy());

        TeacherAssignment updatedAssignment = assignmentRepository.save(existingAssignment);

        // Map the updated entity to a response DTO
        TeacherAssignmentResponseDTO responseDTO = mapToResponseDTO(updatedAssignment);
        return ResponseEntity.status(HttpStatus.OK).body(responseDTO);
    }

    // Get assignment by ID and return ResponseEntity
    public ResponseEntity<TeacherAssignmentResponseDTO> getAssignmentById(Long id) {
        TeacherAssignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Assignment not found"));

        TeacherAssignmentResponseDTO responseDTO = mapToResponseDTO(assignment);
        return ResponseEntity.status(HttpStatus.OK).body(responseDTO);
    }

    // Get all assignments by teacher ID and return a list of response DTOs in
    // ResponseEntity
    public ResponseEntity<List<TeacherAssignmentResponseDTO>> getAssignmentsByTeacher(Long teacherId) {
        List<TeacherAssignment> assignments = assignmentRepository.findByTeacherId(teacherId);
        List<TeacherAssignmentResponseDTO> responseDTOs = assignments.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());

        return ResponseEntity.status(HttpStatus.OK).body(responseDTOs);
    }

    // Get assignments by school and class
    public ResponseEntity<List<TeacherAssignmentResponseDTO>> getAssignmentsBySchoolAndClass(Long schoolId,
            Long classId) {
        List<TeacherAssignment> assignments = assignmentRepository.findBySchoolIdAndClassId(schoolId, classId);

        if (assignments.isEmpty()) {
            log.warn("No assignments found for schoolId: {} and classId: {}", schoolId, classId);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }

        List<TeacherAssignmentResponseDTO> responseDTOs = assignments.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());

        return ResponseEntity.status(HttpStatus.OK).body(responseDTOs);
    }

    // Remove an assignment by ID
    public ResponseEntity<Void> removeAssignment(Long id) {
        TeacherAssignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Assignment not found"));

        assignment.setIsActive(false);
        assignment.setStatus(AssignmentStatus.UNASSIGNED);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    // Change assignment status (ACTIVE/INACTIVE) and return ResponseEntity
    public ResponseEntity<Void> changeAssignmentStatus(Long assignmentId, AssignmentStatus status) {
        TeacherAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new EntityNotFoundException("Assignment not found"));

        assignment.setStatus(status);
        assignmentRepository.save(assignment);
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    // Validate assignment to avoid conflicts
    private void validateAssignment(TeacherAssignment assignment) {
        List<TeacherAssignment> existingAssignments = assignmentRepository
                .findActiveAssignments(assignment.getTeacher().getTeacherId(),
                        AssignmentStatus.ASSIGNED,
                        LocalDate.now());

        for (TeacherAssignment existing : existingAssignments) {
            if (assignmentsOverlap(existing, assignment)) {
                throw new IllegalArgumentException("Assignment period overlaps with an existing assignment");
            }
        }
    }

    // Check if two assignments overlap
    private boolean assignmentsOverlap(TeacherAssignment a1, TeacherAssignment a2) {
        return !(a1.getEndDate().isBefore(a2.getStartDate()) || a2.getEndDate().isBefore(a1.getStartDate()));
    }

    // Helper method to map TeacherAssignment to TeacherAssignmentResponseDTO
    private TeacherAssignmentResponseDTO mapToResponseDTO(TeacherAssignment assignment) {
        return TeacherAssignmentResponseDTO.builder()
                .id(assignment.getId())
                .teacherId(assignment.getTeacher().getTeacherId()) // teacherId is derived from the Teacher entity
                .schoolId(assignment.getSchoolId())
                .classId(assignment.getClassId())
                .subjectId(assignment.getSubjectId())
                .sectionId(assignment.getSectionId())
                .role(assignment.getRole())
                .schedule(assignment.getSchedule())
                .startDate(assignment.getStartDate())
                .endDate(assignment.getEndDate())
                .status(assignment.getStatus())
                .isActive(assignment.getIsActive())
                .createdAt(assignment.getCreatedAt())
                .updatedAt(assignment.getUpdatedAt())
                .createdBy(assignment.getCreatedBy())
                .updatedBy(assignment.getUpdatedBy())
                .build();
    }
}
