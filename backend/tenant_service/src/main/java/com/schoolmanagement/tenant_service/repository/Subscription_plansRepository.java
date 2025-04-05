package com.schoolmanagement.tenant_service.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.tenant_service.model.School;
import com.schoolmanagement.tenant_service.model.Subscription_plans;

@Repository
public interface Subscription_plansRepository extends JpaRepository<Subscription_plans, Long> {

    // Existing methods
    @Query("SELECT sp FROM Subscription_plans sp WHERE sp.plan_id = :plan_id AND sp.isActive = true")
    Subscription_plans findByPlanId(@Param("plan_id") Long plan_id);

    @Query("SELECT sp FROM Subscription_plans sp WHERE sp.isActive = true")
    List<Subscription_plans> findAllActiveSubscriptionPlan();

    // Updated method to fetch schools by plan ID via School_subscriptions
    @Query("SELECT ss.school FROM School_subscriptions ss WHERE ss.subscriptionPlan.plan_id = :planId AND ss.isActive = true")
    List<School> findSchoolsByPlanId(@Param("planId") Long planId);
}