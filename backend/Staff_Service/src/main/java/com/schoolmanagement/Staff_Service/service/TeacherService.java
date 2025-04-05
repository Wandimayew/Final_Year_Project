package com.schoolmanagement.Staff_Service.service;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.Hibernate;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.schoolmanagement.Staff_Service.dto.StaffResponseDTO;
import com.schoolmanagement.Staff_Service.dto.TeacherRequestDTO;
import com.schoolmanagement.Staff_Service.dto.TeacherResponseDTO;
import com.schoolmanagement.Staff_Service.exception.BadRequestException;
import com.schoolmanagement.Staff_Service.file.FileUtils;
import com.schoolmanagement.Staff_Service.model.Staff;
import com.schoolmanagement.Staff_Service.model.Teacher;
import com.schoolmanagement.Staff_Service.repository.StaffRepository;
import com.schoolmanagement.Staff_Service.repository.TeacherRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final StaffRepository staffRepository;

    public ResponseEntity<TeacherResponseDTO> createTeacher(TeacherRequestDTO teacherRequest) {

        Staff staff = staffRepository.findById(teacherRequest.getStaffId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Staff not found with ID: " + teacherRequest.getStaffId()));

        if (!hasRole(staff, "TEACHER")) {
            throw new IllegalStateException("Staff member is not assigned the role of TEACHER");
        }

        if (teacherRepository.findByStaffId(teacherRequest.getStaffId()).isPresent()) {
            throw new IllegalStateException("Teacher already exists for staff ID: " + teacherRequest.getStaffId());
        }

        Teacher teacher = new Teacher();

        teacher.setStaff(staff);
        teacher.setSchoolId(teacherRequest.getSchoolId());
        teacher.setStreamId(teacherRequest.getStreamId());
        teacher.setSubjectSpecialization(teacherRequest.getSubjectSpecialization());
        teacher.setQualification(teacherRequest.getQualification());
        teacher.setExperience(teacherRequest.getExperience());
        teacher.setCreatedAt(LocalDateTime.now());

        Teacher savedTeacher = teacherRepository.save(teacher);
        return ResponseEntity.ok(convertToTeacherResponse(savedTeacher));
    }

    private boolean hasRole(Staff staff, String role) {
        return staff.getRoles().stream().anyMatch(r -> r.equals(role));
    }

    public Teacher updateTeacher(Long teacherId, TeacherRequestDTO teacherRequest) {
        Teacher existingTeacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new EntityNotFoundException("Teacher not found with ID:: " + teacherId));

        // Update only if new values are provided (null check)
        if (teacherRequest.getStreamId() != null) {
            existingTeacher.setStreamId(teacherRequest.getStreamId());
        }

        if (teacherRequest.getExperience() != null) {
            existingTeacher.setExperience(teacherRequest.getExperience());
        }

        if (teacherRequest.getQualification() != null) {
            existingTeacher.setQualification(teacherRequest.getQualification());
        }

        if (teacherRequest.getSubjectSpecialization() != null) {
            existingTeacher.setSubjectSpecialization(teacherRequest.getSubjectSpecialization());
        }

        existingTeacher.setUpdatedAt(LocalDateTime.now());
        existingTeacher.setUpdatedBy("Admin");

        return teacherRepository.save(existingTeacher);
    }

    public ResponseEntity<TeacherResponseDTO> getTeacherById(Long teacherId) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new EntityNotFoundException("Teacher not found with ID: " + teacherId));

        Hibernate.initialize(teacher.getStaff());
        return ResponseEntity.ok(convertToTeacherResponse(teacher));
    }

    public ResponseEntity<List<TeacherResponseDTO>> getAllTeachers() {
        log.info("getting all teachers one by one");
        List<Teacher> teachers = teacherRepository.findAllTeachersThatAreActive();
        log.info("getting all teachers {}", teachers);
        return teachers.isEmpty() ? ResponseEntity.notFound().build()
                : ResponseEntity.ok(teachers.stream().map(this::convertToTeacherResponse).toList());
    }

    public ResponseEntity<List<TeacherResponseDTO>> getAllTeacher() {
        log.info("getting all teachers one by one");
        List<Teacher> teachers = teacherRepository.findAll();
        log.info("getting all teachers {}", teachers);
        return teachers.isEmpty() ? ResponseEntity.notFound().build()
                : ResponseEntity.ok(teachers.stream().map(this::convertToTeacherResponse).toList());
    }

    public ResponseEntity<List<TeacherResponseDTO>> getAllInactiveTeachers() {
        log.info("getting all inactive teachers one by one");
        List<Teacher> teachers = teacherRepository.findAllTeachersThatAreNotActive();
        log.info("getting all inactive teachers {}", teachers);
        return teachers.isEmpty() ? ResponseEntity.notFound().build()
                : ResponseEntity.ok(teachers.stream().map(this::convertToTeacherResponse).toList());
    }

    public ResponseEntity<String> deleteTeacherById(Long teacherId) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new EntityNotFoundException("Teacher not found with ID: " + teacherId));

        Staff staff = teacher.getStaff();
        staff.setIsActive(false);
        staffRepository.save(staff);
        return ResponseEntity.ok("Teacher with ID " + teacherId + " has been deactivated.");
    }

    private TeacherResponseDTO convertToTeacherResponse(Teacher teacher) {

        StaffResponseDTO staffResponseDTO = StaffResponseDTO.builder()
                .staffId(teacher.getStaff().getStaffId())
                .userId(teacher.getStaff().getUserId())
                .schoolId(teacher.getStaff().getSchoolId())
                .firstName(teacher.getStaff().getFirstName())
                .middleName(teacher.getStaff().getMiddleName())
                .lastName(teacher.getStaff().getLastName())
                .username(teacher.getStaff().getUsername())
                .dateOfJoining(teacher.getStaff().getDateOfJoining())
                .email(teacher.getStaff().getEmail())
                .password(teacher.getStaff().getPassword())
                .phoneNumber(teacher.getStaff().getPhoneNumber())
                .photo(FileUtils.readFileFromLocation(teacher.getStaff().getPhoto()))
                .roles(teacher.getStaff().getRoles())
                .status(teacher.getStaff().getStatus())
                .dob(teacher.getStaff().getDob())
                .gender(teacher.getStaff().getGender())
                .addressJson(teacher.getStaff().getAddressJson())
                .isActive(teacher.getStaff().getIsActive())
                .createdAt(teacher.getStaff().getCreatedAt())
                .updatedAt(teacher.getStaff().getUpdatedAt())
                .created_by(teacher.getStaff().getCreated_by())
                .build();
        return TeacherResponseDTO.builder()
                .staff(staffResponseDTO)
                .teacherId(teacher.getTeacherId())
                .streamId(teacher.getStreamId())
                .subjectSpecialization(teacher.getSubjectSpecialization())
                .experience(teacher.getExperience())
                .qualification(teacher.getQualification())
                .build();
    }
}

