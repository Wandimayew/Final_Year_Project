package com.schoolmanagement.communication_service.repository;

import com.schoolmanagement.communication_service.model.CommunicationPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommunicationPreferenceRepository extends JpaRepository<CommunicationPreference, Long> {

        @Query("SELECT cp FROM CommunicationPreference cp WHERE cp.schoolId = :schoolId AND cp.isActive = true")
        List<CommunicationPreference> findBySchoolId(@Param("schoolId") String schoolId);

        @Query("SELECT cp FROM CommunicationPreference cp WHERE cp.schoolId = :schoolId AND cp.userId IN :userIds AND cp.isActive = true")
        List<CommunicationPreference> findBySchoolIdAndUserIdIn(@Param("schoolId") String schoolId,
                        @Param("userIds") List<String> userIds);

        @Query("SELECT cp FROM CommunicationPreference cp WHERE cp.schoolId = :schoolId AND cp.userId = :userId AND cp.isActive = true")
        Optional<CommunicationPreference> findBySchoolIdAndUserId(@Param("schoolId") String schoolId,
                        @Param("userId") String userId);

}