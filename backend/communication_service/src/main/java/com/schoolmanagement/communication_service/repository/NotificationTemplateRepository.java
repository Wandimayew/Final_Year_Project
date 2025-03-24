package com.schoolmanagement.communication_service.repository;

import com.schoolmanagement.communication_service.enums.NotificationType;
import com.schoolmanagement.communication_service.model.NotificationTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationTemplateRepository extends JpaRepository<NotificationTemplate, Long> {

        @Query("SELECT nt FROM NotificationTemplate nt WHERE nt.schoolId = :schoolId AND nt.isActive = true")
        List<NotificationTemplate> findBySchoolId(@Param("schoolId") String schoolId);

        @Query("SELECT nt FROM NotificationTemplate nt WHERE nt.notificationTemplateId = :notificationTemplateId AND nt.schoolId = :schoolId AND nt.isActive = true")
        Optional<NotificationTemplate> findBySchoolAndTemplateId(@Param("schoolId") String schoolId,
                        @Param("notificationTemplateId") Long notificationTemplateId);

        @Query("SELECT nt FROM NotificationTemplate nt WHERE nt.name = :name AND nt.schoolId = :schoolId AND nt.isActive = true")
        Optional<NotificationTemplate> findByNameAndSchoolId(@Param("name") String name,
                        @Param("schoolId") String schoolId);

        @Query("SELECT nt FROM NotificationTemplate nt WHERE nt.type = :type AND nt.schoolId = :schoolId AND nt.isActive = true")
        List<NotificationTemplate> findByTypeAndSchoolId(@Param("type") NotificationType type,
                        @Param("schoolId") String schoolId);
}