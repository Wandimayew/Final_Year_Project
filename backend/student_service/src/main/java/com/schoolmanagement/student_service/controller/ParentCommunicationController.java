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
import org.springframework.web.bind.annotation.RestController;

import com.schoolmanagement.student_service.dto.ParentCommunicationRequest;
import com.schoolmanagement.student_service.dto.ParentCommunicationResponse;
import com.schoolmanagement.student_service.mapper.ParentCommunicationMapper;
import com.schoolmanagement.student_service.model.ParentCommunication;
import com.schoolmanagement.student_service.service.ParentCommunicationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/student/api/communications")
@RequiredArgsConstructor
public class ParentCommunicationController {
    private final ParentCommunicationService parentCommunicationService;

    // Get all parent communications
    @GetMapping
    public ResponseEntity<List<ParentCommunicationResponse>> getAllParentCommunications() {
        List<ParentCommunication> parentCommunications = parentCommunicationService.getAllParentCommunications();
        List<ParentCommunicationResponse> response = parentCommunications.stream()
                .map(ParentCommunicationMapper::toResponse)
                .collect(Collectors.toList());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Get a parent communication by ID
    @GetMapping("/{id}")
    public ResponseEntity<ParentCommunicationResponse> getParentCommunicationById(@PathVariable Long id) {
        ParentCommunication parentCommunication = parentCommunicationService.getParentCommunicationById(id);
        ParentCommunicationResponse response = ParentCommunicationMapper.toResponse(parentCommunication);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Create a new parent communication
    @PostMapping
    public ResponseEntity<ParentCommunicationResponse> createParentCommunication(@Valid @RequestBody ParentCommunicationRequest request) {
        ParentCommunication parentCommunication = ParentCommunicationMapper.toEntity(request);
        ParentCommunication createdParentCommunication = parentCommunicationService.createParentCommunication(parentCommunication);
        ParentCommunicationResponse response = ParentCommunicationMapper.toResponse(createdParentCommunication);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Update an existing parent communication
    @PutMapping("/{id}")
    public ResponseEntity<ParentCommunicationResponse> updateParentCommunication(
            @PathVariable Long id,
            @Valid @RequestBody ParentCommunicationRequest request) {
        ParentCommunication parentCommunicationDetails = ParentCommunicationMapper.toEntity(request);
        ParentCommunication updatedParentCommunication = parentCommunicationService.updateParentCommunication(id, parentCommunicationDetails);
        ParentCommunicationResponse response = ParentCommunicationMapper.toResponse(updatedParentCommunication);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Delete a parent communication
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteParentCommunication(@PathVariable Long id) {
        parentCommunicationService.deleteParentCommunication(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}

