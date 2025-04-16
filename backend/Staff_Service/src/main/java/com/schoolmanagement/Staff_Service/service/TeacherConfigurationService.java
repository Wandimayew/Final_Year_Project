package com.schoolmanagement.Staff_Service.service;

import com.schoolmanagement.Staff_Service.dto.TeacherConfigurationRequestDto;
import com.schoolmanagement.Staff_Service.dto.TeacherConfigurationResponseDto;
import com.schoolmanagement.Staff_Service.model.Teacher;
import com.schoolmanagement.Staff_Service.model.TeacherConfiguration;
import com.schoolmanagement.Staff_Service.repository.TeacherConfigurationRepository;
import com.schoolmanagement.Staff_Service.repository.TeacherRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class TeacherConfigurationService {

    private final TeacherConfigurationRepository teacherConfigurationRepository;
    private final TeacherRepository teacherRepository;

    public TeacherConfigurationService(
            TeacherConfigurationRepository teacherConfigurationRepository,
            TeacherRepository teacherRepository) {
        this.teacherConfigurationRepository = teacherConfigurationRepository;
        this.teacherRepository = teacherRepository;
    }

    @Transactional
    public ResponseEntity<TeacherConfigurationResponseDto> createTeacherConfiguration(
            TeacherConfigurationRequestDto requestDto, String createdBy) {
        // Validate teacher exists
        Optional<Teacher> teacherOpt = teacherRepository.findById(requestDto.getTeacherId());
        if (teacherOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        Teacher teacher = teacherOpt.get();

        // Check for existing configuration
        Optional<TeacherConfiguration> existingConfig = teacherConfigurationRepository
                .findByTeacherIdAndSchoolId(requestDto.getTeacherId(), requestDto.getSchoolId());
        if (existingConfig.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
        }

        // Map DTO to entity
        TeacherConfiguration config = new TeacherConfiguration();
        config.setTeacher(teacher);
        config.setSchoolId(requestDto.getSchoolId());
        config.setCoursesPerDay(requestDto.getCoursesPerDay());
        config.setTeachingDaysPerWeek(requestDto.getTeachingDaysPerWeek());
        config.setIsActive(requestDto.getIsActive());
        config.setCreatedBy(createdBy);
        config.setUpdatedBy(createdBy);

        // Save
        config = teacherConfigurationRepository.save(config);

        // Map to response DTO
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponseDto(config));
    }

    public ResponseEntity<TeacherConfigurationResponseDto> getTeacherConfiguration(Long id) {
        Optional<TeacherConfiguration> configOpt = teacherConfigurationRepository.findById(id);
        if (configOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(mapToResponseDto(configOpt.get()));
    }

    @Transactional
    public ResponseEntity<TeacherConfigurationResponseDto> updateTeacherConfiguration(
            Long id, TeacherConfigurationRequestDto requestDto, String updatedBy) {
        Optional<TeacherConfiguration> configOpt = teacherConfigurationRepository.findById(id);
        if (configOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        // Validate teacher exists
        Optional<Teacher> teacherOpt = teacherRepository.findById(requestDto.getTeacherId());
        if (teacherOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        Teacher teacher = teacherOpt.get();

        // Update entity
        TeacherConfiguration config = configOpt.get();
        config.setTeacher(teacher);
        config.setSchoolId(requestDto.getSchoolId());
        config.setCoursesPerDay(requestDto.getCoursesPerDay());
        config.setTeachingDaysPerWeek(requestDto.getTeachingDaysPerWeek());
        config.setIsActive(requestDto.getIsActive());
        config.setUpdatedBy(updatedBy);

        // Save
        config = teacherConfigurationRepository.save(config);

        // Map to response DTO
        return ResponseEntity.ok(mapToResponseDto(config));
    }

    @Transactional
    public ResponseEntity<Void> deleteTeacherConfiguration(Long id) {
        if (!teacherConfigurationRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        teacherConfigurationRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    public ResponseEntity<TeacherConfigurationResponseDto> findByTeacherIdAndSchoolId(Long teacherId, String schoolId) {
        Optional<TeacherConfiguration> configOpt = teacherConfigurationRepository
                .findByTeacherIdAndSchoolId(teacherId, schoolId);
        if (configOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(mapToResponseDto(configOpt.get()));
    }

    private TeacherConfigurationResponseDto mapToResponseDto(TeacherConfiguration config) {
        return TeacherConfigurationResponseDto.builder()
                .id(config.getId())
                .teacherId(config.getTeacher().getTeacherId())
                .schoolId(config.getSchoolId())
                .coursesPerDay(config.getCoursesPerDay())
                .teachingDaysPerWeek(config.getTeachingDaysPerWeek())
                .createdAt(config.getCreatedAt())
                .updatedAt(config.getUpdatedAt())
                .createdBy(config.getCreatedBy())
                .updatedBy(config.getUpdatedBy())
                .isActive(config.getIsActive())
                .build();
    }
}