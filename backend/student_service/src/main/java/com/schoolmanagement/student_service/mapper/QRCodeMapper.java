package com.schoolmanagement.student_service.mapper;

import com.schoolmanagement.student_service.dto.QRCodeRequest;
import com.schoolmanagement.student_service.dto.QRCodeResponse;
import com.schoolmanagement.student_service.model.QRCode;

public class QRCodeMapper {

    public static QRCode toEntity(QRCodeRequest request) {
        QRCode qrCode = new QRCode();
        // qrCode.setSchoolId(request.getSchoolId());
        qrCode.setClassId(request.getClassId());
        qrCode.setSectionId(request.getSectionId());
        // qrCode.setGeneratedTime(request.getGeneratedTime());
        qrCode.setExpiryTime(request.getExpiryTime());
        // qrCode.setSessionToken(request.getSessionToken());
        // qrCode.setGeneratedBy(request.getGeneratedBy());
        // qrCode.setQrCodePath(request.getQrCodePath());
        qrCode.setStatus(request.getStatus());
        return qrCode;
    }

    public static QRCodeResponse toResponse(QRCode qrCode) {
        QRCodeResponse response = new QRCodeResponse();
        response.setQrCodeId(qrCode.getQrCodeId());
        response.setSchoolId(qrCode.getSchoolId());
        response.setClassId(qrCode.getClassId());
        response.setSectionId(qrCode.getSectionId());
        response.setGeneratedTime(qrCode.getGeneratedTime());
        response.setExpiryTime(qrCode.getExpiryTime());
        response.setSessionToken(qrCode.getSessionToken());
        response.setGeneratedBy(qrCode.getGeneratedBy());
        response.setQrCodePath(qrCode.getQrCodePath());
        response.setStatus(qrCode.getStatus());
        return response;
    }
}