package com.schoolmanagement.tenant_service.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.schoolmanagement.tenant_service.dto.SchoolRequest;
import com.schoolmanagement.tenant_service.dto.SchoolResponse;
import com.schoolmanagement.tenant_service.service.SchoolService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;


@RestController
@RequestMapping("/tenant/api")
@RequiredArgsConstructor
@Slf4j
public class School_Controller {

    private final SchoolService schoolService;

    @PostMapping(value = "/addNewSchool", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SchoolResponse> addNewSchool(@ModelAttribute SchoolRequest schoolRequest) {
        
        return schoolService.addNewSchool(schoolRequest);
    }

    @PutMapping(value = "/editSchoolById/{school_id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SchoolResponse> editSchoolById(@PathVariable Long school_id, @ModelAttribute SchoolRequest schoolRequest) {
        
        return schoolService.editSchoolById(schoolRequest, school_id);
    }

    @GetMapping("/getAllSchools")
    public ResponseEntity<List<SchoolResponse>> getAllSchools() {
        return schoolService.getAllSchools();
    }
    
    @GetMapping("/getSchoolById/{school_id}")
    public ResponseEntity<SchoolResponse> getSchoolById(@PathVariable Long school_id) {
        return schoolService.getSchoolById(school_id);
    } 
    
    @DeleteMapping("/deleteSchoolById/{school_id}")
    public ResponseEntity<String> deleteSchoolById(@PathVariable Long school_id) {
        return schoolService.deleteSchoolById(school_id);
    }
}