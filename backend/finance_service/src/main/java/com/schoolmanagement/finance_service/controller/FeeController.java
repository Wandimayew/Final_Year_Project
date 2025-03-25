package com.schoolmanagement.finance_service.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.schoolmanagement.finance_service.dto.FeeDTO;
import com.schoolmanagement.finance_service.dto.StudentFeeDTO;
import com.schoolmanagement.finance_service.service.FeeManagementService;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/finance/fees")
@RequiredArgsConstructor
@Slf4j
public class FeeController {
    
    private final FeeManagementService feeManagementService;
    
    @PostMapping
    public ResponseEntity<FeeDTO> createFee(@Valid @RequestBody FeeDTO feeDTO) {
        log.info("request body inside controller {}", feeDTO);
        return new ResponseEntity<>(feeManagementService.createFee(feeDTO), HttpStatus.CREATED);
    }
    
    @PutMapping("/{feeId}")
    public ResponseEntity<FeeDTO> updateFee(
            @PathVariable Long feeId,
            @Valid @RequestBody FeeDTO feeDTO) {
        return ResponseEntity.ok(feeManagementService.updateFee(feeId, feeDTO));
    }
    
    @DeleteMapping("/{feeId}")
    public ResponseEntity<Void> deleteFee(@PathVariable Long feeId) {
        feeManagementService.deleteFee(feeId);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/school/{schoolId}")
    public ResponseEntity<List<FeeDTO>> getSchoolFees(@PathVariable String schoolId) {
        return ResponseEntity.ok(feeManagementService.getSchoolFees(schoolId));
    }
    
    @PostMapping("/student")
    public ResponseEntity<StudentFeeDTO> assignFeeToStudent(
            @Valid @RequestBody StudentFeeDTO studentFeeDTO) {
                log.info("request body inside controller {}", studentFeeDTO);
        return new ResponseEntity<>(feeManagementService.assignFeeToStudent(studentFeeDTO), HttpStatus.CREATED);
    }
    
    @GetMapping("/student/{studentId}/school/{schoolId}")
    public ResponseEntity<List<StudentFeeDTO>> getStudentFees(
            @PathVariable String studentId,
            @PathVariable String schoolId) {
        return ResponseEntity.ok(feeManagementService.getStudentFees(studentId, schoolId));
    }
    
    @GetMapping("/outstanding/{schoolId}")
    public ResponseEntity<List<StudentFeeDTO>> getOutstandingFees(@PathVariable String schoolId) {
        return ResponseEntity.ok(feeManagementService.getOutstandingFees(schoolId));
    }
    
    @PutMapping("/student/{studentFeeId}/payment")
    public ResponseEntity<StudentFeeDTO> updateStudentFeePayment(
            @PathVariable Long studentFeeId,
            @RequestParam BigDecimal paidAmount) {
        return ResponseEntity.ok(feeManagementService.updateStudentFeePayment(studentFeeId, paidAmount));
    }
}
