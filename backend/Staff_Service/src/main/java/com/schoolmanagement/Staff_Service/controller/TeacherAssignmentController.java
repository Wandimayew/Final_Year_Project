package com.schoolmanagement.Staff_Service.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.schoolmanagement.Staff_Service.dto.TeacherAssignmentRequestDTO;
import com.schoolmanagement.Staff_Service.dto.TeacherAssignmentResponseDTO;
import com.schoolmanagement.Staff_Service.enums.AssignmentStatus;
import com.schoolmanagement.Staff_Service.service.TeacherAssignmentService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class TeacherAssignmentController {

    private final TeacherAssignmentService teacherAssignmentService;

    // Assign a teacher to a class
    @PostMapping("/assignTeacherToClass")
    public ResponseEntity<TeacherAssignmentResponseDTO> assignTeacherToClass(
            @RequestBody TeacherAssignmentRequestDTO requestDTO) {
        log.info("teacher id {}", requestDTO.getTeacherId());
        return teacherAssignmentService.assignTeacherToClass(requestDTO);
    }

    // Update an existing assignment
    @PutMapping("/update/{id}")
    public ResponseEntity<TeacherAssignmentResponseDTO> updateAssignment(
            @PathVariable Long id, @RequestBody TeacherAssignmentRequestDTO requestDTO) {
        return teacherAssignmentService.updateAssignment(id, requestDTO);
    }

    // Get an assignment by ID
    @GetMapping("/{id}")
    public ResponseEntity<TeacherAssignmentResponseDTO> getAssignmentById(@PathVariable Long id) {
        return teacherAssignmentService.getAssignmentById(id);
    }

    // Get all assignments for a teacher
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<TeacherAssignmentResponseDTO>> getAssignmentsByTeacher(@PathVariable Long teacherId) {
        return teacherAssignmentService.getAssignmentsByTeacher(teacherId);
    }

    // Get all assignments for a school and class
    @GetMapping("/school/{schoolId}/class/{classId}")
    public ResponseEntity<List<TeacherAssignmentResponseDTO>> getAssignmentsBySchoolAndClass(
            @PathVariable String schoolId, @PathVariable Long classId) {
        return teacherAssignmentService.getAssignmentsBySchoolAndClass(schoolId, classId);
    }

    // Remove an assignment
    @DeleteMapping("/remove/{id}")
    public ResponseEntity<Void> removeAssignment(@PathVariable Long id) {
        return teacherAssignmentService.removeAssignment(id);
    }

    // Change assignment status
    @PutMapping("/status/{assignmentId}")
    public ResponseEntity<Void> changeAssignmentStatus(
            @PathVariable Long assignmentId, @RequestParam AssignmentStatus status) {
        return teacherAssignmentService.changeAssignmentStatus(assignmentId, status);
    }
}
