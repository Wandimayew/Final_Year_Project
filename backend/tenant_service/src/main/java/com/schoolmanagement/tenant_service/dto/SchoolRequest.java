package com.schoolmanagement.tenant_service.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.schoolmanagement.tenant_service.model.Address;

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

    private MultipartFile logo;
}
