package com.schoolmanagement.tenant_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.tenant_service.model.School;
import com.schoolmanagement.tenant_service.model.School_subscriptions;

@Repository
public interface School_subscriptionsRepository extends JpaRepository<School_subscriptions, Long> {
    @Query("SELECT ss FROM School_subscriptions ss WHERE ss.school = :school AND ss.subscription_id = :subscription_id AND ss.isActive = true")
    School_subscriptions findBySchoolAndPlanId(@Param("school") School school,
            @Param("subscription_id") Long subscription_id);

    @Query("SELECT ss FROM School_subscriptions ss WHERE ss.school = :school AND ss.isActive = true")
    List<School_subscriptions> findAllSchoolSubscriptionsThatIsActive(@Param("school") School school);

    @Query("SELECT ss FROM School_subscriptions ss WHERE ss.subscription_id = :subscriptionId AND ss.status = :currentStatus AND ss.isActive = true")
    School_subscriptions findBySubscriptionAndStatus(@Param("subscriptionId") Long subscriptionId,
            @Param("currentStatus") String currentStatus);

    @Query("SELECT ss FROM School_subscriptions ss WHERE  ss.status = : status AND ss.isActive = true")
    List<School_subscriptions> findAllByStatus(@Param("status") String status);

    @Query("SELECT ss FROM School_subscriptions ss WHERE ss.school = :schoolExists AND ss.status = : status AND ss.isActive = true")
    School_subscriptions findBySchoolAndStatus(@Param("school") School schoolExists,@Param("status") String status);

    @Query("SELECT ss FROM School_subscriptions ss WHERE ss.school = :schoolExists AND ss.subscription_id = :subscriptionId AND ss.status = : status  AND ss.isActive = true")
    School_subscriptions findBySchoolAndStatusAndId(@Param("school") School schoolExists,@Param("status") String status,@Param("subscriptionId") Long subscriptionId);
}
