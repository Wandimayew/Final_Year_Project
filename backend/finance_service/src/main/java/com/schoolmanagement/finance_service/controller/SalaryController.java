package com.schoolmanagement.finance_service.controller;

import com.schoolmanagement.finance_service.dto.SalaryDTO;
import com.schoolmanagement.finance_service.dto.SalaryPaymentDTO;
import com.schoolmanagement.finance_service.service.SalaryManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/finance/salary")
@RequiredArgsConstructor
public class SalaryController {
    
    private final SalaryManagementService salaryManagementService;
    
    @PostMapping("/process")
    public ResponseEntity<SalaryPaymentDTO> processSalaryPayment(
            @Valid @RequestBody SalaryDTO salaryDTO) {
        return new ResponseEntity<>(salaryManagementService.processSalaryPayment(salaryDTO), HttpStatus.CREATED);
    }
    
    @GetMapping("/staff/{staffId}/school/{schoolId}")
    public ResponseEntity<List<SalaryPaymentDTO>> getStaffSalaryHistory(
            @PathVariable String staffId,
            @PathVariable String schoolId) {
        return ResponseEntity.ok(salaryManagementService.getStaffSalaryHistory(staffId, schoolId));
    }
    
    @GetMapping("/report/{schoolId}")
    public ResponseEntity<Map<String, Object>> getMonthlySalaryReport(
            @PathVariable String schoolId,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(salaryManagementService.getMonthlySalaryReport(schoolId, year, month));
    }
}
