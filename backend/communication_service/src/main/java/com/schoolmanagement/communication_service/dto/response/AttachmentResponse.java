package com.schoolmanagement.communication_service.dto.response;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AttachmentResponse {

    private String attachmentId;
    private String schoolId;
    private String fileName;
    private String filePath;
    private String fileType;
    private Long fileSize;
    private Boolean isActive;

}