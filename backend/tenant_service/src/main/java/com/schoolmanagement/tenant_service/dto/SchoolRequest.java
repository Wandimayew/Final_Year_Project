package com.schoolmanagement.tenant_service.dto;

import java.time.LocalDate;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import lombok.Data;

@Data
public class SchoolRequest {
    private String school_name;

    @Valid
    private String addresses;

    private String contact_number;

    private String email_address;

    private String school_type;
 
    private LocalDate establishment_date;
    
    private String school_information;
    
    private MultipartFile logo;

}
