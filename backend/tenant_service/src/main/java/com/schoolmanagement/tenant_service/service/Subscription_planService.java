package com.schoolmanagement.tenant_service.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.schoolmanagement.tenant_service.dto.SchoolResponse;
import com.schoolmanagement.tenant_service.dto.SchoolsForPlanResponse;
import com.schoolmanagement.tenant_service.dto.Subscription_planRequest;
import com.schoolmanagement.tenant_service.dto.Subscription_planResponse;
import com.schoolmanagement.tenant_service.model.School;
import com.schoolmanagement.tenant_service.model.Subscription_plans;
import com.schoolmanagement.tenant_service.repository.Subscription_plansRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class Subscription_planService {

    private final Subscription_plansRepository subscription_plansRepository;

    public ResponseEntity<Subscription_planResponse> addNewSubscriptioPlan(
            Subscription_planRequest subscription_planRequest) throws Exception {
        Subscription_plans newPlan = new Subscription_plans();

        newPlan.setFeatures(subscription_planRequest.getFeatures());
        newPlan.setName(subscription_planRequest.getName());
        newPlan.setActive(true);
        newPlan.setPrice(subscription_planRequest.getPrice());
        newPlan.setBilling_cycle(subscription_planRequest.getBilling_cycle());
        newPlan.setCreated_at(LocalDateTime.now());
        newPlan.setCreated_by("admin");

        Subscription_plans savedPlan = subscription_plansRepository.save(newPlan);
        return ResponseEntity.ok(convertToSubscriptionPlanResponse(savedPlan));

    }

    public ResponseEntity<Subscription_planResponse> editSubscriptioPlanById(
            Subscription_planRequest subscription_planRequest, Long plan_id) {
        Subscription_plans existingPlan = subscription_plansRepository.findByPlanId(plan_id);

        if (existingPlan == null) {
            log.error("Subscription plan not found with id {}", plan_id);
            return ResponseEntity.notFound().build();
        }

        existingPlan.setName(subscription_planRequest.getName());
        existingPlan.setBilling_cycle(subscription_planRequest.getBilling_cycle());
        existingPlan.setPrice(subscription_planRequest.getPrice());
        existingPlan.setUpdated_at(LocalDateTime.now());
        existingPlan.setCreated_by("admin");
        existingPlan.setFeatures(subscription_planRequest.getFeatures());

        Subscription_plans updatedPlan = subscription_plansRepository.save(existingPlan);

        return ResponseEntity.ok(convertToSubscriptionPlanResponse(updatedPlan));
    }

    public ResponseEntity<String> deleteSubscriptioPlanById(Long plan_id) {
        Subscription_plans existingPlan = subscription_plansRepository.findByPlanId(plan_id);

        if (existingPlan == null) {
            log.error("Subscription plan not found with id {}", plan_id);
            return ResponseEntity.notFound().build();
        }

        existingPlan.setActive(false);
        subscription_plansRepository.save(existingPlan);
        return ResponseEntity.ok("Subscription Plan with id " + plan_id + " deleted successfully.");
    }

    public ResponseEntity<List<Subscription_planResponse>> getAllSubscriptionPlans() {
        List<Subscription_plans> allPlans = subscription_plansRepository.findAllActiveSubscriptionPlan();

        if (allPlans.isEmpty()) {
            log.error("Subscription plan not found ");
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity
                .ok(allPlans.stream().map(this::convertToSubscriptionPlanResponse).collect(Collectors.toList()));
    }

    public ResponseEntity<Subscription_planResponse> getSubscriptionPlanById(Long plan_id) {
        Subscription_plans existingPlan = subscription_plansRepository.findByPlanId(plan_id);

        if (existingPlan == null) {
            log.error("Subscription plan not found with id {}", plan_id);
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(convertToSubscriptionPlanResponse(existingPlan));
    }

    private Subscription_planResponse convertToSubscriptionPlanResponse(
            Subscription_plans newSubscription_plans) {
        return Subscription_planResponse.builder()
                .plan_id(newSubscription_plans.getPlan_id())
                .updated_at(newSubscription_plans.getUpdated_at())
                .created_at(newSubscription_plans.getCreated_at())
                .created_by(newSubscription_plans.getCreated_by())
                .name(newSubscription_plans.getName())
                .price(newSubscription_plans.getPrice())
                .billing_cycle(newSubscription_plans.getBilling_cycle())
                .features(newSubscription_plans.getFeatures())
                .isActive(newSubscription_plans.isActive())
                .build();
    }

    public SchoolsForPlanResponse getSchoolsByPlanId(Long planId) {
        // Fetch the subscription plan to validate it exists and is active
        Subscription_plans plan = subscription_plansRepository.findByPlanId(planId);
        if (plan == null || !plan.isActive()) {
            throw new IllegalArgumentException("Subscription plan with ID " + planId + " not found or inactive");
        }
        log.info("Subsctiption plan from plan id {} the result is : {}", planId, plan);

        // Fetch all schools subscribed to this plan
        List<School> schools = subscription_plansRepository.findSchoolsByPlanId(planId);
        log.info("school that are subscribed to plan id : {} are here is their lists : {}", planId, schools);
        // Map School entities to SchoolResponse DTOs
        List<SchoolResponse> schoolResponses = schools.stream()
                .map(this::mapToSchoolResponse)
                .collect(Collectors.toList());

        log.info("Finally the response that mapped with the school response : {}", schoolResponses);
        // Build and return the response
        return new SchoolsForPlanResponse(schoolResponses, planId, plan.isActive());
    }

    // Helper method to map School entity to SchoolResponse DTO
    private SchoolResponse mapToSchoolResponse(School school) {
        return SchoolResponse.builder()
                .school_id(school.getSchool_id())
                .school_name(school.getSchool_name())
                .addresses(null)
                .contact_number(school.getContact_number())
                .email_address(school.getEmail_address())
                .school_type(school.getSchool_type())
                .establishment_date(school.getEstablishment_date())
                .school_information(school.getSchool_information())
                .isActive(school.isActive())
                .status(school.getStatus())
                .created_at(school.getCreated_at())
                .updated_at(school.getUpdated_at())
                .created_by(school.getCreated_by())
                .logo(school.getLogo() != null ? school.getLogo().getBytes() : null) // Assuming logo is stored as
                                                                                     // String (Base64 or path), adjust
                                                                                     // if it's a BLOB
                .build();
    }
}