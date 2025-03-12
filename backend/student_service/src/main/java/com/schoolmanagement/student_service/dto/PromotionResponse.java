package com.schoolmanagement.student_service.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class PromotionResponse {

    private Long id;
    private Long studentId;
    private Long schoolId;
    private Long previousClassId;
    private Long newClassId;
    private LocalDate promotionDate;
    private String remark;
    private String registNo;
}