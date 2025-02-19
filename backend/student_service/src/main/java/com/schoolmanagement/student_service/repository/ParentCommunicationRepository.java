package com.schoolmanagement.student_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.student_service.model.ParentCommunication;

@Repository
public interface ParentCommunicationRepository extends JpaRepository<ParentCommunication, Long> {
}
