package com.schoolmanagement.student_service.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.schoolmanagement.student_service.dto.ParentGuardianRequest;
import com.schoolmanagement.student_service.dto.ParentGuardianResponse;
import com.schoolmanagement.student_service.mapper.ParentGuardianMapper;
import com.schoolmanagement.student_service.model.ParentGuardian;
import com.schoolmanagement.student_service.service.ParentGuardianService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/student/api/parent-guardians")
@RequiredArgsConstructor
public class ParentGuardianController {
    private final ParentGuardianService parentGuardianService;

    // Get all parent/guardians
    @GetMapping
    public ResponseEntity<List<ParentGuardianResponse>> getAllParentGuardians() {
        List<ParentGuardian> parentGuardians = parentGuardianService.getAllParentGuardians();
        List<ParentGuardianResponse> response = parentGuardians.stream()
                .map(ParentGuardianMapper::toResponse)
                .collect(Collectors.toList());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<ParentGuardianResponse> getParentGuardianByContact(
            @RequestParam(required = false) String phoneNumber,
            @RequestParam(required = false) String email) {

        if (phoneNumber == null && email == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        ParentGuardian parentGuardian = parentGuardianService.getParentGuardianByPhoneOrEmail(phoneNumber, email);

        if (parentGuardian == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        ParentGuardianResponse response = ParentGuardianMapper.toResponse(parentGuardian);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Get a parent/guardian by ID
    @GetMapping("/{id}")
    public ResponseEntity<ParentGuardianResponse> getParentGuardianById(@PathVariable Long id) {
        ParentGuardian parentGuardian = parentGuardianService.getParentGuardianById(id);
        ParentGuardianResponse response = ParentGuardianMapper.toResponse(parentGuardian);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Create a new parent/guardian
    @PostMapping
    public ResponseEntity<ParentGuardianResponse> createParentGuardian(
            @Valid @RequestBody ParentGuardianRequest request) {
        ParentGuardian parentGuardian = ParentGuardianMapper.toEntity(request);
        ParentGuardian createdParentGuardian = parentGuardianService.createParentGuardian(parentGuardian);
        ParentGuardianResponse response = ParentGuardianMapper.toResponse(createdParentGuardian);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Update an existing parent/guardian
    @PutMapping("/{id}")
    public ResponseEntity<ParentGuardianResponse> updateParentGuardian(
            @PathVariable Long id,
            @Valid @RequestBody ParentGuardianRequest request) {
        ParentGuardian parentGuardianDetails = ParentGuardianMapper.toEntity(request);
        ParentGuardian updatedParentGuardian = parentGuardianService.updateParentGuardian(id, parentGuardianDetails);
        ParentGuardianResponse response = ParentGuardianMapper.toResponse(updatedParentGuardian);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Delete a parent/guardian
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteParentGuardian(@PathVariable Long id) {
        parentGuardianService.deleteParentGuardian(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
