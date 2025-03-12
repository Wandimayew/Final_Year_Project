package com.schoolmanagement.finance_service.service;

import com.schoolmanagement.finance_service.dto.FeeDTO;
import com.schoolmanagement.finance_service.dto.StudentFeeDTO;
import com.schoolmanagement.finance_service.mapper.FeeMapper;
import com.schoolmanagement.finance_service.mapper.StudentFeeMapper;
import com.schoolmanagement.finance_service.model.Fee;
import com.schoolmanagement.finance_service.model.StudentFee;
import com.schoolmanagement.finance_service.repository.FeeRepository;
import com.schoolmanagement.finance_service.repository.StudentFeeRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeeManagementService {
    
    private final FeeRepository feeRepository;
    private final StudentFeeRepository studentFeeRepository;
    
    public FeeDTO createFee(FeeDTO feeDTO) {
        Fee fee = FeeMapper.toEntity(feeDTO);
        fee.addFee();
        Fee savedFee = feeRepository.save(fee);
        return FeeMapper.toDTO(savedFee);
    }
    
    public FeeDTO updateFee(Long feeId, FeeDTO feeDTO) {
        Fee existingFee = feeRepository.findById(feeId)
                .orElseThrow(() -> new RuntimeException("Fee not found with id: " + feeId));
        
        FeeMapper.updateEntityFromDTO(feeDTO, existingFee);
        existingFee.updateFee();
        Fee updatedFee = feeRepository.save(existingFee);
        return FeeMapper.toDTO(updatedFee);
    }
    
    public void deleteFee(Long feeId) {
        Fee fee = feeRepository.findById(feeId)
                .orElseThrow(() -> new RuntimeException("Fee not found with id: " + feeId));
        fee.removeFee();
        feeRepository.save(fee);
    }
    
    public List<FeeDTO> getSchoolFees(String schoolId) {
        List<Fee> fees = feeRepository.findBySchoolIdAndIsActiveTrue(schoolId);
        return fees.stream()
                .map(FeeMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    public StudentFeeDTO assignFeeToStudent(StudentFeeDTO studentFeeDTO) {
        StudentFee studentFee = StudentFeeMapper.toEntity(studentFeeDTO);
        Fee fee = feeRepository.findById(studentFeeDTO.getFeeId())
                .orElseThrow(() -> new RuntimeException("Fee not found with id: " + studentFeeDTO.getFeeId()));
        
        studentFee.setFee(fee);
        studentFee.addStudentFee();
        studentFee.setRemainingAmount(studentFee.getAppliedAmount());
        studentFee.setPaidAmount(BigDecimal.ZERO);
        
        StudentFee savedStudentFee = studentFeeRepository.save(studentFee);
        return StudentFeeMapper.toDTO(savedStudentFee);
    }
    
    public List<StudentFeeDTO> getStudentFees(String studentId, String schoolId) {
        List<StudentFee> studentFees = studentFeeRepository.findByStudentIdAndSchoolId(studentId, schoolId);
        return studentFees.stream()
                .map(StudentFeeMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<StudentFeeDTO> getOutstandingFees(String schoolId) {
        List<StudentFee> outstandingFees = studentFeeRepository.findBySchoolIdAndStatus(schoolId, "PENDING");
        outstandingFees.addAll(studentFeeRepository.findBySchoolIdAndStatus(schoolId, "PARTIALLY_PAID"));
        
        return outstandingFees.stream()
                .map(StudentFeeMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public StudentFeeDTO updateStudentFeePayment(Long studentFeeId, BigDecimal paidAmount) {
        StudentFee studentFee = studentFeeRepository.findById(studentFeeId)
                .orElseThrow(() -> new RuntimeException("Student Fee not found with id: " + studentFeeId));
        
        // Update payment details
        BigDecimal totalPaid = studentFee.getPaidAmount().add(paidAmount);
        studentFee.setPaidAmount(totalPaid);
        studentFee.setLastPaymentDate(LocalDate.now());
        studentFee.calculateRemainingAmount();
        studentFee.updateStudentFee();
        
        StudentFee updatedStudentFee = studentFeeRepository.save(studentFee);
        return StudentFeeMapper.toDTO(updatedStudentFee);
    }
}
