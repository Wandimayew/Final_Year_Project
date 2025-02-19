package com.schoolmanagement.academic_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.schoolmanagement.academic_service.model.Class;

@Repository
public interface ClassRepository extends JpaRepository<Class, Long> {

    @Query("SELECT c FROM Class c LEFT JOIN c.subjectList s WHERE c.schoolId = :schoolId AND c.isActive = true")
    List<Class> findAllSchoolClassesThatIsActive(@Param("schoolId") String schoolId);

    @Query("SELECT c FROM Class c WHERE c.schoolId = :schoolId AND c.classId = :classId AND c.isActive=true")
    Class findBySchoolAndClassId(@Param("schoolId") String schoolId,
            @Param("classId") Long classId);

    @Query("SELECT c FROM Class c JOIN c.stream s WHERE c.schoolId = :schoolId AND s.streamId = :streamId AND c.isActive = true")
    List<Class> findAllSchoolClassesByStreamThatIsActive(@Param("schoolId") String schoolId,
            @Param("streamId") Long streamId);

    // @Query("""
    // SELECT c
    // FROM Class c
    // JOIN c.sections s
    // JOIN c.stream st
    // JOIN c.subjectList subj
    // WHERE c.schoolId = :schoolId
    // AND c.classId = :classId
    // AND c.isActive = true
    // AND s.isActive = true
    // AND st.isActive = true
    // AND subj.isActive = true
    // """)
    // Class findBySchoolAndClassId(
    // @Param("schoolId") String schoolId,
    // @Param("classId") Long classId);

    // @Query("""
    // SELECT c
    // FROM Class c
    // WHERE c.schoolId = :schoolId
    // AND c.classId = :classId
    // AND c.isActive = true
    // AND EXISTS (
    // SELECT 1
    // FROM c.sections s
    // WHERE s.isActive = true
    // )
    // AND EXISTS (
    // SELECT 1
    // FROM c.stream st
    // WHERE st.isActive = true
    // )
    // AND EXISTS (
    // SELECT 1
    // FROM c.subjectList subj
    // WHERE subj.isActive = true
    // )
    // """)
    // Class findBySchoolAndClassId(
    // @Param("schoolId") String schoolId,
    // @Param("classId") Long classId);

    // @Query("""
    // SELECT c
    // FROM Class c
    // JOIN c.sections s ON s.isActive = true
    // JOIN c.stream st ON st.isActive = true
    // JOIN c.subjectList subj ON subj.isActive = true
    // WHERE c.schoolId = :schoolId
    // AND c.classId = :classId
    // AND c.isActive = true
    // """)
    // Class findBySchoolAndClassId(
    // @Param("schoolId") String schoolId,
    // @Param("classId") Long classId);

    @Query("""
            SELECT DISTINCT c
            FROM Class c
            LEFT JOIN FETCH c.sections s
            LEFT JOIN FETCH c.stream st
            LEFT JOIN FETCH c.subjectList subj
            WHERE c.schoolId = :schoolId
            AND c.classId = :classId
            AND c.isActive = true
            AND s.isActive = true
            AND st.isActive = true
            AND subj.isActive = true
            """)
    Class findClassDetailsBySchoolAndClassId(
            @Param("schoolId") String schoolId,
            @Param("classId") Long classId);

    // @Query("""
    // SELECT DISTINCT c
    // FROM Class c
    // JOIN c.sections s ON s.isActive = true
    // JOIN c.stream st ON st.isActive = true
    // JOIN c.subjectList subj ON subj.isActive = true
    // WHERE c.schoolId = :schoolId
    // AND c.classId = :classId
    // AND c.isActive = true
    // """)
    // Class findBySchoolAndClassId(
    // @Param("schoolId") String schoolId,
    // @Param("classId") Long classId);

}