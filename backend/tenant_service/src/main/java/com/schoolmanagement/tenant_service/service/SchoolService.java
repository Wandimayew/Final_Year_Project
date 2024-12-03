package com.schoolmanagement.tenant_service.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.schoolmanagement.tenant_service.dto.AddressResponse;
import com.schoolmanagement.tenant_service.dto.SchoolRequest;
import com.schoolmanagement.tenant_service.dto.SchoolResponse;
import com.schoolmanagement.tenant_service.file.FileStorageService;
import com.schoolmanagement.tenant_service.file.FileUtils;
import com.schoolmanagement.tenant_service.model.Address;
import com.schoolmanagement.tenant_service.model.School;
import com.schoolmanagement.tenant_service.repository.AddressRepository;
import com.schoolmanagement.tenant_service.repository.SchoolRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class SchoolService {

    private final SchoolRepository schoolRepository;
    private final FileStorageService fileStorageService;
    private final AddressRepository addressRepository;
    private final ObjectMapper objectMapper;

    public ResponseEntity<SchoolResponse> addNewSchool(SchoolRequest schoolRequest) {

        School school = new School();

        school.setContact_number(schoolRequest.getContact_number());
        school.setSchool_name(schoolRequest.getSchool_name());
        school.setEmail_address(schoolRequest.getEmail_address());
        school.setSchool_type(schoolRequest.getSchool_type());
        school.setCreated_at(LocalDateTime.now());
        school.setEstablishment_date(LocalDate.now());
        school.setSchool_information(schoolRequest.getSchool_information());
        school.setStatus("Paid");
        school.setActive(true);
        school.setCreated_by("admin");
        school.setUpdated_at(LocalDateTime.now());
        // school.setAddresses(new ArrayList<>());

        // Deserialize addresses from JSON and assign to the school
        try {
            List<Address> addressList = objectMapper.readValue(schoolRequest.getAddresses(),
                    new TypeReference<List<Address>>() {
                    });

            // Set the school for each address before saving
            for (Address address : addressList) {
                address.setSchool(school);
                address.setUpdated_at(LocalDateTime.now()); // Set the current school for each address
                address.setCreated_at(LocalDateTime.now());
                address.setCreated_by("admin");
                address.setActive(true);
            }

            // Assign the list of addresses to the school
            school.setAddresses(addressList);
        } catch (Exception e) {
            log.error("Error deserializing addresses", e);
            return ResponseEntity.badRequest().body(null); // You can handle this error as needed
        }

        // Save the school (which will also save addresses due to cascading)
        School savedSchool = schoolRepository.save(school);
        uploadSchoolLogo(schoolRequest.getLogo(), savedSchool.getSchool_id());

        // Save the addresses
        // saveAddresses(schoolRequest.getAddresses(), savedSchool);

        return ResponseEntity.ok(convertToSchoolResponse(savedSchool));
    }

    public ResponseEntity<SchoolResponse> editSchoolById(SchoolRequest schoolRequest, Long school_id) {
        School existingSchool = schoolRepository.findBySchool_id(school_id);
        if (existingSchool == null) {
            log.error("School not found with id {}", school_id);
            return ResponseEntity.notFound().build();
        }

        existingSchool.setContact_number(schoolRequest.getContact_number());
        existingSchool.setSchool_name(schoolRequest.getSchool_name());
        existingSchool.setEmail_address(schoolRequest.getEmail_address());
        existingSchool.setSchool_type(schoolRequest.getSchool_type());
        existingSchool.setEstablishment_date(LocalDate.now());
        existingSchool.setStatus("Paid");
        existingSchool.setCreated_by("admin");
        existingSchool.setUpdated_at(LocalDateTime.now());
        existingSchool.setSchool_information(schoolRequest.getSchool_information());

        if (schoolRequest.getLogo() != null) {
            uploadSchoolLogo(schoolRequest.getLogo(), existingSchool.getSchool_id());
        }

        School updatedSchool = schoolRepository.save(existingSchool);
        return ResponseEntity.ok(convertToSchoolResponse(updatedSchool));
    }

    public ResponseEntity<SchoolResponse> getSchoolById(Long school_id) {
        School existingSchool = schoolRepository.findBySchool_id(school_id);
        if (existingSchool == null) {
            log.error("School not found with id {}", school_id);
            return ResponseEntity.notFound().build();
        }
        // Filter active addresses
        List<Address> activeAddresses = existingSchool.getAddresses()
                .stream()
                .filter(Address::isActive)
                .toList(); // Java 16+ or use `collect(Collectors.toList())` for older versions
        existingSchool.setAddresses(activeAddresses);

        return ResponseEntity.ok(convertToSchoolResponse(existingSchool));
    }

    public ResponseEntity<List<SchoolResponse>> getAllSchools() {
        List<School> allSchools = schoolRepository.findAllSchoolThatIsActive();
        if (allSchools.isEmpty()) {
            log.error("No school found in the database");
            return ResponseEntity.notFound().build();
        }

        // Filter active addresses for each school
        List<SchoolResponse> schoolResponses = allSchools.stream()
                .peek(school -> {
                    List<Address> activeAddresses = school.getAddresses()
                            .stream()
                            .filter(Address::isActive)
                            .toList(); // Java 16+ or use `collect(Collectors.toList())` for older versions
                    school.setAddresses(activeAddresses);
                })
                .map(this::convertToSchoolResponse)
                .toList();
        return ResponseEntity.ok(schoolResponses);
    }

    public ResponseEntity<List<SchoolResponse>> getAllSchoolsNotActive() {
        List<School> allSchoolsNotActive = schoolRepository.findAllSchoolThatIsNotActive();
        if (allSchoolsNotActive.isEmpty()) {
            log.error("No school found in the database");
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(allSchoolsNotActive.stream().map(this::convertToSchoolResponse).toList());
    }

    public ResponseEntity<String> deleteSchoolById(Long school_id) {
        School existingSchool = schoolRepository.findBySchool_id(school_id);
        if (existingSchool == null) {
            log.error("School not found with id {}", school_id);
            return ResponseEntity.notFound().build();
        }

        existingSchool.setActive(false);

        School deletedSchool = schoolRepository.save(existingSchool);
        return ResponseEntity.ok("school with id " + deletedSchool.getSchool_id() + " deleted successfully.");
    }

    private void saveAddresses(List<Address> addresses, School school) {
        if (addresses != null && !addresses.isEmpty()) {
            addresses.forEach(address -> {
                address.setSchool(school); // Associate the address with the saved school
                address.setCreated_at(LocalDateTime.now());
                address.setCreated_by("admin");
                address.setActive(true);
                addressRepository.save(address); // Save the address
            });
        }
    }

    public void uploadSchoolLogo(MultipartFile file, Long school_id) {
        School school = schoolRepository.findById(school_id)
                .orElseThrow(() -> new EntityNotFoundException("No school found with ID:: " + school_id));
        var logo = fileStorageService.saveFile(file, school_id);
        school.setLogo(logo);
        schoolRepository.save(school);
    }

    private SchoolResponse convertToSchoolResponse(School school) {

        List<AddressResponse> addressResponses = school.getAddresses().stream()
                .map(address -> AddressResponse.builder()
                        .address_id(address.getAddress_id())
                        .address_line(address.getAddress_line())
                        .city(address.getCity())
                        .country(address.getCountry())
                        .region(address.getRegion())
                        .zone(address.getZone())
                        .created_at(address.getCreated_at())
                        .created_by(address.getCreated_by())
                        .school_id(school.getSchool_id())
                        .isActive(address.isActive())
                        .build())
                .collect(Collectors.toList());

        return SchoolResponse.builder()
                .school_id(school.getSchool_id())
                .contact_number(school.getContact_number())
                .created_at(school.getCreated_at())
                .status(school.getStatus())
                .email_address(school.getEmail_address())
                .school_name(school.getSchool_name())
                .school_type(school.getSchool_type())
                .establishment_date(school.getEstablishment_date())
                .school_information(school.getSchool_information())
                .isActive(school.isActive())
                .addresses(addressResponses)
                .logo(FileUtils.readFileFromLocation(school.getLogo()))
                .created_by(school.getCreated_by())
                .build();
    }
}
