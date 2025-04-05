package com.schoolmanagement.tenant_service.controller;

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

import com.schoolmanagement.tenant_service.dto.SchoolsForPlanResponse;
import com.schoolmanagement.tenant_service.dto.Subscription_planRequest;
import com.schoolmanagement.tenant_service.dto.Subscription_planResponse;
import com.schoolmanagement.tenant_service.service.Subscription_planService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/tenant/api")
@RequiredArgsConstructor
@Slf4j
public class Subscription_Plan_Controller {

    private final Subscription_planService subscription_planService;

    @PostMapping(value = "/addNewSubscriptionPlan")
    public ResponseEntity<Subscription_planResponse> addNewSubscriptionPlan(
            @RequestBody Subscription_planRequest subscription_planRequest) throws Exception {

        return subscription_planService.addNewSubscriptioPlan(subscription_planRequest);
    }

    @PutMapping(value = "/editSubscriptioPlanById/{plan_id}")
    public ResponseEntity<Subscription_planResponse> editSubscriptioPlanById(@PathVariable Long plan_id,
            @RequestBody Subscription_planRequest subscription_planRequest) {

        return subscription_planService.editSubscriptioPlanById(subscription_planRequest, plan_id);
    }

    @GetMapping("/getAllSubscriptionPlans")
    public ResponseEntity<List<Subscription_planResponse>> getAllSubscriptionPlans() {
        return subscription_planService.getAllSubscriptionPlans();
    }

    @GetMapping("/getSubscriptionPlanById/{plan_id}")
    public ResponseEntity<Subscription_planResponse> getSubscriptionPlanById(@PathVariable Long plan_id) {
        return subscription_planService.getSubscriptionPlanById(plan_id);
    }

    @DeleteMapping("/deleteSubscriptioPlanById/{plan_id}")
    public ResponseEntity<String> deleteSubscriptioPlanById(@PathVariable Long plan_id) {
        return subscription_planService.deleteSubscriptioPlanById(plan_id);
    }

    // New endpoint to fetch schools subscribed to a plan
    @GetMapping("/getSchoolsByPlanId/{planId}")
    public ResponseEntity<SchoolsForPlanResponse> getSchoolsByPlanId(@PathVariable Long planId) {
        SchoolsForPlanResponse response = subscription_planService.getSchoolsByPlanId(planId);
        return ResponseEntity.ok(response);
    }
}