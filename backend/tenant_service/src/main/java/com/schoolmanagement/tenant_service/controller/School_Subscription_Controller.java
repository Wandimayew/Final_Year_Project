package com.schoolmanagement.tenant_service.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.schoolmanagement.tenant_service.dto.School_subscriptionsRequest;
import com.schoolmanagement.tenant_service.dto.School_subscriptionsResponse;
import com.schoolmanagement.tenant_service.service.School_SubscriptionService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;


@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/tenant/api")
public class School_Subscription_Controller {
    private final School_SubscriptionService school_SubscriptionService;

    @PostMapping("/{school_id}/addNewSchoolSubscription")
    public ResponseEntity<School_subscriptionsResponse> addNewSchoolSubscription(
            @RequestBody School_subscriptionsRequest school_subscriptionsRequest, @PathVariable Long school_id) {

        return school_SubscriptionService.addNewSchoolSubscription(school_subscriptionsRequest, school_id);
    }

    @PutMapping("/{school_id}/editSchoolSubscriptionById/{subscription_id}")
    public ResponseEntity<School_subscriptionsResponse> editSchoolSubscriptionById(
            @RequestBody School_subscriptionsRequest school_subscriptionsRequest, @PathVariable Long school_id,
            @PathVariable Long subscription_id) {
        return school_SubscriptionService.editSchoolSubscriptionById(school_subscriptionsRequest, school_id, subscription_id);
    }

    @DeleteMapping("/{school_id}/deleteSchoolSubscriptionById/{subscription_id}")
    public ResponseEntity<String> deleteSchoolSubscriptionById(@PathVariable Long school_id,
            @PathVariable Long subscription_id) {
        return school_SubscriptionService.deleteSchoolSubscriptionById(school_id, subscription_id);
    }

    @GetMapping("/{school_id}/getAllSchoolSubscriptions")
    public ResponseEntity<List<School_subscriptionsResponse>> getAllSchoolSubscriptions(@PathVariable Long school_id) {
        return school_SubscriptionService.getAllSchoolSubscription(school_id);
    }

    @GetMapping("/{school_id}/getSchoolSubscriptionById/{subscription_id}")
    public ResponseEntity<School_subscriptionsResponse> getSchoolSubscriptionById(@PathVariable Long school_id,
    @PathVariable Long subscription_id) {
        return school_SubscriptionService.getSchoolSubscriptionById(school_id, subscription_id);
    }
}