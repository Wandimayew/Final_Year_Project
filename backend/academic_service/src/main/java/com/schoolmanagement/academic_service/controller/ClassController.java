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

import com.schoolmanagement.academic_service.dto.request.ClassRequest;
import com.schoolmanagement.academic_service.dto.response.ClassResponse;
import com.schoolmanagement.academic_service.service.ClassService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/academic/api")
@RequiredArgsConstructor
@Slf4j
public class ClassController {
    private final ClassService classService;

    @PostMapping("/{school_id}/addNewClass")
    public ResponseEntity<ClassResponse> addNewClass(@RequestBody ClassRequest classRequest,
            @PathVariable String school_id) {
        // return addressService.addNewAddress(ClassRequest, school_id);
        return classService.addNewClass(classRequest, school_id);
    }

    @PutMapping("/{school_id}/editClassById/{class_id}")
    public ResponseEntity<ClassResponse> editClassById(@PathVariable String school_id, @PathVariable Long class_id,
            @RequestBody ClassRequest classRequest) {
        // return addressService.editAddressById(ClassRequest, school_id, address_id);
        return classService.editClassById(classRequest, school_id, class_id);
    }

    @PutMapping("/{school_id}/editStatus/{class_id}")
    public ResponseEntity<ClassResponse> editStatus(@PathVariable String school_id, @PathVariable Long class_id) {
        return classService.updateStatus(school_id, class_id);
    }

    @GetMapping("/{school_id}/getAllClassBySchool")
    public ResponseEntity<List<ClassResponse>> getAllClassBySchool(@PathVariable String school_id) {
        // return addressService.getAllAddressesBySchoolId(school_id);
        return classService.getAllClassesBySchoolId(school_id);
    }

    @GetMapping("/{school_id}/getAllClassByStream/{stream_id}")
    public ResponseEntity<List<ClassResponse>> getAllClassByStream(@PathVariable String school_id,@PathVariable Long stream_id) {
        // return addressService.getAllAddressesBySchoolId(school_id);
        return classService.getAllClassesByStreamId(school_id, stream_id);
    }

    @GetMapping("/{school_id}/getClassById/{class_id}")
    public ResponseEntity<ClassResponse> getClassById(@PathVariable String school_id, @PathVariable Long class_id) {
        // return addressService.getAddressById(school_id, address_id);
        return classService.getClassById(school_id, class_id);
    }

    @GetMapping("/{school_id}/getClassDetails/{class_id}")
    public ResponseEntity<ClassResponse> getClassDetails(@PathVariable String school_id, @PathVariable Long class_id) {
        // return addressService.getAddressById(school_id, address_id);
        return classService.getClassDetails(school_id, class_id);
    }
    @DeleteMapping("/{school_id}/deleteClassById/{class_id}")
    public ResponseEntity<String> deleteClassById(@PathVariable String school_id, @PathVariable Long class_id) {
        // return addressService.deleteAddressById(school_id, address_id);
        return classService.deleteClassById(school_id, class_id);
    }
    @PostMapping("/{school_id}/assign-subjects/{class_id}")
    public ResponseEntity<ClassResponse> assignSubjectsToClass(
        @PathVariable String school_id,
        @PathVariable Long class_id,
        @RequestBody List<Long> subjectIds
    ) {
        try {
            log.info("subject ids in controller [{}]",subjectIds);
           return classService.assignSubjectsToClass(school_id, class_id, subjectIds);
        } catch (IllegalArgumentException e) {
            log.info("error assigning");
            return null;
        }
    }
}