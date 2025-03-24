package com.schoolmanagement.finance_service.mapper;

import com.schoolmanagement.finance_service.dto.FeeDTO;
import com.schoolmanagement.finance_service.model.Fee;
import com.schoolmanagement.finance_service.model.Fee.FeeType;
import com.schoolmanagement.finance_service.model.Fee.Frequency;

public class FeeMapper {

    public static Fee toEntity(FeeDTO feeDTO) {
        Fee fee = new Fee();
        fee.setFeeId(feeDTO.getFeeId());
        fee.setSchoolId(feeDTO.getSchoolId());
        fee.setFeeCode(feeDTO.getFeeCode());
        fee.setFeeName(feeDTO.getFeeName());
        fee.setAmount(feeDTO.getAmount());
        fee.setDueDate(feeDTO.getDueDate());
        fee.setActive(feeDTO.isActive());
        
        // Convert string to enum
        fee.setFeeType(FeeType.valueOf(feeDTO.getFeeType().toUpperCase()));
        fee.setFrequency(Frequency.valueOf(feeDTO.getFrequency().toUpperCase()));
        
        return fee;
    }

    public static FeeDTO toDTO(Fee fee) {
        FeeDTO feeDTO = new FeeDTO();
        feeDTO.setFeeId(fee.getFeeId());
        feeDTO.setSchoolId(fee.getSchoolId());
        feeDTO.setFeeCode(fee.getFeeCode());
        feeDTO.setFeeName(fee.getFeeName());
        feeDTO.setAmount(fee.getAmount());
        feeDTO.setDueDate(fee.getDueDate());
        feeDTO.setActive(fee.isActive());
        
        // Convert enum to string
        feeDTO.setFeeType(fee.getFeeType().name());
        feeDTO.setFrequency(fee.getFrequency().name());
        
        return feeDTO;
    }

    public static void updateEntityFromDTO(FeeDTO feeDTO, Fee existingFee) {
        if (feeDTO.getSchoolId() != null) existingFee.setSchoolId(feeDTO.getSchoolId());
        if (feeDTO.getFeeCode() != null) existingFee.setFeeCode(feeDTO.getFeeCode());
        if (feeDTO.getFeeName() != null) existingFee.setFeeName(feeDTO.getFeeName());
        if (feeDTO.getAmount() != null) existingFee.setAmount(feeDTO.getAmount());
        if (feeDTO.getDueDate() != null) existingFee.setDueDate(feeDTO.getDueDate());
        existingFee.setActive(feeDTO.isActive());
        
        if (feeDTO.getFeeType() != null) {
            existingFee.setFeeType(FeeType.valueOf(feeDTO.getFeeType().toUpperCase()));
        }
        if (feeDTO.getFrequency() != null) {
            existingFee.setFrequency(Frequency.valueOf(feeDTO.getFrequency().toUpperCase()));
        }
    }
}

