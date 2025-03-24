package com.schoolmanagement.User_Service.service;

import com.schoolmanagement.User_Service.dto.JwtResponse;
import com.schoolmanagement.User_Service.dto.LoginRequest;
import com.schoolmanagement.User_Service.dto.SignupRequest;
import com.schoolmanagement.User_Service.dto.SignupResponse;
import com.schoolmanagement.User_Service.dto.UserLoginActivityDTO;
import com.schoolmanagement.User_Service.model.Role;
import com.schoolmanagement.User_Service.model.User;
import com.schoolmanagement.User_Service.repository.RoleRepository;
import com.schoolmanagement.User_Service.repository.UserRepository;
import com.schoolmanagement.User_Service.utils.JwtUtil;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final SchoolPermissionService schoolPermissionService;

    @Transactional
    public JwtResponse authenticateUser(LoginRequest loginRequest) throws AuthenticationException {
        log.info("Authenticating user: {}", loginRequest.getUsername());
        Authentication auth;
        try {
            auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));
            SecurityContextHolder.getContext().setAuthentication(auth);
        } catch (BadCredentialsException e) {
            log.error("Bad credentials for user: {}", loginRequest.getUsername(), e);
            throw new AuthenticationException("Invalid username or password") {
            };
        } catch (AuthenticationException e) {
            log.error("Authentication failed for user: {}", loginRequest.getUsername(), e);
            throw e;
        }

        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new AuthenticationException("User not found") {
                });

        log.info("User fetched from repository: {}", user);

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        String token = jwtUtils.generateJwtToken(user);
        List<String> roleNames = jwtUtils.extractRoles(token);

        log.info("User {} authenticated successfully with roles: {}", loginRequest.getUsername(), roleNames);
        return JwtResponse.builder()
                .token(token)
                .userId(user.getUserId())
                .schoolId(user.getSchoolId())
                .username(user.getUsername())
                .email(user.getEmail())
                .roles(roleNames)
                .message("Login successful")
                .build();
    }

    @Transactional
    public SignupResponse registerUser(SignupRequest signupRequest, String userId) {
        log.info("Registering user with username: {} for schoolId: {}", signupRequest.getUsername(),
                signupRequest.getSchoolId());

        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            log.info("Username is already taken: {}", signupRequest.getUsername());
            throw new RuntimeException("Username is already taken: " + signupRequest.getUsername());
        }
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            log.info("Email is already in use: {}", signupRequest.getEmail());
            throw new RuntimeException("Email is already in use: " + signupRequest.getEmail());
        }

        String newUserId = generateUserId(signupRequest.getSchoolId());
        log.info("New user ID is: {}", newUserId);

        User user = new User();
        user.setUserId(newUserId);
        user.setSchoolId(signupRequest.getSchoolId());
        user.setUsername(signupRequest.getUsername());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setIsActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setCreatedBy(userId);

        // Assign default role (ROLE_STUDENT by default, unless specified)
        String defaultRole = signupRequest.getRoles() == null || signupRequest.getRoles().isEmpty()
                ? "ROLE_STUDENT"
                : signupRequest.getRoles().iterator().next();
        schoolPermissionService.assignDefaultRoleToUser(user, defaultRole, signupRequest.getSchoolId(),
                userRepository.findByUserId(userId).orElseThrow());

        User savedUser = userRepository.save(user);
        log.info("User registered with ID: {} for schoolId: {}", newUserId, signupRequest.getSchoolId());

        return SignupResponse.builder()
                .userId(savedUser.getUserId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .schoolId(savedUser.getSchoolId())
                .roles(savedUser.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                .build();
    }

    @Transactional
    public SignupResponse registerAdmin(SignupRequest signupRequest, String superadminUserId) {
        log.info("Registering Admin with username: {} for schoolId: {}", signupRequest.getUsername(),
                signupRequest.getSchoolId());

        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            log.info("Username is already taken: {}", signupRequest.getUsername());
            throw new RuntimeException("Username is already taken: " + signupRequest.getUsername());
        }
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            log.info("Email is already in use: {}", signupRequest.getEmail());
            throw new RuntimeException("Email is already in use: " + signupRequest.getEmail());
        }

        String newUserId = generateUserId(signupRequest.getSchoolId());
        log.info("New user ID is: {}", newUserId);

        User admin = new User();
        admin.setUserId(newUserId);
        admin.setSchoolId(signupRequest.getSchoolId());
        admin.setUsername(signupRequest.getUsername());
        admin.setEmail(signupRequest.getEmail());
        admin.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        admin.setIsActive(true);
        admin.setCreatedAt(LocalDateTime.now());
        admin.setUpdatedAt(LocalDateTime.now());
        admin.setCreatedBy(superadminUserId);

        User superadmin = userRepository.findByUserId(superadminUserId)
                .orElseThrow(() -> new RuntimeException("Superadmin not found: " + superadminUserId));

        log.info("super admin is found : {}", superadmin);
        // Create default permissions and roles for the school if not already created

        log.info("Assign Roles ROLE_ADMIN admin");
        User savedAdmin = userRepository.save(admin);

        log.info("user saved and entering create role :{}", savedAdmin);

        if (!roleRepository.existsBySchoolId(signupRequest.getSchoolId())) {
            log.info("creating role for school");
            schoolPermissionService.createDefaultPermissionsAndRoles(signupRequest.getSchoolId(), superadmin,
                    savedAdmin);
        }
        log.info("created role for school");

        log.info("assignDefaultRoleToUser");
        schoolPermissionService.assignDefaultRoleToUser(savedAdmin, "ROLE_ADMIN", signupRequest.getSchoolId(),
                superadmin);
        log.info("after assignDefaultRoleToUser");

        // Assign ROLE_ADMIN to the new admin

        log.info("Admin registered with ID: {} for schoolId: {}", newUserId, signupRequest.getSchoolId());

        return SignupResponse.builder()
                .userId(savedAdmin.getUserId())
                .username(savedAdmin.getUsername())
                .email(savedAdmin.getEmail())
                .schoolId(savedAdmin.getSchoolId())
                .roles(savedAdmin.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                .build();
    }

    private String generateUserId(String schoolId) {
        String lastUserId = userRepository
                .findTopUserIdBySchoolId(schoolId, PageRequest.of(0, 1))
                .stream()
                .findFirst()
                .orElse(null);

        int nextNumber = 1;
        if (lastUserId != null && lastUserId.startsWith(schoolId)) {
            String numberPart = lastUserId.substring(schoolId.length());
            try {
                nextNumber = Integer.parseInt(numberPart) + 1;
            } catch (NumberFormatException e) {
                log.warn("Failed to parse number part from lastUserId '{}'. Defaulting to 1.", lastUserId);
            }
        }

        return schoolId + String.format("%03d", nextNumber);
    }



    @Transactional
    public List<UserLoginActivityDTO> getAllLoginActivity(String schoolId) {
        List<User> userActivity= userRepository.findBySchoolId(schoolId);

        if (userActivity.isEmpty()) {
            throw new EntityNotFoundException("No user Found with in your school " + schoolId);
        }

        List<UserLoginActivityDTO> activityList = userActivity.stream()
                .map(user -> new UserLoginActivityDTO(
                        user.getUserId(),
                        user.getUsername(),
                        user.getLastLogin() != null ? user.getLastLogin().toString() : null,
                        user.getSchoolId()
                ))
                .sorted(Comparator.comparing(
                        UserLoginActivityDTO::getLastLogin,
                        Comparator.nullsLast(Comparator.reverseOrder()) // Newest first, nulls last
                ))
                .collect(Collectors.toList());

        return   activityList;
    }
}