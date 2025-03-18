package com.schoolmanagement.Staff_Service.service;

import com.schoolmanagement.Staff_Service.dto.StaffRequestDTO;
import com.schoolmanagement.Staff_Service.dto.StaffResponseDTO;
import com.schoolmanagement.Staff_Service.dto.StaffUpdateDTO;
import com.schoolmanagement.Staff_Service.dto.TeacherResponseDTO;
import com.schoolmanagement.Staff_Service.exception.BadRequestException;
import com.schoolmanagement.Staff_Service.file.FileStorageService;
import com.schoolmanagement.Staff_Service.file.FileUtils;
import com.schoolmanagement.Staff_Service.model.Staff;
import com.schoolmanagement.Staff_Service.model.Teacher;
import com.schoolmanagement.Staff_Service.repository.StaffRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class StaffService {

    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;
    private final TeacherService teacherService;

    // Method to create a new staff
    public ResponseEntity<StaffResponseDTO> createStaff(StaffRequestDTO staffRequest) {

        validateNewStaff(staffRequest);
        Staff staff = new Staff();

        staff.setSchoolId(staffRequest.getSchoolId());
        staff.setUserId(staffRequest.getUserId());
        staff.setFirstName(staffRequest.getFirstName());
        staff.setMiddleName(staffRequest.getMiddleName());
        staff.setLastName(staffRequest.getLastName());
        staff.setUsername(staffRequest.getUsername());
        staff.setEmail(staffRequest.getEmail());
        staff.setPassword(passwordEncoder.encode(staffRequest.getPassword()));
        staff.setRoles(staffRequest.getRoles());
        staff.setDateOfJoining(staffRequest.getDateOfJoining());
        staff.setGender(staffRequest.getGender());
        staff.setStatus(staffRequest.getStatus());
        staff.setDob(staffRequest.getDob());
        staff.setPhoneNumber(staffRequest.getPhoneNumber());
        staff.setAddressJson(staffRequest.getAddressJson());

        staff.setIsActive(true);
        staff.setCreatedAt(LocalDateTime.now());
        staff.setUpdatedAt(LocalDateTime.now());

        Staff savedStaff = staffRepository.save(staff);
        if (staffRequest.getPhoto() != null) {
            uploadStaffPhoto(staffRequest.getPhoto(), staff.getStaffId());
        }
        return ResponseEntity.ok(convertToStaffResponse(savedStaff));
    }

    // Method to update an existing staff
    public ResponseEntity<StaffResponseDTO> updateStaff(Long staffId, StaffUpdateDTO staffUpdateRequest) {
        Staff existingStaff = staffRepository.findById(staffId)
                .orElseThrow(() -> new EntityNotFoundException("Staff not found with ID:: " + staffId));
        if (!existingStaff.getIsActive()) {
            throw new BadRequestException("Account is inactive");
        }

        existingStaff.setFirstName(
                staffUpdateRequest.getFirstName() != null ? staffUpdateRequest.getFirstName()
                        : existingStaff.getFirstName());
        existingStaff.setMiddleName(
                staffUpdateRequest.getMiddleName() != null ? staffUpdateRequest.getMiddleName()
                        : existingStaff.getMiddleName());
        existingStaff.setLastName(
                staffUpdateRequest.getLastName() != null ? staffUpdateRequest.getLastName()
                        : existingStaff.getLastName());
        existingStaff.setUsername(
                staffUpdateRequest.getUsername() != null ? staffUpdateRequest.getUsername()
                        : existingStaff.getUsername());
        existingStaff.setEmail(
                staffUpdateRequest.getEmail() != null ? staffUpdateRequest.getEmail() : existingStaff.getEmail());
        existingStaff.setPassword(passwordEncoder
                .encode(staffUpdateRequest.getPassword() != null ? staffUpdateRequest.getPassword()
                        : existingStaff.getPassword()));
        existingStaff.setPhoneNumber(
                staffUpdateRequest.getPhoneNumber() != null ? staffUpdateRequest.getPhoneNumber()
                        : existingStaff.getPhoneNumber());
        existingStaff
                .setStatus(staffUpdateRequest.getStatus() != null ? staffUpdateRequest.getStatus()
                        : existingStaff.getStatus());

        existingStaff.setUpdatedAt(LocalDateTime.now());
        existingStaff.setUpdated_by("admin");

        // update Teachers specific fields
        if (existingStaff.getTeacher() != null && staffUpdateRequest.getTeacherRequest() != null) {
            Teacher existingTeacher = existingStaff.getTeacher();
            Teacher updatedTeacher = teacherService.updateTeacher(existingTeacher.getTeacherId(),
                    staffUpdateRequest.getTeacherRequest());
            existingStaff.setTeacher(updatedTeacher);
        }
        Staff updatedStaff = staffRepository.save(existingStaff);
        if (staffUpdateRequest.getPhoto() != null) {
            uploadStaffPhoto(staffUpdateRequest.getPhoto(), existingStaff.getStaffId());
        }
        return ResponseEntity.ok(convertToStaffResponse(updatedStaff));
    }

    public void uploadStaffPhoto(MultipartFile file, Long staffId) {
        if (staffId == null) {
            throw new IllegalArgumentException("Staff ID must not be null");
        }
        log.info("Uploading staff photo for staff ID: {}", staffId);
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new EntityNotFoundException("No staff found with ID:: " + staffId));
        var logo = fileStorageService.saveFile(file, staffId);
        staff.setPhoto(logo);
        staffRepository.save(staff);
    }

    // Method to delete a staff by ID (soft delete by setting isActive to false)
    public ResponseEntity<String> deleteStaffById(Long staffId) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new EntityNotFoundException("Staff not found with ID:: " + staffId));

        staff.setIsActive(false);
        staffRepository.save(staff);
        return ResponseEntity.ok("Staff with ID " + staff.getStaffId() + " deleted successfully.");
    }

    // Method to get all active staff
    public ResponseEntity<List<StaffResponseDTO>> getAllActiveStaff() {
        List<Staff> activeStaff = staffRepository.findAllStaffThatIsActive();
        return ResponseEntity.ok(activeStaff.stream()
                .map(this::convertToStaffResponse)
                .collect(Collectors.toList()));
    }

    // Method to get staff by ID
    public ResponseEntity<StaffResponseDTO> getStaffById(Long staffId) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new EntityNotFoundException("Staff not found with ID:: " + staffId));
        if (!staff.getIsActive()) {
            throw new BadRequestException("Account is inactive");
        }
        return ResponseEntity.ok(convertToStaffResponse(staff));
    }

    public ResponseEntity<StaffResponseDTO> getStaffByUserId(String userId) {
        Staff staff = staffRepository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Staff not found with user ID:: " + userId));
    
        if (!staff.getIsActive()) {
            throw new BadRequestException("Account is inactive");
        }
    
        return ResponseEntity.ok(convertToStaffResponse(staff));
    }

    // Method to change staff password
    public ResponseEntity<StaffResponseDTO> changePassword(Long staffId, String currentPassword, String newPassword) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new EntityNotFoundException("Staff not found with ID:: " + staffId));

        if (!passwordEncoder.matches(currentPassword, staff.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        staff.setPassword(passwordEncoder.encode(newPassword));
        staff.setUpdatedAt(LocalDateTime.now());
        Staff updatedStaff = staffRepository.save(staff);
        return ResponseEntity.ok(convertToStaffResponse(updatedStaff));
    }

    private void validateNewStaff(StaffRequestDTO staffRequest) {
        if (staffRepository.existsByEmail(staffRequest.getEmail())) {
            throw new BadRequestException("Email already exists");
        }
        if (staffRepository.existsByPhoneNumber(staffRequest.getPhoneNumber())) {
            throw new BadRequestException("Phone number already exists");
        }
    }

    // Helper method to convert Staff entity to StaffResponseDTO
    private StaffResponseDTO convertToStaffResponse(Staff staff) {
        TeacherResponseDTO teacherDTO = null;
        if (staff.getTeacher() != null) {
            teacherDTO = TeacherResponseDTO.builder()
                .teacherId(staff.getTeacher().getTeacherId())
                .streamId(staff.getTeacher().getStreamId())
                .experience(staff.getTeacher().getExperience())
                .qualification(staff.getTeacher().getQualification())
                .subjectSpecialization(staff.getTeacher().getSubjectSpecialization())
                .build();
        }
    
        return StaffResponseDTO.builder()
            .staffId(staff.getStaffId())
            .userId(staff.getUserId())
            .schoolId(staff.getSchoolId())
            .firstName(staff.getFirstName())
            .middleName(staff.getMiddleName())
            .lastName(staff.getLastName())
            .username(staff.getUsername())
            .dateOfJoining(staff.getDateOfJoining())
            .email(staff.getEmail())
            .password(staff.getPassword())
            .roles(staff.getRoles())
            .phoneNumber(staff.getPhoneNumber())
            .status(staff.getStatus())
            .dob(staff.getDob())
            .gender(staff.getGender())
            .addressJson(staff.getAddressJson())
            .isActive(staff.getIsActive())
            .photo(FileUtils.readFileFromLocation(staff.getPhoto()))
            .createdAt(staff.getCreatedAt())
            .updatedAt(staff.getUpdatedAt())
            .teacher(teacherDTO) 
            .build();
    }
}
