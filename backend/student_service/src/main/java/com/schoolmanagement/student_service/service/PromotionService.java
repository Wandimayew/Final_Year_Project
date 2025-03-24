package com.schoolmanagement.student_service.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.schoolmanagement.student_service.model.Promotion;
import com.schoolmanagement.student_service.model.Student;
import com.schoolmanagement.student_service.model.Student.PassedOrFail;
import com.schoolmanagement.student_service.repository.PromotionRepository;
import com.schoolmanagement.student_service.repository.StudentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PromotionService {
    private final PromotionRepository promotionRepository;
    private final StudentRepository studentRepository;

    // Get all promotions
    public List<Promotion> getAllPromotions() {
        return promotionRepository.findAll();
    }

    // Get a promotion by ID
    public Promotion getPromotionById(Long id) {
        return promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found with id: " + id));
    }

    // Create a new promotion
    public Promotion createPromotion(Promotion promotion) {
        return promotionRepository.save(promotion);
    }

    // Update an existing promotion
    public Promotion updatePromotion(Long id, Promotion promotionDetails) {
        Promotion existingPromotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found with id: " + id));

        // Update fields
        existingPromotion.setSchoolId(promotionDetails.getSchoolId());
        existingPromotion.setPreviousClassId(promotionDetails.getPreviousClassId());
        existingPromotion.setNewClassId(promotionDetails.getNewClassId());
        existingPromotion.setPromotionDate(promotionDetails.getPromotionDate());
        existingPromotion.setRemark(promotionDetails.getRemark());
        existingPromotion.setStudent(promotionDetails.getStudent());

        // Save the updated promotion
        return promotionRepository.save(existingPromotion);
    }

    // Delete a promotion
    public void deletePromotion(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found with id: " + id));
        promotionRepository.delete(promotion);
    }

    public void promoteStudents(Long currentClassId, Long newClassId, Long sectionId, PassedOrFail isPassed) {
        // Fetch all students in the current class who meet the passing criteria
        
        List<Student> studentsToPromote = studentRepository.findByClassIdAndSectionIdAndIsPassed(currentClassId, sectionId, isPassed);

        if (studentsToPromote.isEmpty()) {
            throw new RuntimeException("No students meet the criteria for promotion.");
        }

        // Loop through each student and promote them
        for (Student student : studentsToPromote) {
            // Create a new Promotion record
            Promotion promotion = new Promotion();
            promotion.setSchoolId(student.getSchoolId());
            promotion.setPreviousClassId(currentClassId);
            promotion.setNewClassId(newClassId);
            promotion.setPromotionDate(LocalDate.now());
            promotion.setRemark("Promoted successfully");

            // Save the Promotion record
            promotionRepository.save(promotion);

            // Update the student's current class
            student.setClassId(newClassId);
            studentRepository.save(student);
        }

        System.out.println("Students promoted from class ID " + currentClassId + " to class ID " + newClassId);
    }
}
