package com.schoolmanagement.academic_service.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.schoolmanagement.academic_service.dto.request.SectionRequest;
import com.schoolmanagement.academic_service.dto.response.SectionResponse;
import com.schoolmanagement.academic_service.model.Section;
import com.schoolmanagement.academic_service.model.Class;
import com.schoolmanagement.academic_service.repository.ClassRepository;
import com.schoolmanagement.academic_service.repository.SectionRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class SectionService {

    private final SectionRepository sectionRepository;
    private final ClassRepository classRepository;

    public ResponseEntity<SectionResponse> addNewSection(SectionRequest sectionRequest, String schoolId) {

        Class classExists = classRepository.findBySchoolAndClassId(schoolId, sectionRequest.getClassId());
        if (classExists == null) {
            log.error("Class not found with id {}", sectionRequest.getClassId());
            return ResponseEntity.notFound().build();
        }
        Section newSection = new Section();

        newSection.setSchoolId(schoolId);
        newSection.setSectionName(sectionRequest.getSectionName());
        newSection.setCapacity(sectionRequest.getCapacity());
        newSection.setClassId(classExists);
        newSection.setActive(true);
        newSection.setCreated_at(LocalDateTime.now());
        newSection.setCreated_by("Admin");

        Section savedSection = sectionRepository.save(newSection);

        return ResponseEntity.ok(convertToSectionResponse(savedSection));

    }

    public ResponseEntity<SectionResponse> editSectionById(SectionRequest sectionRequest, String schoolId,
            Long sectionId) {

        Section sectionExists = sectionRepository
                .findSingleActiveSectionWithActiveClass(schoolId, sectionRequest.getClassId(), sectionId).orElse(null);
        if (sectionExists == null) {
            log.error("Section not found with id {}", sectionId);
            return ResponseEntity.notFound().build();
        }

        sectionExists.setSectionName(sectionRequest.getSectionName());
        sectionExists.setCapacity(sectionRequest.getCapacity());
        sectionExists.setUpdated_at(LocalDateTime.now());
        sectionExists.setUpdated_by("updated");

        Section savedSection = sectionRepository.save(sectionExists);

        return ResponseEntity.ok(convertToSectionResponse(savedSection));
    }

    public ResponseEntity<String> deleteSectionById(String schoolId, Long sectionId) {

        Section sectionExists = sectionRepository.findBySchoolAndSectionId(schoolId, sectionId);
        if (sectionExists == null) {
            log.error("Section not found with id {}", sectionId);
            return ResponseEntity.notFound().build();
        }

        sectionExists.setActive(false);

        sectionRepository.save(sectionExists);
        return ResponseEntity.ok("Section with id " + sectionId + " deleted successfully.");
    }

    public ResponseEntity<SectionResponse> getSectionById(String schoolId, Long sectionId) {

        Section sectionExists = sectionRepository.findBySchoolAndSectionId(schoolId, sectionId);
        if (sectionExists == null) {
            log.error("Section not found with id {}", sectionId);
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(convertToSectionResponse(sectionExists));
    }

    public ResponseEntity<List<SectionResponse>> getSectionByClassId(String schoolId, Long classId) {

        List<Section> sectionExists = sectionRepository.findAllActiveSectionsForClass(schoolId, classId);
        if (sectionExists == null) {
            log.error("Class not found with id {}", classId);
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity
                .ok(sectionExists.stream().map(this::convertToSectionResponse).collect(Collectors.toList()));
    }

    public ResponseEntity<List<SectionResponse>> getAllSectionesBySchoolId(String schoolId) {

        List<Section> sectiones = sectionRepository.findAllSchoolSectionesThatIsActive(schoolId);

        return ResponseEntity.ok(sectiones.stream().map(this::convertToSectionResponse).collect(Collectors.toList()));
    }

    public ResponseEntity<String> deleteSectionByClass(String schoolId, Long classId) {

        List<Section> sectionExists = sectionRepository.findAllActiveSectionsForClass(schoolId, classId);
        if (sectionExists == null) {
            log.error("Class not found with id {}", classId);
            return ResponseEntity.notFound().build();
        }
        // Set isActive to false for all sections
        for (Section section : sectionExists) {
            section.setActive(false); 
        }

        // Save updated sections back to the repository
        sectionRepository.saveAll(sectionExists);

        return ResponseEntity.ok("All section for class id " + classId + " deleted successfully.");
    }

    private SectionResponse convertToSectionResponse(Section sectionResp) {
        return SectionResponse.builder()
                .sectionId(sectionResp.getSectionId())
                .capacity(sectionResp.getCapacity())
                .sectionName(sectionResp.getSectionName())
                .schoolId(sectionResp.getSchoolId())
                .classId(sectionResp.getClassId().getClassId())
                .build();
    }
}
