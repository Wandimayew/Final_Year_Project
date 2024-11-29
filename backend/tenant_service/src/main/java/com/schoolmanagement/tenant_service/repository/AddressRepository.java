package com.schoolmanagement.tenant_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.schoolmanagement.tenant_service.model.Address;
import com.schoolmanagement.tenant_service.model.School;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {

    @Query("SELECT a FROM Address a WHERE a.address_id = :address_id AND a.isActive = true")
    Address findByAddress_id(@Param("address_id") Long address_id);

    // Corrected query for finding all active addresses for a given school
    @Query("SELECT a FROM Address a WHERE a.school = :school AND a.isActive = true")
    List<Address> findAllSchoolAddressThatIsActive(@Param("school") School school);

    @Query("SELECT a FROM Address a WHERE a.school = :school AND a.address_id = :address_id AND a.isActive = true")
    Address findBySchoolAndAddressId(@Param("school") School school, @Param("address_id") Long address_id);
}
