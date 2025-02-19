package com.schoolmanagement.academic_service.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.academic_service.model.Section;

@Repository
public interface SectionRepository extends JpaRepository<Section, Long> {

    @Query("SELECT s FROM Section s WHERE s.schoolId = :schoolId AND s.isActive = true")
    List<Section> findAllSchoolSectionesThatIsActive(@Param("schoolId") String schoolId);

    @Query("SELECT s FROM Section s JOIN s.classId c WHERE s.schoolId = :schoolId AND s.isActive = true AND c.isActive = true AND c.classId = :classId")
    List<Section> findAllActiveSectionsForClass(@Param("schoolId") String schoolId, @Param("classId") Long classId);

    @Query("SELECT s FROM Section s JOIN s.classId c WHERE s.sectionId = :sectionId AND s.schoolId = :schoolId AND s.isActive = true AND c.isActive = true AND c.classId = :classId")
    Optional<Section> findSingleActiveSectionWithActiveClass(
            @Param("schoolId") String schoolId,
            @Param("classId") Long classId,
            @Param("sectionId") Long sectionId);
        
    @Query("SELECT s FROM Section s WHERE s.schoolId = :schoolId AND s.sectionId = :sectionId AND s.isActive = true")
    Section findBySchoolAndSectionId(@Param("schoolId") String schoolId, @Param("sectionId") Long sectionId);

}
