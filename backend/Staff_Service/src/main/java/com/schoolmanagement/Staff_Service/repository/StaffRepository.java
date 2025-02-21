
package com.schoolmanagement.Staff_Service.repository;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.Staff_Service.model.Staff;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {
    Optional<Staff> findByUsername(String username);
    Optional<Staff> findByEmail(String email);
    Optional<Staff> findByStaffId(Long staffId);
    List<Staff> findBySchoolId(Long schoolId);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByStaffId(Long staffId);
    Optional<Staff> findByUsernameAndIsActiveTrue(String username);

    @Query("SELECT s FROM Staff s WHERE s.isActive = true")
    List<Staff> findAllStaffThatIsActive();
    boolean existsByPhoneNumber(String phoneNumber);
     
}