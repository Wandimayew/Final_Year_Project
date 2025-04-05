package com.schoolmanagement.tenant_service.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;

@Builder
@Data
@Getter
public class AddressResponse {
    private Long address_id;

    private String address_line;

    private String city;

    private String country;

    private String zone;

    private String region;

    private LocalDateTime created_at;

    private LocalDateTime updated_at;

    private String created_by;

    private boolean isActive;

    private String school_id;
}
