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

import com.schoolmanagement.academic_service.dto.request.StreamRequest;
import com.schoolmanagement.academic_service.dto.response.StreamResponse;
import com.schoolmanagement.academic_service.service.StreamService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/academic/api")
@RequiredArgsConstructor
@Slf4j
public class StreamController {
    
    private final StreamService streamService;

    @PostMapping("/{school_id}/addNewStream")
    public ResponseEntity<StreamResponse> addNewStream(@RequestBody StreamRequest streamRequest,
            @PathVariable String school_id) {
        // return StreamService.addNewStream(ClassRequest, school_id);
        return streamService.addNewStream(streamRequest, school_id);
    }

    @PutMapping("/{school_id}/editStreamById/{stream_id}")
    public ResponseEntity<StreamResponse> editStreamById(@PathVariable String school_id, @PathVariable Long stream_id,
            @RequestBody StreamRequest streamRequest) {
        // return StreamService.editStreamById(ClassRequest, school_id, Stream_id);
        return streamService.editStreamById(streamRequest, school_id, stream_id);
    }

    @GetMapping("/{school_id}/getAllStreamBySchool")
    public ResponseEntity<List<StreamResponse>> getAllStreamBySchool(@PathVariable String school_id) {
        // return StreamService.getAllStreamesBySchoolId(school_id);
        return streamService.getAllStreamesBySchoolId(school_id);
    }

    @GetMapping("/{school_id}/getStreamById/{stream_id}")
    public ResponseEntity<StreamResponse> getStreamById(@PathVariable String school_id, @PathVariable Long stream_id) {
        // return StreamService.getStreamById(school_id, Stream_id);
        return streamService.getStreamById(school_id, stream_id);
    }

    @DeleteMapping("/{school_id}/deleteStreamById/{stream_id}")
    public ResponseEntity<String> deleteStreamById(@PathVariable String school_id, @PathVariable Long stream_id) {
        // return StreamService.deleteStreamById(school_id, Stream_id);
        return streamService.deleteStreamById(school_id, stream_id);
    }

}
