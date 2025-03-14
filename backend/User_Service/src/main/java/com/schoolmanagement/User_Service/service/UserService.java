package com.schoolmanagement.User_Service.service;

import com.schoolmanagement.User_Service.dto.SignupRequest;
import com.schoolmanagement.User_Service.dto.UserResponseDTO;
import com.schoolmanagement.User_Service.exception.BadRequestException;
import com.schoolmanagement.User_Service.model.User;
import com.schoolmanagement.User_Service.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public ResponseEntity<UserResponseDTO> updateUser(SignupRequest updatedUserDetails, String userId) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID:: " + userId));
        if (!existingUser.getIsActive()) {
            throw new EntityNotFoundException("Account is inactive");
        }

        // existingUser.setFullName(updatedUserDetails.getFullName() != null ?
        // updatedUserDetails.getFullName() : existingUser.getFullName());
        existingUser.setEmail(
                updatedUserDetails.getEmail() != null ? updatedUserDetails.getEmail() : existingUser.getEmail());
        existingUser.setUsername(updatedUserDetails.getUsername() != null ? updatedUserDetails.getUsername()
                : existingUser.getUsername());
        existingUser.setPassword(
                updatedUserDetails.getPassword() != null ? passwordEncoder.encode(updatedUserDetails.getPassword())
                        : existingUser.getPassword());
        // existingUser.setPhoneNumber(updatedUserDetails.getPhoneNumber() != null ?
        // updatedUserDetails.getPhoneNumber() : existingUser.getPhoneNumber());
        existingUser.setUpdatedAt(LocalDateTime.now());

        // if (updatedUserDetails.getUserPhoto() != null) {
        // uploadUserPhoto(updatedUserDetails.getUserPhoto(), existingUser.getUserId());
        // }

        User updatedUser = userRepository.save(existingUser);
        return ResponseEntity.ok(convertToUserResponse(updatedUser));
    }

    public ResponseEntity<UserResponseDTO> getUserById(String userId) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID:: " + userId));
        if (!existingUser.getIsActive()) {
            throw new EntityNotFoundException("Account is inactive");
        }
        return ResponseEntity.ok(convertToUserResponse(existingUser));
    }

    public ResponseEntity<List<UserResponseDTO>> getUsersByRoles(List<Long> roleId) {
        List<User> users = userRepository.findByRoles(roleId);
        return ResponseEntity.ok(users.stream().map(this::convertToUserResponse).collect(Collectors.toList()));

    }

    public ResponseEntity<String> deleteUserById(String userId) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID:: " + userId));

        existingUser.setIsActive(false);
        userRepository.save(existingUser);
        return ResponseEntity.ok("User with id " + existingUser.getUserId() + " deleted successfully.");
    }

    public ResponseEntity<List<UserResponseDTO>> getUsersBySchool(String schoolId) {
        List<User> users = userRepository.findBySchoolId(schoolId);
        return ResponseEntity.ok(users.stream().map(this::convertToUserResponse).collect(Collectors.toList()));

    }

    // public void uploadUserPhoto(MultipartFile file, Long userId) {
    // User user = userRepository.findById(userId)
    // .orElseThrow(() -> new EntityNotFoundException("No user found with ID:: " +
    // userId));

    // var photoPath = fileStorageService.saveFile(file, userId);
    // user.setUserPhoto(photoPath);
    // userRepository.save(user);
    // }
    public ResponseEntity<UserResponseDTO> changePassword(String userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(convertToUserResponse(updatedUser));
    }

    private UserResponseDTO convertToUserResponse(User user) {
        return UserResponseDTO.builder()
                .userId(user.getUserId())
                .schoolId(user.getSchoolId())
                .username(user.getUsername())
                .email(user.getEmail())
                .roles(user.getRoles())
                .isActive(user.getIsActive())
                .lastLogin(user.getLastLogin())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    public String getEmailByUserId(String schoolId, String userId) {
        User existingUser = userRepository.findBySchoolAndUserId("new", userId);

        if (existingUser == null) { // Check if the existingUser is null
            log.info("User not found for id {}", userId);
            return null; // Or throw an exception if desired
        }

        return existingUser.getEmail();
    }

    public List<String> getUserIdsByRole(String role, String schoolId) {
        log.info("school id {} and role name {}", schoolId, role);
        List<User> users = userRepository.findByRoleAndSchoolId(role, schoolId);
    
        log.info("response from repository {}", users);
    
        return users.stream()
            .map(user -> String.format("ID: %s, Email: %s", user.getUserId(), user.getEmail()))
            .collect(Collectors.toList());
    }
    
    
}