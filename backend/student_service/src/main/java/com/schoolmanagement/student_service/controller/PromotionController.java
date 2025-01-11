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

import com.schoolmanagement.student_service.dto.PromotionRequest;
import com.schoolmanagement.student_service.dto.PromotionResponse;
import com.schoolmanagement.student_service.mapper.PromotionMapper;
import com.schoolmanagement.student_service.model.Promotion;
import com.schoolmanagement.student_service.service.PromotionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
public class PromotionController {
    private final PromotionService promotionService;

    // Get all promotions
    @GetMapping
    public ResponseEntity<List<PromotionResponse>> getAllPromotions() {
        List<Promotion> promotions = promotionService.getAllPromotions();
        List<PromotionResponse> response = promotions.stream()
                .map(PromotionMapper::toResponse)
                .collect(Collectors.toList());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Get a promotion by ID
    @GetMapping("/{id}")
    public ResponseEntity<PromotionResponse> getPromotionById(@PathVariable Long id) {
        Promotion promotion = promotionService.getPromotionById(id);
        PromotionResponse response = PromotionMapper.toResponse(promotion);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Create a new promotion
    @PostMapping
    public ResponseEntity<PromotionResponse> createPromotion(@Valid @RequestBody PromotionRequest request) {
        Promotion promotion = PromotionMapper.toEntity(request);
        Promotion createdPromotion = promotionService.createPromotion(promotion);
        PromotionResponse response = PromotionMapper.toResponse(createdPromotion);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Update an existing promotion
    @PutMapping("/{id}")
    public ResponseEntity<PromotionResponse> updatePromotion(
            @PathVariable Long id,
            @Valid @RequestBody PromotionRequest request) {
        Promotion promotionDetails = PromotionMapper.toEntity(request);
        Promotion updatedPromotion = promotionService.updatePromotion(id, promotionDetails);
        PromotionResponse response = PromotionMapper.toResponse(updatedPromotion);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Delete a promotion
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePromotion(@PathVariable Long id) {
        promotionService.deletePromotion(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
