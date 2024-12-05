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
import java.util.stream.Collectors;

import javax.naming.AuthenticationException;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final FileStorageService fileStorageService;
    private final PasswordEncoder passwordEncoder;

    public ResponseEntity<UserResponseDTO> updateUser(SignupRequest updatedUserDetails, Long userId) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID:: " + userId));
        if(!existingUser.getIsActive()){
         throw new EntityNotFoundException("Account is inactive");
        }

        existingUser.setFullName(updatedUserDetails.getFullName() != null ? updatedUserDetails.getFullName() : existingUser.getFullName());
        existingUser.setEmail(updatedUserDetails.getEmail() != null ? updatedUserDetails.getEmail() : existingUser.getEmail());
        existingUser.setPhoneNumber(updatedUserDetails.getPhoneNumber() != null ? updatedUserDetails.getPhoneNumber() : existingUser.getPhoneNumber());
        existingUser.setUpdatedAt(LocalDateTime.now());

        // if (updatedUserDetails.getUserPhoto() != null) {
        //     uploadUserPhoto(updatedUserDetails.getUserPhoto(), existingUser.getUserId());
        // }

        User updatedUser = userRepository.save(existingUser);
        return ResponseEntity.ok(convertToUserResponse(updatedUser));
    }

    public ResponseEntity<UserResponseDTO> getUserById(Long userId) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID:: " + userId));
                if(!existingUser.getIsActive()){
                    throw new EntityNotFoundException("Account is inactive");
                   }
        return ResponseEntity.ok(convertToUserResponse(existingUser));
    }

    public ResponseEntity<List<UserResponseDTO>> getUsersByRoles(List<Long> roleId) {
        List<User> users = userRepository.findByRoles(roleId);
                return ResponseEntity.ok(users.stream().map(this::convertToUserResponse).collect(Collectors.toList()));

    }

    public ResponseEntity<String> deleteUserById(Long userId) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID:: " + userId));

        existingUser.setIsActive(false);
        userRepository.save(existingUser);
        return ResponseEntity.ok("User with id " + existingUser.getUserId()+ " deleted successfully.");
    }

    public ResponseEntity<List<UserResponseDTO>> getUsersBySchool(Long schoolId) {
        List<User> users = userRepository.findBySchoolId(schoolId);
        return ResponseEntity.ok(users.stream().map(this::convertToUserResponse).collect(Collectors.toList()));

    }


    // public void uploadUserPhoto(MultipartFile file, Long userId) {
    //     User user = userRepository.findById(userId)
    //             .orElseThrow(() -> new EntityNotFoundException("No user found with ID:: " + userId));

    //     var photoPath = fileStorageService.saveFile(file, userId);
    //     user.setUserPhoto(photoPath);
    //     userRepository.save(user);
    // }
    public ResponseEntity<UserResponseDTO> changePassword(Long userId, String currentPassword, String newPassword) {
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
                .fullName(user.getFullName())
                .userAddress(user.getUserAddress())
                .phoneNumber(user.getPhoneNumber())
                .roles(user.getRoles())
                .isActive(user.getIsActive())
                .lastLogin(user.getLastLogin())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
