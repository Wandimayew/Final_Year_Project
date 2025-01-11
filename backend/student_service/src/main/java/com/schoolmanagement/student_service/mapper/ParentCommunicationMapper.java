package com.schoolmanagement.student_service.mapper;

import com.schoolmanagement.student_service.dto.ParentCommunicationRequest;
import com.schoolmanagement.student_service.dto.ParentCommunicationResponse;
import com.schoolmanagement.student_service.model.ParentCommunication;
import com.schoolmanagement.student_service.model.ParentGuardian;

public class ParentCommunicationMapper {

    public static ParentCommunication toEntity(ParentCommunicationRequest request) {
        ParentCommunication parentCommunication = new ParentCommunication();
        parentCommunication.setSchoolId(request.getSchoolId());
        parentCommunication.setSentAt(request.getSentAt());
        parentCommunication.setMessage(request.getMessage());

        // Set the parent (assuming you have a ParentGuardian entity)
        ParentGuardian parentGuardian = new ParentGuardian();
        parentGuardian.setParentId(request.getParentId());
        parentCommunication.setParentGuardian(parentGuardian);

        return parentCommunication;
    }

    public static ParentCommunicationResponse toResponse(ParentCommunication parentCommunication) {
        ParentCommunicationResponse response = new ParentCommunicationResponse();
        response.setId(parentCommunication.getId());
        response.setSchoolId(parentCommunication.getSchoolId());
        response.setSentAt(parentCommunication.getSentAt());
        response.setMessage(parentCommunication.getMessage());
        response.setParentId(parentCommunication.getParentGuardian() != null ? parentCommunication.getParentGuardian().getParentId() : null);
        return response;
    }
}