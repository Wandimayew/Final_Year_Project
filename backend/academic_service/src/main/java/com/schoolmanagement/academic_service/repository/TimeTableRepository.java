package com.schoolmanagement.academic_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.academic_service.model.TimeTable;

@Repository
public interface TimeTableRepository  extends JpaRepository<TimeTable,Long>{

    Iterable<? extends TimeTable> findBySchoolId(String schoolId);
    
}
