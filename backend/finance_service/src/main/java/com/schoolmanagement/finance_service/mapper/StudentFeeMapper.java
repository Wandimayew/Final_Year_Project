package com.schoolmanagement.finance_service.mapper;

import java.math.BigDecimal;

import com.schoolmanagement.finance_service.dto.StudentFeeDTO;
import com.schoolmanagement.finance_service.model.StudentFee;
import com.schoolmanagement.finance_service.model.Fee;

public class StudentFeeMapper {

    public static StudentFee toEntity(StudentFeeDTO dto) {
        StudentFee studentFee = new StudentFee();
        studentFee.setStudentFeeId(dto.getStudentFeeId());
        studentFee.setSchoolId(dto.getSchoolId());
        studentFee.setStudentId(dto.getStudentId());
        studentFee.setAppliedAmount(dto.getAppliedAmount());
        studentFee.setPaidAmount(dto.getPaidAmount() != null ? dto.getPaidAmount() : BigDecimal.ZERO);
        studentFee.setRemainingAmount(dto.getRemainingAmount());
        studentFee.setStatus(dto.getStatus());
        studentFee.setLastPaymentDate(dto.getLastPaymentDate());
        studentFee.setActive(dto.isActive());
        
        Fee fee = new Fee();
        fee.setFeeId(dto.getFeeId());
        fee.setFeeName(dto.getFeeName());
        studentFee.setFee(fee);
        
        return studentFee;
    }

    public static StudentFeeDTO toDTO(StudentFee studentFee) {
        StudentFeeDTO dto = new StudentFeeDTO();
        dto.setStudentFeeId(studentFee.getStudentFeeId());
        dto.setSchoolId(studentFee.getSchoolId());
        dto.setStudentId(studentFee.getStudentId());
        dto.setAppliedAmount(studentFee.getAppliedAmount());
        dto.setPaidAmount(studentFee.getPaidAmount());
        dto.setRemainingAmount(studentFee.getRemainingAmount());
        dto.setStatus(studentFee.getStatus());
        dto.setLastPaymentDate(studentFee.getLastPaymentDate());
        dto.setActive(studentFee.isActive());
        
        if (studentFee.getFee() != null) {
            dto.setFeeId(studentFee.getFee().getFeeId());
            dto.setFeeName(studentFee.getFee().getFeeName());
        }
        
        return dto;
    }

    public static void updateEntityFromDTO(StudentFeeDTO dto, StudentFee existingStudentFee) {
        if (dto.getSchoolId() != null) existingStudentFee.setSchoolId(dto.getSchoolId());
        if (dto.getStudentId() != null) existingStudentFee.setStudentId(dto.getStudentId());
        if (dto.getAppliedAmount() != null) existingStudentFee.setAppliedAmount(dto.getAppliedAmount());
        if (dto.getPaidAmount() != null) existingStudentFee.setPaidAmount(dto.getPaidAmount());
        if (dto.getRemainingAmount() != null) existingStudentFee.setRemainingAmount(dto.getRemainingAmount());
        if (dto.getStatus() != null) existingStudentFee.setStatus(dto.getStatus());
        if (dto.getLastPaymentDate() != null) existingStudentFee.setLastPaymentDate(dto.getLastPaymentDate());
        existingStudentFee.setActive(dto.isActive());
        
        if (dto.getFeeId() != null) {
            Fee fee = new Fee();
            fee.setFeeId(dto.getFeeId());
            existingStudentFee.setFee(fee);
        }
    }
}
