package com.schoolmanagement.User_Service.service;

import com.schoolmanagement.User_Service.dto.SignupRequest;
import com.schoolmanagement.User_Service.dto.UserResponseDTO;
import com.schoolmanagement.User_Service.exception.BadRequestException;
import com.schoolmanagement.User_Service.model.Role;
import com.schoolmanagement.User_Service.model.User;
import com.schoolmanagement.User_Service.repository.RoleRepository;
import com.schoolmanagement.User_Service.repository.UserRepository;
import com.schoolmanagement.User_Service.file.FileStorageService;
import com.schoolmanagement.User_Service.file.FileUtils;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final FileStorageService fileStorageService;
    private final PasswordEncoder passwordEncoder;

    public ResponseEntity<UserResponseDTO> registerUser(@Valid SignupRequest signupRequest) {
        // Validate unique username and email
        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            log.error("Username is already taken");
            return ResponseEntity.badRequest().body(null);
        }

        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            log.error("Email is already in use");
            return ResponseEntity.badRequest().body(null);
        }

        // Create user and set properties
        User user = User.builder()
                .schoolId(signupRequest.getSchoolId())
                .username(signupRequest.getUsername())
                .email(signupRequest.getEmail())
                .password(passwordEncoder.encode(signupRequest.getPassword()))
                .fullName(signupRequest.getFullName())
                .userAddress(signupRequest.getUserAddress())
                .phoneNumber(signupRequest.getPhoneNumber())
                .gender(signupRequest.getGender())
                .isActive(true)
                .lastLogin(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // Assign roles to user
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

        // Upload user photo if provided
        if (signupRequest.getUserPhoto() != null) {
            uploadUserPhoto(signupRequest.getUserPhoto(), user.getUserId());
        }

        // Save user to the database
        User savedUser = userRepository.save(user);

        return ResponseEntity.ok(convertToUserResponse(savedUser));
    }

    public ResponseEntity<UserResponseDTO> updateUser(SignupRequest updatedUserDetails, Long userId) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID:: " + userId));

        existingUser.setFullName(updatedUserDetails.getFullName() != null ? updatedUserDetails.getFullName() : existingUser.getFullName());
        existingUser.setEmail(updatedUserDetails.getEmail() != null ? updatedUserDetails.getEmail() : existingUser.getEmail());
        existingUser.setPhoneNumber(updatedUserDetails.getPhoneNumber() != null ? updatedUserDetails.getPhoneNumber() : existingUser.getPhoneNumber());
        existingUser.setGender(updatedUserDetails.getGender() != null ? updatedUserDetails.getGender() : existingUser.getGender());
        existingUser.setUpdatedAt(LocalDateTime.now());

        if (updatedUserDetails.getUserPhoto() != null) {
            uploadUserPhoto(updatedUserDetails.getUserPhoto(), existingUser.getUserId());
        }

        User updatedUser = userRepository.save(existingUser);
        return ResponseEntity.ok(convertToUserResponse(updatedUser));
    }

    public ResponseEntity<UserResponseDTO> getUserById(Long userId) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID:: " + userId));

        return ResponseEntity.ok(convertToUserResponse(existingUser));
    }

    public ResponseEntity<List<User>> getUsersByRoles(List<Long> roleId) {
        List<User> users = userRepository.findByRoles(roleId);
        return ResponseEntity.ok(users);
    }

    public ResponseEntity<Void> deleteUserById(Long userId) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID:: " + userId));

        existingUser.setIsActive(false);
        userRepository.save(existingUser);
        return ResponseEntity.noContent().build();
    }

    public ResponseEntity<List<User>> getUsersBySchool(Long schoolId) {
        List<User> users = userRepository.findBySchoolId(schoolId);
        return ResponseEntity.ok(users);
    }


    public void uploadUserPhoto(MultipartFile file, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("No user found with ID:: " + userId));

        var photoPath = fileStorageService.saveFile(file, userId);
        user.setUserPhoto(photoPath);
        userRepository.save(user);
    }
    public ResponseEntity<User> changePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
             new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(updatedUser);
    }

    private UserResponseDTO convertToUserResponse(User user) {
        return UserResponseDTO.builder()
                .userId(user.getUserId())
                .schoolId(user.getSchoolId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .userAddress(user.getUserAddress())
                .phoneNumber(user.getPhoneNumber())
                .gender(user.getGender())
                .roles(user.getRoles())
                .isActive(user.getIsActive())
                .userPhoto(FileUtils.readFileFromLocation(user.getUserPhoto()))
                .lastLogin(user.getLastLogin())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
