package com.schoolmanagement.User_Service.service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import javax.naming.AuthenticationException;

import org.apache.coyote.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.schoolmanagement.User_Service.config.JwtUtils;
import com.schoolmanagement.User_Service.dto.JwtResponse;
import com.schoolmanagement.User_Service.dto.LoginRequest;
import com.schoolmanagement.User_Service.dto.SignupRequest;
import com.schoolmanagement.User_Service.model.Role;
import com.schoolmanagement.User_Service.model.User;
import com.schoolmanagement.User_Service.repository.RoleRepository;
import com.schoolmanagement.User_Service.repository.UserRepository;
import com.schoolmanagement.User_Service.file.FileStorageService;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final FileStorageService fileStorageService;

    @Autowired
    private JwtUtils jwtUtils;

    public JwtResponse authenticateUser(LoginRequest loginRequest) throws AuthenticationException {
        User user = userRepository.findByUsername(loginRequest.getUsername())
            .orElseThrow(() -> new AuthenticationException("Invalid username or password"));
    
        // Check if user is active
        if (!user.getIsActive()) {
            throw new AuthenticationException("Account is inactive");
        }
    
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new AuthenticationException("Invalid username or password");
        }
    
        String jwt = jwtUtils.generateJwtToken(user);
        List<String> roles = user.getRoles().stream()
            .map(Role::getName)
            .collect(Collectors.toList());

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        return JwtResponse.builder()
            .token(jwt)
            .userId(user.getUserId())
            .schoolId(user.getSchoolId())
            .username(user.getUsername())
            .email(user.getEmail())
            .roles(roles)
            .message("Login successful") 
            .build();
    }
    
    public User registerUser(SignupRequest signupRequest) {
        if (userRepository.existsByUsername(signupRequest.getUsername())) {
             new BadRequestException("Username is already taken");
        }

        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            new BadRequestException("Email is already in use");
        }

        User user = new User();
        user.setSchoolId(signupRequest.getSchoolId());
        user.setUsername(signupRequest.getUsername());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setFullName(signupRequest.getFullName());
        user.setUserAddress(signupRequest.getUserAddress());
        user.setPhoneNumber(signupRequest.getPhoneNumber());
        user.setIsActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setCreatedBy("admin");

        Set<Role> roles = new HashSet<>();
        if (signupRequest.getRoles() == null || signupRequest.getRoles().isEmpty()) {
            Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new RuntimeException("Default role not found"));
            roles.add(userRole);
        } else {
            signupRequest.getRoles().forEach(roleName -> {
                Role role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));
                roles.add(role);
            });
        }

        user.setRoles(roles);
        userRepository.save(user);
        return user;
      
    }

    //  public void uploadUserPhoto(MultipartFile file, Long userId) {
    //     User user = userRepository.findById(userId)
    //             .orElseThrow(() -> new EntityNotFoundException("No user found with ID:: " + userId));
    //     var photo = fileStorageService.saveFile(file, userId);
    //     user.setUserPhoto(photo);
    //     userRepository.save(user);
    // }

    
}