package com.schoolmanagement.finance_service.service;

import com.schoolmanagement.finance_service.dto.FinancialReportDTO;
import com.schoolmanagement.finance_service.dto.FinancialSummaryDTO;
import com.schoolmanagement.finance_service.model.FinancialTransaction;
import com.schoolmanagement.finance_service.model.Invoice;
import com.schoolmanagement.finance_service.model.Payment;
import com.schoolmanagement.finance_service.model.FinancialTransaction.TransactionType;
import com.schoolmanagement.finance_service.repository.FinancialTransactionRepository;
import com.schoolmanagement.finance_service.repository.InvoiceRepository;
import com.schoolmanagement.finance_service.repository.PaymentRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinancialReportingService {
    
    private final FinancialTransactionRepository transactionRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    
    public FinancialSummaryDTO getFinancialSummary(String schoolId, LocalDate startDate, LocalDate endDate) {
        // Get all transactions for the period
        List<FinancialTransaction> transactions = transactionRepository
                .findBySchoolIdAndTransactionDateBetween(schoolId, startDate, endDate);
        
        // Calculate income
        BigDecimal totalIncome = transactions.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .map(FinancialTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Calculate expenses
        BigDecimal totalExpenses = transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .map(FinancialTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Get all invoices for the period
        List<Invoice> invoices = invoiceRepository
                .findBySchoolIdAndIssueDateBetween(schoolId, startDate, endDate);
        
        // Calculate outstanding invoices
        BigDecimal totalOutstanding = invoices.stream()
                .filter(i -> "UNPAID".equals(i.getStatus()) || "PARTIALLY_PAID".equals(i.getStatus()))
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Get payments for the period
        List<Payment> payments = paymentRepository.findByPaymentDateBetween(startDate, endDate)
                .stream()
                .filter(p -> p.getSchoolId().equals(schoolId))
                .collect(Collectors.toList());
        
        // Calculate total payments
        BigDecimal totalPayments = payments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return FinancialSummaryDTO.builder()
                .schoolId(schoolId)
                .startDate(startDate)
                .endDate(endDate)
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .totalOutstanding(totalOutstanding)
                .totalPayments(totalPayments)
                .netBalance(totalIncome.subtract(totalExpenses))
                .build();
    }
    
    public FinancialReportDTO generateMonthlyReport(String schoolId, int year, int month) {
        // Set date range for the month
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);
        
        FinancialSummaryDTO summary = getFinancialSummary(schoolId, startDate, endDate);
        
        // Get transactions by category
        List<FinancialTransaction> transactions = transactionRepository
                .findBySchoolIdAndTransactionDateBetween(schoolId, startDate, endDate);
        
        // Group transactions by category
        Map<String, BigDecimal> expensesByCategory = new HashMap<>();
        Map<String, BigDecimal> incomeByCategory = new HashMap<>();
        
        transactions.forEach(transaction -> {
            String category = transaction.getCategory().toString();
            BigDecimal amount = transaction.getAmount();
            
            if (transaction.getType() == TransactionType.EXPENSE) {
                expensesByCategory.put(
                        category, 
                        expensesByCategory.getOrDefault(category, BigDecimal.ZERO).add(amount)
                );
            } else if (transaction.getType() == TransactionType.INCOME) {
                incomeByCategory.put(
                        category, 
                        incomeByCategory.getOrDefault(category, BigDecimal.ZERO).add(amount)
                );
            }
        });
        
        // Get invoices by status
        List<Invoice> invoices = invoiceRepository
                .findBySchoolIdAndIssueDateBetween(schoolId, startDate, endDate);
        
        Map<String, Long> invoicesByStatus = invoices.stream()
                .collect(Collectors.groupingBy(Invoice::getStatus, Collectors.counting()));
        
        // Build detailed report
        return FinancialReportDTO.builder()
                .summary(summary)
                .expensesByCategory(expensesByCategory)
                .incomeByCategory(incomeByCategory)
                .invoicesByStatus(invoicesByStatus)
                .reportPeriod("Monthly Report - " + startDate.getMonth() + " " + startDate.getYear())
                .build();
    }
    
    public FinancialReportDTO generateAnnualReport(String schoolId, int year) {
        // Set date range for the year
        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);
        
        FinancialSummaryDTO summary = getFinancialSummary(schoolId, startDate, endDate);
        
        // Get transactions for the year
        List<FinancialTransaction> transactions = transactionRepository
                .findBySchoolIdAndTransactionDateBetween(schoolId, startDate, endDate);
        
        // Group transactions by month and category
        Map<Integer, BigDecimal> incomeByMonth = new HashMap<>();
        Map<Integer, BigDecimal> expensesByMonth = new HashMap<>();
        
        transactions.forEach(transaction -> {
            int month = transaction.getTransactionDate().getMonthValue();
            BigDecimal amount = transaction.getAmount();
            
            if (transaction.getType() == TransactionType.INCOME) {
                incomeByMonth.put(
                        month,
                        incomeByMonth.getOrDefault(month, BigDecimal.ZERO).add(amount)
                );
            } else if (transaction.getType() == TransactionType.EXPENSE) {
                expensesByMonth.put(
                        month,
                        expensesByMonth.getOrDefault(month, BigDecimal.ZERO).add(amount)
                );
            }
        });
        
        // Group transactions by category for the entire year
        Map<String, BigDecimal> expensesByCategory = new HashMap<>();
        Map<String, BigDecimal> incomeByCategory = new HashMap<>();
        
        transactions.forEach(transaction -> {
            String category = transaction.getCategory().toString();
            BigDecimal amount = transaction.getAmount();
            
            if (transaction.getType() == TransactionType.EXPENSE) {
                expensesByCategory.put(
                        category, 
                        expensesByCategory.getOrDefault(category, BigDecimal.ZERO).add(amount)
                );
            } else if (transaction.getType() == TransactionType.INCOME) {
                incomeByCategory.put(
                        category, 
                        incomeByCategory.getOrDefault(category, BigDecimal.ZERO).add(amount)
                );
            }
        });
        
        // Build detailed annual report
        return FinancialReportDTO.builder()
                .summary(summary)
                .expensesByCategory(expensesByCategory)
                .incomeByCategory(incomeByCategory)
                .incomeByMonth(incomeByMonth)
                .expensesByMonth(expensesByMonth)
                .reportPeriod("Annual Report - " + year)
                .build();
    }
    
    public Map<String, Object> getDashboardFinancialStats(String schoolId) {
        Map<String, Object> stats = new HashMap<>();
        
        // Get current month stats
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        
        FinancialSummaryDTO currentMonthSummary = getFinancialSummary(
                schoolId, startOfMonth, today);
        
        // Get previous month stats
        LocalDate startOfPrevMonth = today.minusMonths(1).withDayOfMonth(1);
        LocalDate endOfPrevMonth = startOfMonth.minusDays(1);
        
        FinancialSummaryDTO prevMonthSummary = getFinancialSummary(
                schoolId, startOfPrevMonth, endOfPrevMonth);
        
        // Calculate percentage changes
        BigDecimal incomeChange = calculatePercentageChange(
                prevMonthSummary.getTotalIncome(), currentMonthSummary.getTotalIncome());
        
        BigDecimal expenseChange = calculatePercentageChange(
                prevMonthSummary.getTotalExpenses(), currentMonthSummary.getTotalExpenses());
        
        // Add stats to response
        stats.put("currentMonthSummary", currentMonthSummary);
        stats.put("prevMonthSummary", prevMonthSummary);
        stats.put("incomeChange", incomeChange);
        stats.put("expenseChange", expenseChange);
        
        // Get outstanding invoices count
        long outstandingInvoicesCount = invoiceRepository.findBySchoolIdAndStatus(schoolId, "UNPAID").size();
        stats.put("outstandingInvoicesCount", outstandingInvoicesCount);
        
        // Get recent transactions
        List<FinancialTransaction> recentTransactions = transactionRepository.findBySchoolId(schoolId)
                .stream()
                .sorted((t1, t2) -> t2.getCreatedAt().compareTo(t1.getCreatedAt()))
                .limit(5)
                .collect(Collectors.toList());
        
        stats.put("recentTransactions", recentTransactions);
        
        return stats;
    }
    
    private BigDecimal calculatePercentageChange(BigDecimal oldValue, BigDecimal newValue) {
        if (oldValue.equals(BigDecimal.ZERO)) {
            return newValue.equals(BigDecimal.ZERO) ? BigDecimal.ZERO : new BigDecimal(100);
        }
        
        return newValue.subtract(oldValue)
                .multiply(new BigDecimal(100))
                .divide(oldValue, 2, RoundingMode.HALF_UP);
    }
}
