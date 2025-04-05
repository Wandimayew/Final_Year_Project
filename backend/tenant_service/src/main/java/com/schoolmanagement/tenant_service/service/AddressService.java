package com.schoolmanagement.tenant_service.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.schoolmanagement.tenant_service.dto.AddressRequest;
import com.schoolmanagement.tenant_service.dto.AddressResponse;
import com.schoolmanagement.tenant_service.model.Address;
import com.schoolmanagement.tenant_service.model.School;
import com.schoolmanagement.tenant_service.repository.AddressRepository;
import com.schoolmanagement.tenant_service.repository.SchoolRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final SchoolRepository schoolRepository;

    public ResponseEntity<AddressResponse> addNewAddress(AddressRequest addressRequest, String schoolId) {
        School school = schoolRepository.findBySchool_id(schoolId);
        if (school == null) {
            log.error("School not found with id {}", schoolId);
            return ResponseEntity.notFound().build();
        }

        Address newAddress = new Address();
        newAddress.setAddress_line(addressRequest.getAddress_line());
        newAddress.setCity(addressRequest.getCity());
        newAddress.setRegion(addressRequest.getRegion());
        newAddress.setCountry(addressRequest.getCountry());
        newAddress.setSchool(school);
        newAddress.setZone(addressRequest.getZone());
        newAddress.setCreated_at(LocalDateTime.now());
        newAddress.setCreated_by("Admin");
        newAddress.setActive(true);
        newAddress.setUpdated_at(LocalDateTime.now());

        Address savedAddress = addressRepository.save(newAddress);
        log.info("New address added for school {} with ID: {}", schoolId, savedAddress.getAddress_id());
        return ResponseEntity.ok(convertToAddressResponse(savedAddress));
    }

    public ResponseEntity<AddressResponse> editAddressById(AddressRequest addressRequest, String schoolId,
            Long addressId) {
        School school = schoolRepository.findBySchool_id(schoolId);
        if (school == null) {
            log.error("School not found with id {}", schoolId);
            return ResponseEntity.notFound().build();
        }

        Address existingAddress = addressRepository.findBySchoolAndAddressId(school, addressId);
        if (existingAddress == null) {
            log.error("Address not found with id {} for school {}", addressId, schoolId);
            return ResponseEntity.notFound().build();
        }

        // Update only provided fields, preserving existing values if not specified
        if (addressRequest.getAddress_line() != null) {
            existingAddress.setAddress_line(addressRequest.getAddress_line());
        }
        if (addressRequest.getCity() != null) {
            existingAddress.setCity(addressRequest.getCity());
        }
        if (addressRequest.getCountry() != null) {
            existingAddress.setCountry(addressRequest.getCountry());
        }
        if (addressRequest.getRegion() != null) {
            existingAddress.setRegion(addressRequest.getRegion());
        }
        if (addressRequest.getZone() != null) {
            existingAddress.setZone(addressRequest.getZone());
        }
        existingAddress.setUpdated_at(LocalDateTime.now());
        existingAddress.setCreated_by("admin"); // Consider if this should change on update

        Address savedAddress = addressRepository.save(existingAddress);
        log.info("Address updated for school {} with ID: {}", schoolId, addressId);
        return ResponseEntity.ok(convertToAddressResponse(savedAddress));
    }

    public ResponseEntity<String> deleteAddressById(String schoolId, Long addressId) {
        School school = schoolRepository.findBySchool_id(schoolId);
        if (school == null) {
            log.error("School not found with id {}", schoolId);
            return ResponseEntity.notFound().build();
        }

        Address existingAddress = addressRepository.findBySchoolAndAddressId(school, addressId);
        if (existingAddress == null) {
            log.error("Address not found with id {} for school {}", addressId, schoolId);
            return ResponseEntity.notFound().build();
        }

        existingAddress.setActive(false);
        addressRepository.save(existingAddress);
        log.info("Address with ID {} for school {} marked as inactive", addressId, schoolId);
        return ResponseEntity.ok("Address with id " + addressId + " deleted successfully.");
    }

    public ResponseEntity<AddressResponse> getAddressById(String schoolId, Long addressId) {
        School school = schoolRepository.findBySchool_id(schoolId);
        if (school == null) {
            log.error("School not found with id {}", schoolId);
            return ResponseEntity.notFound().build();
        }

        Address existingAddress = addressRepository.findBySchoolAndAddressId(school, addressId);
        if (existingAddress == null) {
            log.error("Address not found with id {} for school {}", addressId, schoolId);
            return ResponseEntity.notFound().build();
        }

        log.info("Fetched address with ID {} for school {}", addressId, schoolId);
        return ResponseEntity.ok(convertToAddressResponse(existingAddress));
    }

    public ResponseEntity<List<AddressResponse>> getAllAddressesBySchoolId(String schoolId) {
        School school = schoolRepository.findBySchool_id(schoolId);
        if (school == null) {
            log.error("School not found with id {}", schoolId);
            return ResponseEntity.notFound().build();
        }

        List<Address> addresses = addressRepository.findAllSchoolAddressThatIsActive(school);
        log.info("Fetched {} active addresses for school {}", addresses.size(), schoolId);
        return ResponseEntity.ok(addresses.stream()
                .map(this::convertToAddressResponse)
                .collect(Collectors.toList()));
    }

    private AddressResponse convertToAddressResponse(Address address) {
        return AddressResponse.builder()
                .address_id(address.getAddress_id())
                .address_line(address.getAddress_line())
                .city(address.getCity())
                .region(address.getRegion())
                .country(address.getCountry())
                .zone(address.getZone())
                .updated_at(address.getUpdated_at())
                .created_by(address.getCreated_by())
                .created_at(address.getCreated_at())
                .school_id(address.getSchool().getSchool_id())
                .isActive(address.isActive())
                .build();
    }
}