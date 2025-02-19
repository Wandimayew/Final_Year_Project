package com.schoolmanagement.student_service.mapper;

import com.schoolmanagement.student_service.dto.PromotionRequest;
import com.schoolmanagement.student_service.dto.PromotionResponse;
import com.schoolmanagement.student_service.model.Promotion;
import com.schoolmanagement.student_service.model.Student;

public class PromotionMapper {

    public static Promotion toEntity(PromotionRequest request) {
        Promotion promotion = new Promotion();
        promotion.setSchoolId(request.getSchoolId());
        promotion.setPreviousClassId(request.getPreviousClassId());
        promotion.setNewClassId(request.getNewClassId());
        promotion.setPromotionDate(request.getPromotionDate());
        promotion.setRemark(request.getRemark());

        // Set the student (assuming you have a Student entity)
        Student student = new Student();
        student.setStudentId(request.getStudentId());
        promotion.setStudent(student);

        return promotion;
    }

    public static PromotionResponse toResponse(Promotion promotion) {
        PromotionResponse response = new PromotionResponse();
        response.setId(promotion.getId());
        response.setSchoolId(promotion.getSchoolId());
        response.setPreviousClassId(promotion.getPreviousClassId());
        response.setNewClassId(promotion.getNewClassId());
        response.setPromotionDate(promotion.getPromotionDate());
        response.setRemark(promotion.getRemark());
        response.setStudentId(promotion.getStudent() != null ? promotion.getStudent().getStudentId() : null);
        return response;
    }
}