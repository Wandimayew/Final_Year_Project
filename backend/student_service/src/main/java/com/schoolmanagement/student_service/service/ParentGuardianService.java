package com.schoolmanagement.student_service.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.schoolmanagement.student_service.model.ParentGuardian;
import com.schoolmanagement.student_service.repository.ParentGuardianRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ParentGuardianService {
    private final ParentGuardianRepository parentGuardianRepository;

    // Get all parent/guardians
    public List<ParentGuardian> getAllParentGuardians() {
        return parentGuardianRepository.findAll();
    }

    // Get a parent/guardian by ID
    public ParentGuardian getParentGuardianById(Long id) {
        return parentGuardianRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parent/Guardian not found with id: " + id));
    }

    // Create a new parent/guardian
    public ParentGuardian createParentGuardian(ParentGuardian parentGuardian) {
        return parentGuardianRepository.save(parentGuardian);
    }

    // Update an existing parent/guardian
    public ParentGuardian updateParentGuardian(Long id, ParentGuardian parentGuardianDetails) {
        ParentGuardian existingParentGuardian = parentGuardianRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parent/Guardian not found with id: " + id));

        // Update fields
        existingParentGuardian.setSchoolId(parentGuardianDetails.getSchoolId());
        existingParentGuardian.setFatherName(parentGuardianDetails.getFatherName());
        existingParentGuardian.setMotherName(parentGuardianDetails.getMotherName());
        existingParentGuardian.setOtherFamilyMemberName(parentGuardianDetails.getOtherFamilyMemberName());
        existingParentGuardian.setRelation(parentGuardianDetails.getRelation());
        existingParentGuardian.setEmail(parentGuardianDetails.getEmail());
        existingParentGuardian.setAddress(parentGuardianDetails.getAddress());
        existingParentGuardian.setPhoneNumber(parentGuardianDetails.getPhoneNumber());

        // Save the updated parent/guardian
        return parentGuardianRepository.save(existingParentGuardian);
    }

    // Delete a parent/guardian
    public void deleteParentGuardian(Long id) {
        ParentGuardian parentGuardian = parentGuardianRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parent/Guardian not found with id: " + id));
        parentGuardianRepository.delete(parentGuardian);
    }
}
