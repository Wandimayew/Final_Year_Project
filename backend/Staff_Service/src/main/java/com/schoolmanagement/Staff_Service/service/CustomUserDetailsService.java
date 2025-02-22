// package com.schoolmanagement.Staff_Service.service;

// import java.util.ArrayList;
// import java.util.Collection;
// import java.util.List;

// import org.springframework.security.core.GrantedAuthority;
// import org.springframework.security.core.authority.SimpleGrantedAuthority;
// import org.springframework.security.core.userdetails.User;
// import org.springframework.security.core.userdetails.UserDetails;
// import org.springframework.security.core.userdetails.UserDetailsService;
// import
// org.springframework.security.core.userdetails.UsernameNotFoundException;
// import org.springframework.stereotype.Service;

// import com.schoolmanagement.Staff_Service.enums.Role;
// import com.schoolmanagement.Staff_Service.model.Staff;
// import com.schoolmanagement.Staff_Service.repository.StaffRepository;

// import lombok.RequiredArgsConstructor;

// @Service
// @RequiredArgsConstructor
// public class CustomUserDetailsService implements UserDetailsService {

// private final StaffRepository staffRepository;

// @Override
// public UserDetails loadUserByUsername(String username) throws
// UsernameNotFoundException {
// Staff staff = staffRepository.findByUsernameAndIsActiveTrue(username)
// .orElseThrow(() -> new UsernameNotFoundException("User not found with
// username: " + username));

// return User.builder()
// .username(staff.getUsername())
// .password(staff.getPassword())
// .disabled(!staff.getIsActive())
// .accountExpired(false)
// .credentialsExpired(false)
// .accountLocked(false)
// .authorities(getAuthorities(staff.getRole()))
// .build();
// }

// private Collection<? extends GrantedAuthority> getAuthorities(Role role) {
// List<GrantedAuthority> authorities = new ArrayList<>();
// authorities.add(new SimpleGrantedAuthority("ROLE_STAFF"));

// if ("PRINCIPAL".equals(role) || "ADMINISTRATOR".equals(role) ||
// "TEACHER".equals(role)) {
// authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
// }

// return authorities;
// }
// }