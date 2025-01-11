package com.schoolmanagement.student_service.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.schoolmanagement.student_service.model.ParentCommunication;
import com.schoolmanagement.student_service.repository.ParentCommunicationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ParentCommunicationService {
    private final ParentCommunicationRepository parentCommunicationRepository;

    // Get all parent communications
    public List<ParentCommunication> getAllParentCommunications() {
        return parentCommunicationRepository.findAll();
    }

    // Get a parent communication by ID
    public ParentCommunication getParentCommunicationById(Long id) {
        return parentCommunicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parent Communication not found with id: " + id));
    }

    // Create a new parent communication
    public ParentCommunication createParentCommunication(ParentCommunication parentCommunication) {
        return parentCommunicationRepository.save(parentCommunication);
    }

    // Update an existing parent communication
    public ParentCommunication updateParentCommunication(Long id, ParentCommunication parentCommunicationDetails) {
        ParentCommunication existingParentCommunication = parentCommunicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parent Communication not found with id: " + id));

        // Update fields
        existingParentCommunication.setSchoolId(parentCommunicationDetails.getSchoolId());
        existingParentCommunication.setSentAt(parentCommunicationDetails.getSentAt());
        existingParentCommunication.setMessage(parentCommunicationDetails.getMessage());
        existingParentCommunication.setParentGuardian(parentCommunicationDetails.getParentGuardian());

        // Save the updated parent communication
        return parentCommunicationRepository.save(existingParentCommunication);
    }

    // Delete a parent communication
    public void deleteParentCommunication(Long id) {
        ParentCommunication parentCommunication = parentCommunicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parent Communication not found with id: " + id));
        parentCommunicationRepository.delete(parentCommunication);
    }
}
