package com.schoolmanagement.Staff_Service.controller;

import com.schoolmanagement.Staff_Service.dto.TeacherRequestDTO;
import com.schoolmanagement.Staff_Service.dto.TeacherResponseDTO;
import com.schoolmanagement.Staff_Service.service.TeacherService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/staff/api/teachers")
@RequiredArgsConstructor
@Slf4j
public class TeacherController {

    private final TeacherService teacherService;

    // Create a new teacher
    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TeacherResponseDTO> createTeacher(@ModelAttribute @Valid TeacherRequestDTO teacherRequest) {
        log.info("Creating a new teacher with id: {}", teacherRequest.getStaffId());
        return teacherService.createTeacher(teacherRequest);
    }

    // Get a teacher by ID
    @GetMapping("/{teacherId}")
    public ResponseEntity<TeacherResponseDTO> getTeacherById(@Valid @PathVariable Long teacherId) {
        log.info("Fetching teacher with ID: {}", teacherId);
        return teacherService.getTeacherById(teacherId);
    }

    // Get all active teachers
    @GetMapping
    public ResponseEntity<List<TeacherResponseDTO>> getAllTeachers() {
        log.info("Fetching all active teachers");
        return teacherService.getAllTeachers();
    }

    // Get all teachers
    @GetMapping("/all")
    public ResponseEntity<List<TeacherResponseDTO>> getAllTeachersAll() {
        log.info("Fetching all teachers");
        return teacherService.getAllTeacher();
    }

    // Get all inactive teachers
    @GetMapping("/inactive")
    public ResponseEntity<List<TeacherResponseDTO>> getAllInactiveTeachers() {
        log.info("Fetching all inactive teachers");
        return teacherService.getAllInactiveTeachers();
    }

    // Delete (deactivate) a teacher by ID
    @DeleteMapping("/{teacherId}")
    public ResponseEntity<String> deleteTeacherById(@Valid @PathVariable Long teacherId) {
        log.info("Deactivating teacher with ID: {}", teacherId);
        return teacherService.deleteTeacherById(teacherId);
    }

}
