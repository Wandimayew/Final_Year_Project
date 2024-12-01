package com.schoolmanagement.tenant_service.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.schoolmanagement.tenant_service.dto.School_subscriptionsRequest;
import com.schoolmanagement.tenant_service.dto.School_subscriptionsResponse;
import com.schoolmanagement.tenant_service.model.School;
import com.schoolmanagement.tenant_service.model.School_subscriptions;
import com.schoolmanagement.tenant_service.model.Subscription_plans;
import com.schoolmanagement.tenant_service.repository.SchoolRepository;
import com.schoolmanagement.tenant_service.repository.School_subscriptionsRepository;
import com.schoolmanagement.tenant_service.repository.Subscription_plansRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class School_SubscriptionService {

    private final School_subscriptionsRepository school_subscriptionsRepository;
    private final SchoolRepository schoolRepository;
    private final Subscription_plansRepository subscription_plansRepository;

    public ResponseEntity<School_subscriptionsResponse> addNewSchoolSubscription(
            School_subscriptionsRequest school_subscriptionsRequest, Long school_id) {

        School school = schoolRepository.findBySchool_id(school_id);
        if (school == null) {
            log.error("School not found with id {}", school_id);
            return ResponseEntity.notFound().build();
        }

        Long plan_id = school_subscriptionsRequest.getSubscriptionPlan();
        Subscription_plans planExists = subscription_plansRepository.findByPlanId(plan_id);

        if (planExists == null) {
            log.error("Subscription plan not found with id {}", plan_id);
            return ResponseEntity.notFound().build();
        }

        School_subscriptions newSchoolSubscription = new School_subscriptions();

        newSchoolSubscription.setSchool(school);
        newSchoolSubscription.setSubscriptionPlan(planExists);
        newSchoolSubscription.setStart_date(school_subscriptionsRequest.getStart_date());
        newSchoolSubscription.setEnd_date(school_subscriptionsRequest.getEnd_date());
        newSchoolSubscription.setStatus(school_subscriptionsRequest.getStatus());
        newSchoolSubscription.setCreated_at(LocalDateTime.now());
        newSchoolSubscription.setCreated_by("admin");
        newSchoolSubscription.setUpdated_at(LocalDateTime.now());
        newSchoolSubscription.setActive(true);

        School_subscriptions savedSchoolSubscription = school_subscriptionsRepository.save(newSchoolSubscription);

        return ResponseEntity.ok(convertToSchoolSubscriptionResponse(savedSchoolSubscription));

    }

    public ResponseEntity<School_subscriptionsResponse> editSchoolSubscriptionById(
            School_subscriptionsRequest school_subscriptionsRequest, Long school_id, Long subscription_id) {
        School schoolExists = schoolRepository.findBySchool_id(school_id);
        if (schoolExists == null) {
            log.error("School not found with id {}", school_id);
            return ResponseEntity.notFound().build();
        }
        School_subscriptions subscriptionExists = school_subscriptionsRepository.findBySchoolAndPlanId(schoolExists,
                subscription_id);
        if (subscriptionExists == null) {
            log.error("School subscription not found with id {}", subscription_id);
            return ResponseEntity.notFound().build();
        }

        subscriptionExists.setSchool(schoolExists);
        subscriptionExists.setSubscriptionPlan(subscriptionExists.getSubscriptionPlan());
        subscriptionExists.setStart_date(school_subscriptionsRequest.getStart_date());
        subscriptionExists.setEnd_date(school_subscriptionsRequest.getEnd_date());
        subscriptionExists.setStatus(school_subscriptionsRequest.getStatus());
        subscriptionExists.setUpdated_at(LocalDateTime.now());
        subscriptionExists.setCreated_by("admin");

        School_subscriptions updatedSchoolSubscription = school_subscriptionsRepository.save(subscriptionExists);

        return ResponseEntity.ok(convertToSchoolSubscriptionResponse(updatedSchoolSubscription));
    }

    public ResponseEntity<String> deleteSchoolSubscriptionById(Long school_id, Long subscription_id) {
        School schoolExists = schoolRepository.findBySchool_id(school_id);
        if (schoolExists == null) {
            log.error("School not found with id {}", school_id);
            return ResponseEntity.notFound().build();
        }
        School_subscriptions subscriptionExists = school_subscriptionsRepository.findBySchoolAndPlanId(schoolExists,
                subscription_id);
        if (subscriptionExists == null) {
            log.error("School subscription not found with id {}", subscription_id);
            return ResponseEntity.notFound().build();
        }

        subscriptionExists.setActive(false);

        school_subscriptionsRepository.save(subscriptionExists);
        return ResponseEntity.ok("School subscription with id " + " deleted successfully");
    }

    public ResponseEntity<School_subscriptionsResponse> getSchoolSubscriptionById(Long school_id,
            Long subscription_id) {
        School schoolExists = schoolRepository.findBySchool_id(school_id);
        if (schoolExists == null) {
            log.error("School not found with id {}", school_id);
            return ResponseEntity.notFound().build();
        }

        School_subscriptions existingSchoolSubscription = school_subscriptionsRepository
                .findBySchoolAndPlanId(schoolExists, subscription_id);
        if (existingSchoolSubscription == null) {
            log.error("School subscription not found with id {}", subscription_id);
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(convertToSchoolSubscriptionResponse(existingSchoolSubscription));
    }

    public ResponseEntity<List<School_subscriptionsResponse>> getAllSchoolSubscription(Long school_id) {
        School schoolExists = schoolRepository.findBySchool_id(school_id);
        if (schoolExists == null) {
            log.error("School not found with id {}", school_id);
            return ResponseEntity.notFound().build();
        }

        List<School_subscriptions> allSchoolSubscriptions = school_subscriptionsRepository
                .findAllSchoolSubscriptionsThatIsActive(schoolExists);
        return ResponseEntity.ok(allSchoolSubscriptions.stream().map(this::convertToSchoolSubscriptionResponse)
                .collect(Collectors.toList()));
    }

    private School_subscriptionsResponse convertToSchoolSubscriptionResponse(
            School_subscriptions newSchoolSubscription) {
        return School_subscriptionsResponse.builder()
                .subscription_id(newSchoolSubscription.getSubscription_id())
                .updated_at(newSchoolSubscription.getUpdated_at())
                .created_at(newSchoolSubscription.getCreated_at())
                .created_by(newSchoolSubscription.getCreated_by())
                .school_id(newSchoolSubscription.getSchool().getSchool_id())
                .start_date(newSchoolSubscription.getStart_date())
                .end_date(newSchoolSubscription.getEnd_date())
                .status(newSchoolSubscription.getStatus())
                .subscriptionPlan(newSchoolSubscription.getSubscriptionPlan().getPlan_id())
                .plan_name(newSchoolSubscription.getSubscriptionPlan().getName())
                .isActive(newSchoolSubscription.isActive())
                .build();
    }
}