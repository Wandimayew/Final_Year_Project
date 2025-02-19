package com.schoolmanagement.academic_service.service;

import java.util.Set;

import org.springframework.stereotype.Service;

import com.schoolmanagement.academic_service.dto.request.TimeTableRequest;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ValidationService {
      private final Validator validator;

    public void validateRequest(TimeTableRequest request) {
        log.info("Validating timetable request...");
        Set<ConstraintViolation<TimeTableRequest>> violations = validator.validate(request);
        if (!violations.isEmpty()) {
            log.error("Request validation failed with violations: {}", violations);
            throw new ConstraintViolationException(violations);
        }
    }
}
