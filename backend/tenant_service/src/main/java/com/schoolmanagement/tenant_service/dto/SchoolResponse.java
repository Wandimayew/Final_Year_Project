package com.schoolmanagement.tenant_service.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class SchoolResponse {
    private Long school_id;

    private String school_name;

    private List<AddressResponse> addresses;

    private String contact_number;

    private String email_address;

    private String school_type;
 
    private LocalDate establishment_date;
    private String school_information;

    private boolean isActive;

    private String status;
    
    private LocalDateTime created_at;

    private LocalDateTime updated_at;

    private String created_by;

    private byte[] logo;

}
