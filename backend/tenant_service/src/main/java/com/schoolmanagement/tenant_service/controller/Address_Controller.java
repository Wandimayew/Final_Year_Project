package com.schoolmanagement.tenant_service.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.schoolmanagement.tenant_service.dto.AddressRequest;
import com.schoolmanagement.tenant_service.dto.AddressResponse;
import com.schoolmanagement.tenant_service.service.AddressService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/tenant/api")
@RequiredArgsConstructor
@Slf4j
public class Address_Controller {

    private final AddressService addressService;

    @PostMapping("{school_id}/addNewAddress")
    public ResponseEntity<AddressResponse> addNewAddress(@RequestBody AddressRequest addressRequest,
            @PathVariable Long school_id) {
        return addressService.addNewAddress(addressRequest, school_id);
    }

    @PutMapping("/{school_id}/editAddressById/{address_id}")
    public ResponseEntity<AddressResponse> editAddressById(@PathVariable Long school_id, @PathVariable Long address_id,
            @RequestBody AddressRequest addressRequest) {
        return addressService.editAddressById(addressRequest, school_id, address_id);
    }

    @GetMapping("/{school_id}/getAllAddressBySchool")
    public ResponseEntity<List<AddressResponse>> getAllAddressBySchool(@PathVariable Long school_id) {
        return addressService.getAllAddressesBySchoolId(school_id);
    }

    @GetMapping("/{school_id}/getAddressById/{address_id}")
    public ResponseEntity<AddressResponse> getAddressById(@PathVariable Long school_id, @PathVariable Long address_id) {
        return addressService.getAddressById(school_id, address_id);
    }

    @DeleteMapping("/{school_id}/deleteAddressById/{address_id}")
    public ResponseEntity<String> deleteSchoolById(@PathVariable Long school_id, @PathVariable Long address_id) {
        return addressService.deleteAddressById(school_id, address_id);
    }
}