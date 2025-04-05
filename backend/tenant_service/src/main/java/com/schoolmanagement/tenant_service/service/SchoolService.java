package com.schoolmanagement.tenant_service.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.schoolmanagement.tenant_service.dto.AddressResponse;
import com.schoolmanagement.tenant_service.dto.SchoolRequest;
import com.schoolmanagement.tenant_service.dto.SchoolResponse;
import com.schoolmanagement.tenant_service.dto.SchoolStatsDTO;
import com.schoolmanagement.tenant_service.file.FileStorageService;
import com.schoolmanagement.tenant_service.file.FileUtils;
import com.schoolmanagement.tenant_service.model.Address;
import com.schoolmanagement.tenant_service.model.School;
import com.schoolmanagement.tenant_service.repository.SchoolRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class SchoolService {

    private final SchoolRepository schoolRepository;
    private final FileStorageService fileStorageService;
    private final ObjectMapper objectMapper;

    public ResponseEntity<SchoolResponse> addNewSchool(SchoolRequest schoolRequest) {
        String schoolId = generateSchoolId(schoolRequest.getSchool_name());
        School school = new School();

        school.setSchool_id(schoolId);
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

        try {
            if (schoolRequest.getAddresses() != null && !schoolRequest.getAddresses().isEmpty()) {
                List<Address> addressList = objectMapper.readValue(schoolRequest.getAddresses(),
                        new TypeReference<List<Address>>() {
                        });
                for (Address address : addressList) {
                    address.setSchool(school);
                    address.setUpdated_at(LocalDateTime.now());
                    address.setCreated_at(LocalDateTime.now());
                    address.setCreated_by("admin");
                    address.setActive(true);
                }
                school.setAddresses(addressList);
            }
        } catch (Exception e) {
            log.error("Error deserializing addresses for school {}", schoolId, e);
            return ResponseEntity.badRequest().body(null);
        }

        School savedSchool = schoolRepository.save(school);
        if (schoolRequest.getLogo() != null) {
            uploadSchoolLogo(schoolRequest.getLogo(), savedSchool.getSchool_id());
        }
        log.info("New school added with ID: {}", schoolId);
        return ResponseEntity.ok(convertToSchoolResponse(savedSchool));
    }

    public ResponseEntity<SchoolResponse> editSchoolById(SchoolRequest schoolRequest, String schoolId) {
        School existingSchool = schoolRepository.findById(schoolId)
                .orElseThrow(() -> {
                    log.error("School not found with id {}", schoolId);
                    return new EntityNotFoundException("School not found with ID: " + schoolId);
                });

        // Update only the fields provided in the request
        if (schoolRequest.getSchool_name() != null) {
            existingSchool.setSchool_name(schoolRequest.getSchool_name());
        }
        if (schoolRequest.getContact_number() != null) {
            existingSchool.setContact_number(schoolRequest.getContact_number());
        }
        if (schoolRequest.getEmail_address() != null) {
            existingSchool.setEmail_address(schoolRequest.getEmail_address());
        }
        if (schoolRequest.getSchool_type() != null) {
            existingSchool.setSchool_type(schoolRequest.getSchool_type());
        }
        if (schoolRequest.getSchool_information() != null) {
            existingSchool.setSchool_information(schoolRequest.getSchool_information());
        }
        // Optionally update establishment_date if it makes sense in your context
        // existingSchool.setEstablishment_date(LocalDate.now());
        existingSchool.setUpdated_at(LocalDateTime.now());

        // Optional: Handle address updates if provided

        if (schoolRequest.getAddresses() != null &&
                !schoolRequest.getAddresses().isEmpty()) {
            try {
                List<Address> addressList = objectMapper.readValue(schoolRequest.getAddresses(),
                        new TypeReference<List<Address>>() {
                        });
                for (Address address : addressList) {
                    address.setSchool(existingSchool);
                    address.setUpdated_at(LocalDateTime.now());
                    address.setCreated_by("admin");
                    address.setActive(true);
                }
                existingSchool.setAddresses(addressList);
            } catch (Exception e) {
                log.error("Error deserializing addresses for school update {}", schoolId, e);
                return ResponseEntity.badRequest().body(null);
            }
        }

        if (schoolRequest.getLogo() != null) {
            uploadSchoolLogo(schoolRequest.getLogo(), existingSchool.getSchool_id());
        }

        School updatedSchool = schoolRepository.save(existingSchool);
        log.info("School updated with ID: {}", schoolId);
        return ResponseEntity.ok(convertToSchoolResponse(updatedSchool));
    }

    public ResponseEntity<SchoolResponse> getSchoolById(String schoolId) {
        School existingSchool = schoolRepository.findBySchool_id(schoolId);
        if (existingSchool == null) {
            log.error("School not found with id {}", schoolId);
            return ResponseEntity.notFound().build();
        }
        List<Address> activeAddresses = existingSchool.getAddresses()
                .stream()
                .filter(Address::isActive)
                .toList();
        existingSchool.setAddresses(activeAddresses);
        log.info("Fetched school with ID: {}", schoolId);
        return ResponseEntity.ok(convertToSchoolResponse(existingSchool));
    }

    public ResponseEntity<List<SchoolResponse>> getAllSchools() {
        List<School> allSchools = schoolRepository.findAllSchoolThatIsActive();
        if (allSchools.isEmpty()) {
            log.error("No active schools found in the database");
            return ResponseEntity.notFound().build();
        }

        List<SchoolResponse> schoolResponses = allSchools.stream()
                .peek(school -> {
                    List<Address> activeAddresses = school.getAddresses()
                            .stream()
                            .filter(Address::isActive)
                            .toList();
                    school.setAddresses(activeAddresses);
                })
                .map(this::convertToSchoolResponse)
                .toList();
        log.info("Fetched {} active schools", schoolResponses.size());
        return ResponseEntity.ok(schoolResponses);
    }

    public ResponseEntity<String> deleteSchoolById(String schoolId) {
        School existingSchool = schoolRepository.findBySchool_id(schoolId);
        if (existingSchool == null) {
            log.error("School not found with id {}", schoolId);
            return ResponseEntity.notFound().build();
        }

        existingSchool.setActive(false);
        School deletedSchool = schoolRepository.save(existingSchool);
        log.info("School with ID {} marked as inactive", schoolId);
        return ResponseEntity.ok("School with id " + deletedSchool.getSchool_id() + " deleted successfully.");
    }

    // public ResponseEntity<SchoolStatsDTO> getSchoolStats(String schoolId) {
    //     School school = schoolRepository.findBySchool_id(schoolId);
    //     if (school == null) {
    //         log.error("School not found with id {}", schoolId);
    //         return ResponseEntity.notFound().build();
    //     }

    //     SchoolStatsDTO stats = new SchoolStatsDTO(
    //             school.getSchool_id(),
    //             school.getCreated_at(), // Using created_at as joinDate
    //             school.isActive());
    //     log.info("Fetched stats for school with ID: {}", schoolId);
    //     return ResponseEntity.ok(stats);
    // }

    private void uploadSchoolLogo(MultipartFile file, String schoolId) {
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> {
                    log.error("No school found with ID: {}", schoolId);
                    return new EntityNotFoundException("No school found with ID: " + schoolId);
                });
        String logo = fileStorageService.saveFile(file, schoolId);
        school.setLogo(logo);
        schoolRepository.save(school);
        log.info("Uploaded logo for school with ID: {}", schoolId);
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

    private String generateSchoolId(String schoolName) {
        if (schoolName == null || schoolName.trim().isEmpty()) {
            log.error("School name cannot be null or empty");
            throw new IllegalArgumentException("School name cannot be null or empty");
        }

        String[] words = schoolName.trim().split("\\s+");
        StringBuilder schoolId = new StringBuilder();

        if (words.length == 1) {
            String word = words[0];
            schoolId.append(word.substring(0, Math.min(4, word.length())));
        } else if (words.length == 2) {
            for (String word : words) {
                schoolId.append(word.substring(0, Math.min(2, word.length())));
            }
        } else {
            for (String word : words) {
                if (!word.isEmpty()) {
                    schoolId.append(word.charAt(0));
                }
            }
        }

        String generatedId = schoolId.toString().toUpperCase();
        log.debug("Generated school ID: {} from name: {}", generatedId, schoolName);
        return generatedId;
    }

    public ResponseEntity<SchoolStatsDTO> getSchoolCount() {
        log.info("Fetching school count statistics");

        // Fetch counts of active and inactive schools
        List<School> activeSchools = schoolRepository.findAllSchoolThatIsActive();
        List<School> inactiveSchools = schoolRepository.findAllSchoolThatIsNotActive();

        // If no schools exist at all, return a default response
        if (activeSchools.isEmpty() && inactiveSchools.isEmpty()) {
            log.warn("No schools found in the database");
            return ResponseEntity.ok(new SchoolStatsDTO(null, null, false, 0L, 0L));
        }

        // Calculate counts
        long activeCount = activeSchools.size();
        long inactiveCount = inactiveSchools.size();

        // Use the first active school's data if available, otherwise first inactive
        School sampleSchool = !activeSchools.isEmpty() ? activeSchools.get(0) : inactiveSchools.get(0);

        SchoolStatsDTO stats = new SchoolStatsDTO(
                sampleSchool.getSchool_id(), // Sample school ID
                sampleSchool.getCreated_at(), // Sample join date
                sampleSchool.isActive(), // Sample status
                activeCount, // Total active schools
                inactiveCount // Total inactive schools
        );

        log.info("School count retrieved: {} active, {} inactive", activeCount, inactiveCount);
        return ResponseEntity.ok(stats);
    }

    public ResponseEntity<List<String>> getSchoolName(List<String> schoolIds) {
        log.info("Fetching school names for schoolIds: {}", schoolIds);

        // Validate input
        if (schoolIds == null || schoolIds.isEmpty()) {
            log.warn("School IDs list is null or empty");
            return ResponseEntity.badRequest().body(List.of());
        }

        // Fetch schools by IDs
        List<School> schools = schoolRepository.findAllById(schoolIds)
                .stream()
                .filter(School::isActive) // Only include active schools
                .collect(Collectors.toList());

        // If no matching schools found
        if (schools.isEmpty()) {
            log.warn("No active schools found for provided IDs: {}", schoolIds);
            return ResponseEntity.notFound().build();
        }

        // Extract school names
        List<String> schoolNames = schools.stream()
                .map(School::getSchool_name)
                .collect(Collectors.toList());

        log.info("Found {} school names for provided IDs", schoolNames.size());
        return ResponseEntity.ok(schoolNames);
    }
}