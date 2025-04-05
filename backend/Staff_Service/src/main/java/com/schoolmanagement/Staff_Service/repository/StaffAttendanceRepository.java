package com.schoolmanagement.Staff_Service.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.Staff_Service.model.StaffAttendance;

@Repository
public interface StaffAttendanceRepository extends JpaRepository<StaffAttendance, Long> {
    @Query("SELECT sa FROM StaffAttendance sa WHERE sa.staff.id = :staffId AND sa.date BETWEEN :startDate AND :endDate")
    List<StaffAttendance> findByStaffIdAndDateBetween(@Param("staffId") Long staffId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    List<StaffAttendance> findBySchoolIdAndDate(String schoolId, LocalDate date);
    
    @Query("SELECT sa FROM StaffAttendance sa WHERE sa.staff.id = :staffId " + "AND sa.date BETWEEN :startDate AND :endDate")
    List<StaffAttendance> findAttendanceHistory(@Param("staffId") Long staffId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    boolean existsByStaff_StaffIdAndDate(Long staffId, LocalDate date);
}
