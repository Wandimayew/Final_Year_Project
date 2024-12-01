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


    public ResponseEntity<AddressResponse> addNewAddress(AddressRequest addressRequest, Long school_id){
        School school=schoolRepository.findBySchool_id(school_id);
        if(school == null){
            log.error("School not found with id {}", school_id);
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
        return ResponseEntity.ok(convertToAddressResponse(savedAddress));
// LocalDateTime.now()
        
    }

    public ResponseEntity<AddressResponse> editAddressById(AddressRequest addressRequest,Long school_id,Long address_id){
        School schoolExists=schoolRepository.findBySchool_id(school_id);
        if(schoolExists == null){
            log.error("School not found with id {}", school_id);
            return ResponseEntity.notFound().build();
        }
        Address addressExists=addressRepository.findBySchoolAndAddressId(schoolExists, address_id);
        if(addressExists == null){
            log.error("Address not found with id {}", address_id);
            return ResponseEntity.notFound().build();
        }
        addressExists.setAddress_line(addressRequest.getAddress_line());
        addressExists.setCity(addressRequest.getCity());
        addressExists.setCountry(addressRequest.getCountry());
        addressExists.setRegion(addressRequest.getRegion());
        addressExists.setUpdated_at(LocalDateTime.now());
        addressExists.setZone(addressRequest.getZone());
        addressExists.setCreated_by("admin");

        Address savedAddress=addressRepository.save(addressExists);

        return ResponseEntity.ok(convertToAddressResponse(savedAddress));
    }

    public ResponseEntity<String> deleteAddressById(Long school_id, Long address_id){
        School schoolExists=schoolRepository.findBySchool_id(school_id);
        if(schoolExists == null){
            log.error("School not found with id {}", school_id);
            return ResponseEntity.notFound().build();
        }
        Address addressExists=addressRepository.findBySchoolAndAddressId(schoolExists, address_id);
        if(addressExists == null){
            log.error("Address not found with id {}", address_id);
            return ResponseEntity.notFound().build();
        }

        addressExists.setActive(false);

        addressRepository.save(addressExists);
        return ResponseEntity.ok("Address with id "+ address_id + " deleted successfully.");
    }
    
    public ResponseEntity<AddressResponse> getAddressById(Long school_id, Long address_id){
        School schoolExists=schoolRepository.findBySchool_id(school_id);
        if(schoolExists == null){
            log.error("School not found with id {}", school_id);
            return ResponseEntity.notFound().build();
        }
        Address addressExists=addressRepository.findBySchoolAndAddressId(schoolExists, address_id);
        if(addressExists == null){
            log.error("Address not found with id {}", address_id);
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(convertToAddressResponse(addressExists));
    }
  
    public ResponseEntity<List<AddressResponse>> getAllAddressesBySchoolId(Long school_id){
        School schoolExists=schoolRepository.findBySchool_id(school_id);
        if(schoolExists == null){
            log.error("School not found with id {}", school_id);
            return ResponseEntity.notFound().build();
        }
        List<Address> addresses=addressRepository.findAllSchoolAddressThatIsActive(schoolExists);

        return ResponseEntity.ok(addresses.stream().map(this::convertToAddressResponse).collect(Collectors.toList()));
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
