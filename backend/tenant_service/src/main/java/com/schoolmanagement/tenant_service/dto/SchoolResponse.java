package com.schoolmanagement.tenant_service.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.schoolmanagement.tenant_service.model.Address;
import com.schoolmanagement.tenant_service.model.School_subscriptions;

import jakarta.persistence.Column;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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

    private boolean isActive;

    private String status;

    private LocalDateTime created_at;

    private LocalDateTime updated_at;

    private String created_by;

    private byte[] logo;

}
