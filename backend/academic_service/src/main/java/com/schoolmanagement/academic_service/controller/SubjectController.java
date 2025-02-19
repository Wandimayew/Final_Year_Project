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

import com.schoolmanagement.academic_service.dto.request.SubjectRequest;
import com.schoolmanagement.academic_service.dto.response.SubjectResponse;
import com.schoolmanagement.academic_service.service.SubjectService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/academic/api")
@RequiredArgsConstructor
@Slf4j
public class SubjectController {

    private final SubjectService subjectService;

    @PostMapping("/{school_id}/addNewSubject")
    public ResponseEntity<SubjectResponse> addNewSubject(@RequestBody SubjectRequest subjectRequest,
            @PathVariable String school_id) {
        // return addressService.addNewAddress(ClassRequest, school_id);
        return subjectService.addNewSubject(subjectRequest, school_id);
    }

    @PutMapping("/{school_id}/editSubjectById/{subject_id}")
    public ResponseEntity<SubjectResponse> editSubjectById(@PathVariable String school_id,
            @PathVariable Long subject_id,
            @RequestBody SubjectRequest subjectRequest) {
        // return addressService.editAddressById(ClassRequest, school_id, address_id);
        return subjectService.editSubjectById(subjectRequest, school_id, subject_id);
    }

    @GetMapping("/{school_id}/getAllSubjectByClass/{class_id}")
    public ResponseEntity<List<SubjectResponse>> getAllSubjectByClass(@PathVariable String school_id,
            @PathVariable Long class_id) {
        return subjectService.getAllSubjectesByClass(school_id, class_id);
    }

    @GetMapping("/{school_id}/getAllSubjectsByStream/{stream_id}")
    public ResponseEntity<List<SubjectResponse>> getAllSubjectsByStream(@PathVariable String school_id,
            @PathVariable Long stream_id) {
                log.info("in controller for stream fetching");
        return subjectService.getAllSubjectesByStream(school_id, stream_id);
    }

    @GetMapping("/{school_id}/getAllSubjectBySchool")
    public ResponseEntity<List<SubjectResponse>> getAllSubjectBySchool(@PathVariable String school_id) {
        return subjectService.getAllSubjectesBySchoolId(school_id);
    }

    @GetMapping("/{school_id}/getSubjectById/{subject_id}")
    public ResponseEntity<SubjectResponse> getSubjectById(@PathVariable String school_id,
            @PathVariable Long subject_id) {
        // return addressService.getAddressById(school_id, address_id);
        return subjectService.getSubjectById(school_id, subject_id);
    }

    @DeleteMapping("/{school_id}/deleteSubjectById/{subject_id}")
    public ResponseEntity<String> deleteSubjectById(@PathVariable String school_id, @PathVariable Long subject_id) {
        // return addressService.deleteAddressById(school_id, address_id);
        return subjectService.deleteSubjectById(school_id, subject_id);
    }
    // @DeleteMapping("/{school_id}/deleteSubjectByStream/{stream_id}")
    // public ResponseEntity<String> deleteSubjectByStream(@PathVariable String
    // school_id, @PathVariable Long stream_id) {
    // // return addressService.deleteAddressById(school_id, address_id);
    // return null;
    // }
}