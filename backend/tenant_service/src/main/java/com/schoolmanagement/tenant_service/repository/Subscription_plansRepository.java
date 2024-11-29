package com.schoolmanagement.tenant_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.tenant_service.model.Subscription_plans;

@Repository
public interface Subscription_plansRepository extends JpaRepository<Subscription_plans, Long> {

    // Subscription_plans findByPlanId(Long subscriptionPlan);

    @Query("SELECT sp FROM Subscription_plans sp WHERE sp.plan_id = :plan_id AND sp.isActive = true")
    Subscription_plans findByPlanId(@Param("plan_id") Long plan_id);

    @Query("SELECT sp FROM Subscription_plans sp WHERE sp.isActive = true")
    List<Subscription_plans> findAllActiveSubscriptionPlan();
}
