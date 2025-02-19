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

import com.schoolmanagement.academic_service.dto.request.TimeTableRequest;
import com.schoolmanagement.academic_service.dto.response.TimeTableResponse;
import com.schoolmanagement.academic_service.service.ScheduleService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/academic/api")
@RequiredArgsConstructor
@Slf4j
public class TimeTableController {
    
    // private final TimeTableService timeTableService;
    private final ScheduleService scheduleService;

    @PostMapping("/{school_id}/addNewTimeTable")
    public TimeTableResponse addNewTimeTable(@RequestBody TimeTableRequest timeTableRequest,
            @PathVariable String school_id) {
                log.info("the data comes is {}:", timeTableRequest);
        // return addressService.addNewAddress(ClassRequest, school_id);
        return scheduleService.generateTimeTable(timeTableRequest);
    }

    @PutMapping("/{school_id}/editTimeTableById/{timetable_id}")
    public ResponseEntity<TimeTableResponse> editTimeTableById(@PathVariable Long school_id, @PathVariable Long timetable_id,
            @RequestBody TimeTableRequest timeTableRequest) {
        // return addressService.editAddressById(ClassRequest, school_id, address_id);
        return null;
    }

    @GetMapping("/{school_id}/getAllTimeTableByClass/{class_id}")
    public ResponseEntity<List<TimeTableResponse>> getAllTimeTableByClass(@PathVariable Long school_id,
            @PathVariable Long class_id) {
        // return addressService.getAllAddressesBySchoolId(school_id);
        return null;
    }

    @GetMapping("/{school_id}/getTimeTableById/{timetable_id}")
    public ResponseEntity<TimeTableResponse> getTimeTableById(@PathVariable Long school_id, @PathVariable Long timetable_id) {
        // return addressService.getAddressById(school_id, address_id);
        return null;
    }
    @GetMapping("/{school_id}/getTimeTableByStream/{stream_id}")
    public ResponseEntity<TimeTableResponse> getTimeTableByStream(@PathVariable Long school_id, @PathVariable Long stream_id) {
        // return addressService.getAddressById(school_id, address_id);
        return null;
    }

    @DeleteMapping("/{school_id}/deleteTimeTableById/{timetable_id}")
    public ResponseEntity<String> deleteTimeTableById(@PathVariable Long school_id, @PathVariable Long timetable_id) {
        // return addressService.deleteAddressById(school_id, address_id);
        return null;
    }

    @DeleteMapping("/{school_id}/deleteTimeTableByClass/{class_id}")
    public ResponseEntity<String> deleteTimeTableByClass(@PathVariable Long school_id, @PathVariable Long class_id) {
        // return addressService.deleteAddressById(school_id, address_id);
        return null;
    }
}
