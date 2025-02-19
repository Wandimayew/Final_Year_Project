package com.schoolmanagement.academic_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.academic_service.model.Subject;

@Repository
public interface SubjectRepository extends JpaRepository<Subject,Long> {

    @Query("SELECT s FROM Subject s WHERE s.schoolId = :schoolId AND s.subjectId = :subjectId AND s.isActive = true")
    Subject findBySchoolAndSubjectId(@Param("schoolId") String schoolId,@Param("subjectId") Long subjectId);

    @Query("SELECT s FROM Subject s WHERE s.schoolId = :schoolId AND s.isActive = true")
    List<Subject> findAllSchoolSubjectsThatIsActive(@Param("schoolId") String schoolId);

    @Query("SELECT s FROM Subject s JOIN s.classList c JOIN c.stream st WHERE st.streamId = :streamId AND s.schoolId = :schoolId AND s.isActive = true")
    List<Subject> findAllSchoolSubjectsByStreamThatIsActive(String schoolId, Long streamId);

    // Query to find all active subjects by class
    @Query("SELECT s FROM Subject s JOIN s.classList c WHERE c.classId = :classId AND s.schoolId = :schoolId AND s.isActive = true")
    List<Subject> findAllSchoolSubjectsByClassThatIsActive(String schoolId, Long classId);
   
}
