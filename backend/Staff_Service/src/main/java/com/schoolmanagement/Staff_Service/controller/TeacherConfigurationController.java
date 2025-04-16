package com.schoolmanagement.Staff_Service.controller;

import com.schoolmanagement.Staff_Service.dto.TeacherConfigurationRequestDto;
import com.schoolmanagement.Staff_Service.dto.TeacherConfigurationResponseDto;
import com.schoolmanagement.Staff_Service.service.TeacherConfigurationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/staff/api/teacher-configurations")
public class TeacherConfigurationController {

    private final TeacherConfigurationService service;

    public TeacherConfigurationController(TeacherConfigurationService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<TeacherConfigurationResponseDto> create(
            @Valid @RequestBody TeacherConfigurationRequestDto requestDto,
            @RequestHeader("User-Id") String userId) {
        return service.createTeacherConfiguration(requestDto, userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeacherConfigurationResponseDto> get(@PathVariable Long id) {
        return service.getTeacherConfiguration(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TeacherConfigurationResponseDto> update(
            @PathVariable Long id,
            @Valid @RequestBody TeacherConfigurationRequestDto requestDto,
            @RequestHeader("User-Id") String userId) {
        return service.updateTeacherConfiguration(id, requestDto, userId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return service.deleteTeacherConfiguration(id);
    }

    @GetMapping("/teacher/{teacherId}/school/{schoolId}")
    public ResponseEntity<TeacherConfigurationResponseDto> findByTeacherAndSchool(
            @PathVariable Long teacherId, @PathVariable String schoolId) {
        return service.findByTeacherIdAndSchoolId(teacherId, schoolId);
    }
}