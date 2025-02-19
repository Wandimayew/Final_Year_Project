package com.schoolmanagement.student_service.mapper;

import com.schoolmanagement.student_service.dto.ParentGuardianRequest;
import com.schoolmanagement.student_service.dto.ParentGuardianResponse;
import com.schoolmanagement.student_service.model.ParentGuardian;

public class ParentGuardianMapper {

    public static ParentGuardian toEntity(ParentGuardianRequest request) {
        ParentGuardian parentGuardian = new ParentGuardian();
        parentGuardian.setSchoolId(request.getSchoolId());
        parentGuardian.setFatherName(request.getFatherName());
        parentGuardian.setMotherName(request.getMotherName());
        parentGuardian.setOtherFamilyMemberName(request.getOtherFamilyMemberName());
        parentGuardian.setRelation(request.getRelation());
        parentGuardian.setEmail(request.getEmail());
        parentGuardian.setAddress(request.getAddress());
        parentGuardian.setPhoneNumber(request.getPhoneNumber());
        return parentGuardian;
    }

    public static ParentGuardianResponse toResponse(ParentGuardian parentGuardian) {
        ParentGuardianResponse response = new ParentGuardianResponse();
        response.setParentId(parentGuardian.getParentId());
        response.setSchoolId(parentGuardian.getSchoolId());
        response.setFatherName(parentGuardian.getFatherName());
        response.setMotherName(parentGuardian.getMotherName());
        response.setOtherFamilyMemberName(parentGuardian.getOtherFamilyMemberName());
        response.setRelation(parentGuardian.getRelation());
        response.setEmail(parentGuardian.getEmail());
        response.setAddress(parentGuardian.getAddress());
        response.setPhoneNumber(parentGuardian.getPhoneNumber());
        return response;
    }
}