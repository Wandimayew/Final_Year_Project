package com.schoolmanagement.academic_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.academic_service.model.Stream;

@Repository
public interface StreamRepository extends JpaRepository<Stream,Long>{

    @Query("SELECT s FROM Stream s WHERE s.schoolId = :schoolId AND s.streamId = :streamId AND s.isActive = true")
    Stream findBySchoolAndStreamId(@Param("schoolId") String schoolId,@Param("streamId") Long streamId);

    @Query("SELECT s FROM Stream s WHERE s.schoolId = :schoolId AND s.isActive = true")
    List<Stream> findAllSchoolStreamsThatIsActive(@Param("schoolId") String schoolId);

    
}
