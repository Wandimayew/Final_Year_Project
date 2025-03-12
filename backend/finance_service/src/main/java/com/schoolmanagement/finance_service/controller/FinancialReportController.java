package com.schoolmanagement.finance_service.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.schoolmanagement.finance_service.dto.FinancialReportDTO;
import com.schoolmanagement.finance_service.dto.FinancialSummaryDTO;
import com.schoolmanagement.finance_service.service.FinancialReportingService;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/finance/reports")
@RequiredArgsConstructor
public class FinancialReportController {
    
    private final FinancialReportingService reportingService;
    
    @GetMapping("/summary/{schoolId}")
    public ResponseEntity<FinancialSummaryDTO> getFinancialSummary(
            @PathVariable String schoolId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportingService.getFinancialSummary(schoolId, startDate, endDate));
    }
    
    @GetMapping("/monthly/{schoolId}")
    public ResponseEntity<FinancialReportDTO> getMonthlyReport(
            @PathVariable String schoolId,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(reportingService.generateMonthlyReport(schoolId, year, month));
    }
    
    @GetMapping("/annual/{schoolId}")
    public ResponseEntity<FinancialReportDTO> getAnnualReport(
            @PathVariable String schoolId,
            @RequestParam int year) {
        return ResponseEntity.ok(reportingService.generateAnnualReport(schoolId, year));
    }
    
    @GetMapping("/dashboard/{schoolId}")
    public ResponseEntity<Map<String, Object>> getDashboardStats(@PathVariable String schoolId) {
        return ResponseEntity.ok(reportingService.getDashboardFinancialStats(schoolId));
    }
}
