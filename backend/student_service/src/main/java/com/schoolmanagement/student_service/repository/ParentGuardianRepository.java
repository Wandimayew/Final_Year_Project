package com.schoolmanagement.student_service.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.student_service.model.ParentGuardian;

@Repository
public interface ParentGuardianRepository extends JpaRepository<ParentGuardian, Long> {
    Optional<ParentGuardian> findByPhoneNumberOrEmail(String phoneNumber, String email);
}