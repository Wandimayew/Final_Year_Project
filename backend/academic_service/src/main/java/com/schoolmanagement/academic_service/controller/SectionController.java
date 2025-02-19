package com.schoolmanagement.academic_service.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.schoolmanagement.academic_service.dto.request.SectionRequest;
import com.schoolmanagement.academic_service.dto.response.SectionResponse;
import com.schoolmanagement.academic_service.service.SectionService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/academic/api")
@RequiredArgsConstructor
@Slf4j
public class SectionController {
    private final SectionService sectionService;

    @PostMapping("/{school_id}/addNewSection")
    public ResponseEntity<SectionResponse> addNewSection(@RequestBody SectionRequest sectionRequest,
            @PathVariable String school_id) {
        // return addressService.addNewAddress(ClassRequest, school_id);
        return sectionService.addNewSection(sectionRequest, school_id);
    }

    @PutMapping("/{school_id}/editSectionById/{section_id}")
    public ResponseEntity<SectionResponse> editSectionById(@PathVariable String school_id, @PathVariable Long section_id,
            @RequestBody SectionRequest sectionRequest) {
        // return addressService.editAddressById(ClassRequest, school_id, address_id);
        return sectionService.editSectionById(sectionRequest, school_id, section_id);
    }

    @GetMapping("/{school_id}/getAllSectionByClass/{class_id}")
    public ResponseEntity<List<SectionResponse>> getAllSectionByClass(@PathVariable String school_id,
            @PathVariable Long class_id) {
        // return addressService.getAllAddressesBySchoolId(school_id);
        return sectionService.getSectionByClassId(school_id, class_id);
    }

    @GetMapping("/{school_id}/getSectionById/{section_id}")
    public ResponseEntity<SectionResponse> getSectionById(@PathVariable String school_id, @PathVariable Long section_id) {
        // return addressService.getAddressById(school_id, address_id);
        return sectionService.getSectionById(school_id, section_id);
    }

    @DeleteMapping("/{school_id}/deleteSectionById/{section_id}")
    public ResponseEntity<String> deleteSectionById(@PathVariable String school_id, @PathVariable Long section_id) {
        // return addressService.deleteAddressById(school_id, address_id);
        return sectionService.deleteSectionById(school_id, section_id);
    }

    @DeleteMapping("/{school_id}/deleteSectionByClass/{class_id}")
    public ResponseEntity<String> deleteSectionByClass(@PathVariable String school_id, @PathVariable Long class_id) {
        // return addressService.deleteAddressById(school_id, address_id);
        return sectionService.deleteSectionByClass(school_id, class_id);
    }
}
