package com.schoolmanagement.Staff_Service.service;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.Hibernate;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.schoolmanagement.Staff_Service.client.UserClient;
import com.schoolmanagement.Staff_Service.dto.StaffResponseDTO;
import com.schoolmanagement.Staff_Service.dto.TeacherRequestDTO;
import com.schoolmanagement.Staff_Service.dto.TeacherResponseDTO;
import com.schoolmanagement.Staff_Service.dto.UserResponseDTO;
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
    private final UserClient userClient;

    public ResponseEntity<TeacherResponseDTO> createTeacher(TeacherRequestDTO teacherRequest) {
        UserResponseDTO user = userClient.getUserById(teacherRequest.getStaffId());
        if (user == null || user.getSchoolId() != teacherRequest.getSchoolId()) {
            throw new BadRequestException("User not found or school ID mismatch");
        }

        Staff staff = staffRepository.findById(teacherRequest.getStaffId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Staff not found with ID: " + teacherRequest.getStaffId()));

        if (!hasRole(user, "TEACHER")) {
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

    private boolean hasRole(UserResponseDTO user, String role) {
        return user.getRoles().stream().anyMatch(r -> r.equals(role));
    }

    public ResponseEntity<TeacherResponseDTO> editTeacher(Long teacherId, TeacherRequestDTO teacherRequest) {
        // Retrieve existing Teacher entity
        Teacher existingTeacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new EntityNotFoundException("Teacher not found with ID: " + teacherId));

        Staff staff = existingTeacher.getStaff();

        if (staff == null) {
            throw new IllegalStateException("No staff record associated with this teacher");
        }

        // Ensure the provided Staff ID matches the existing teacher's staff ID
        if (!staff.getStaffId().equals(teacherRequest.getStaffId())) {
            throw new IllegalStateException("Cannot change the staff ID associated with this teacher.");
        }
        if (!staff.getSchoolId().equals(existingTeacher.getStaff().getSchoolId())) {
            throw new IllegalArgumentException("Teacher is not assigned to the given school");
        }

        // if (teacherRequest.getStaff() != null) {
        // staff.setFirstName(teacherRequest.getStaff().getFirstName());
        // staff.setMiddleName(teacherRequest.getStaff().getMiddleName());
        // staff.setLastName(teacherRequest.getStaff().getLastName());
        // staff.setEmail(teacherRequest.getStaff().getEmail());
        // staff.setPhoneNumber(teacherRequest.getStaff().getPhoneNumber());
        // staff.setAddressJson(teacherRequest.getStaff().getAddressJson());
        // staff.setRole(teacherRequest.getStaff().getRole());
        // staff.setStatus(teacherRequest.getStaff().getStatus());
        // staff.setDob(teacherRequest.getStaff().getDob());
        // staff.setGender(teacherRequest.getStaff().getGender());
        // MultipartFile photoFile = teacherRequest.getStaff().getPhoto();
        // if (photoFile != null && !photoFile.isEmpty()) {
        // try {
        // String base64Photo =
        // Base64.getEncoder().encodeToString(photoFile.getBytes());
        // staff.setPhoto(base64Photo);
        // } catch (IOException e) {
        // throw new RuntimeException("Failed to process photo file", e);
        // }
        // }
        // staff.setDateOfJoining(teacherRequest.getStaff().getDateOfJoining());
        // staff.setUsername(teacherRequest.getStaff().getUsername());
        // staff.setPassword(teacherRequest.getStaff().getPassword());

        // // Update the updatedAt timestamp
        // staff.setUpdatedAt(LocalDateTime.now());
        // staff.setUpdated_by("Admin");

        // staffRepository.save(staff);
        // }

        // Update Teacher-specific details
        existingTeacher.setStreamId(teacherRequest.getStreamId());
        existingTeacher.setExperience(teacherRequest.getExperience());
        existingTeacher.setQualification(teacherRequest.getQualification());
        existingTeacher.setSubjectSpecialization(teacherRequest.getSubjectSpecialization());
        existingTeacher.setUpdatedAt(LocalDateTime.now());
        existingTeacher.setUpdatedBy("Admin"); // Get authenticated user

        // Save the updated Teacher record
        Teacher updatedTeacher = teacherRepository.save(existingTeacher);

        return ResponseEntity.ok(convertToTeacherResponse(updatedTeacher));
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
        UserResponseDTO user = userClient.getUserById(teacher.getStaff().getUserId());

        StaffResponseDTO staffResponseDTO = StaffResponseDTO.builder()
                .staffId(teacher.getStaff().getStaffId())
                .userId(teacher.getStaff().getUserId())
                .schoolId(teacher.getStaff().getSchoolId())
                .firstName(teacher.getStaff().getFirstName())
                .middleName(teacher.getStaff().getMiddleName())
                .lastName(teacher.getStaff().getLastName())
                .username(user.getUsername())
                .dateOfJoining(teacher.getStaff().getDateOfJoining())
                .email(user.getEmail())
                .password(user.getPassword())
                .phoneNumber(teacher.getStaff().getPhoneNumber())
                .photo(FileUtils.readFileFromLocation(teacher.getStaff().getPhoto()))
                .roles(user.getRoles())
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
