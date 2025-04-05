package com.schoolmanagement.Staff_Service.controller;

import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.schoolmanagement.Staff_Service.dto.StaffRequestDTO;
import com.schoolmanagement.Staff_Service.dto.StaffResponseDTO;
import com.schoolmanagement.Staff_Service.dto.StaffUpdateDTO;
import com.schoolmanagement.Staff_Service.service.StaffService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/staff/api/staff")
@RequiredArgsConstructor
@Slf4j
public class StaffController {

    private final StaffService staffService;

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<StaffResponseDTO> createStaff(@ModelAttribute StaffRequestDTO staffRequest) {

        log.info("Received staff request: {}", staffRequest);
        return staffService.createStaff(staffRequest);
    }

    @PutMapping("/{staffId}")
    public ResponseEntity<StaffResponseDTO> updateStaff(@PathVariable Long staffId,
            @Valid @RequestBody StaffUpdateDTO staffUpdateDTO) {
        return staffService.updateStaff(staffId, staffUpdateDTO);
    }

    @GetMapping("/by-user/{userId}")
public ResponseEntity<StaffResponseDTO> getStaffByUserId(@PathVariable String userId) {
    return staffService.getStaffByUserId(userId);
}


    @DeleteMapping("/{staffId}")
    public ResponseEntity<String> deleteStaff(@PathVariable Long staffId) {
        return staffService.deleteStaffById(staffId);
    }

    @GetMapping
    public ResponseEntity<List<StaffResponseDTO>> getAllActiveStaff() {
        return staffService.getAllActiveStaff();
    }

    @GetMapping("/{staffId}")
    public ResponseEntity<StaffResponseDTO> getStaffById(@PathVariable Long staffId) {
        return staffService.getStaffById(staffId);
    }

    @PutMapping("/{staffId}/change-password")
    public ResponseEntity<StaffResponseDTO> changePassword(@PathVariable Long staffId,
            @RequestParam String currentPassword, @RequestParam String newPassword) {
        return staffService.changePassword(staffId, currentPassword, newPassword);
    }
}