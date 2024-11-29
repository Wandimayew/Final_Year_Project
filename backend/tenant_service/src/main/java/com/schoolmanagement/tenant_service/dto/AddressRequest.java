package com.schoolmanagement.tenant_service.dto;

import lombok.Data;

@Data
public class AddressRequest {
    
    private String address_line;

    private String city;

    private String country;

    private String zone;

    private String region;

}
