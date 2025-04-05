// now i will give you my controllers and you can make the controller methods and endpoints to be shown for factory
// package com.schoolmanagement.User_Service.controller;

// import com.schoolmanagement.User_Service.config.CustomUserPrincipal;
// import com.schoolmanagement.User_Service.dto.JwtResponse;
// import com.schoolmanagement.User_Service.dto.LoginRequest;
// import com.schoolmanagement.User_Service.dto.SignupRequest;
// import com.schoolmanagement.User_Service.dto.SignupResponse;
// import com.schoolmanagement.User_Service.dto.UserLoginActivityDTO;
// import com.schoolmanagement.User_Service.service.AuthService;

// import jakarta.servlet.http.HttpServletRequest;
// import jakarta.validation.Valid;
// import lombok.RequiredArgsConstructor;

// import java.util.List;

// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.core.AuthenticationException;
// import org.springframework.security.core.context.SecurityContextHolder;
// import org.springframework.web.bind.annotation.*;
// import lombok.extern.slf4j.Slf4j;

// @RestController
// @RequestMapping("/auth/api")
// @RequiredArgsConstructor
// @Slf4j
// public class AuthController {

//     private final AuthService authService;

//     private void validateSchoolId(String schoolId) {
//         CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
//                 .getAuthentication().getPrincipal();
//         String tokenSchoolId = principal.getSchoolId();
//         if (!schoolId.equals(tokenSchoolId)) {
//             log.error("School ID mismatch: Path schoolId={}, Token schoolId={}", schoolId, tokenSchoolId);
//             throw new SecurityException("Unauthorized: School ID mismatch");
//         }
//     }

//     @PostMapping("/login")
//     public ResponseEntity<JwtResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest,
//             HttpServletRequest request) {
//         log.info("Authenticating user: {}", loginRequest.getUsername());
//         try {
//             JwtResponse jwtResponse = authService.authenticateUser(loginRequest, request);
//             return ResponseEntity.ok(jwtResponse);
//         } catch (AuthenticationException e) {
//             log.warn("Authentication failed for user: {} - {}", loginRequest.getUsername(), e.getMessage());
//             return ResponseEntity.badRequest().body(JwtResponse.builder().message(e.getMessage()).build());
//         }
//     }

//     @GetMapping("/{schoolId}/activity")
//     public ResponseEntity<List<UserLoginActivityDTO>> getAllLoginActivity(@PathVariable String schoolId) {
//         validateSchoolId(schoolId);
//         List<UserLoginActivityDTO> activityList = authService.getAllLoginActivity(schoolId);
//         return ResponseEntity.ok(activityList);
//     }

//     @PostMapping("/{schoolId}/register")
//     public ResponseEntity<SignupResponse> registerUser(@Valid @RequestBody SignupRequest signupRequest,
//             @PathVariable String schoolId) {
//         log.info("Registering user with username: {} for schoolId: {}", signupRequest.getUsername(), schoolId);
//         CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
//                 .getAuthentication().getPrincipal();
//         String userId = principal.getUserId();
//         signupRequest.setSchoolId(schoolId);

//         validateSchoolId(schoolId);
//         SignupResponse createdUser = authService.registerUser(signupRequest, userId);
//         log.info("user registration request : {}", signupRequest);
//         return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
//     }

//     @PostMapping("/register")
//     public ResponseEntity<SignupResponse> registerAdmin(@Valid @RequestBody SignupRequest signupRequest) {
//         log.info("Registering admin with username: {} for schoolId: {}", signupRequest.getUsername(),
//                 signupRequest.getSchoolId());
//         CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
//                 .getAuthentication().getPrincipal();
//         String superadminUserId = principal.getUserId();
//         SignupResponse createdAdmin = authService.registerAdmin(signupRequest, superadminUserId);
//         return ResponseEntity.status(HttpStatus.CREATED).body(createdAdmin);
//     }
// }
// package com.schoolmanagement.User_Service.controller;

// import com.schoolmanagement.User_Service.dto.PasswordResetDto;
// import com.schoolmanagement.User_Service.dto.PasswordResetRequestDto;
// import com.schoolmanagement.User_Service.dto.PendingPasswordResetResponse;
// import com.schoolmanagement.User_Service.service.PasswordResetService;
// import jakarta.servlet.http.HttpServletRequest;
// import jakarta.validation.Valid;
// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.access.prepost.PreAuthorize;
// import org.springframework.web.bind.annotation.*;

// import java.util.List;

// @RestController
// @RequestMapping("/auth/api")
// @RequiredArgsConstructor
// @Slf4j
// public class PasswordResetController {

//     private final PasswordResetService passwordResetService;

//     @PostMapping("/forgot-password")
//     public ResponseEntity<String> forgotPassword(@Valid @RequestBody PasswordResetRequestDto request,
//             HttpServletRequest httpRequest) {
//         log.info("Initiating password reset for email: {}", request.getEmail());
//         passwordResetService.initiatePasswordReset(request.getEmail(), httpRequest);
//         return ResponseEntity
//                 .ok("Password reset request initiated. Check your email if you’re an admin, or wait for approval.");
//     }

//     @PostMapping("/reset-password")
//     public ResponseEntity<String> resetPassword(@Valid @RequestBody PasswordResetDto resetDto,
//             HttpServletRequest request) {
//         log.info("Resetting password with token: {}", resetDto.getToken());
//         passwordResetService.resetPassword(resetDto.getToken(), resetDto.getNewPassword(), request);
//         return ResponseEntity.ok("Password reset successful");
//     }

//     @PostMapping("/approve-password-reset")
//     @PreAuthorize("hasRole('ROLE_ADMIN')")
//     public ResponseEntity<String> approvePasswordReset(
//             @RequestParam String token,
//             @RequestParam String newPassword,
//             HttpServletRequest request) {
//         log.info("Admin approving password reset for token: {}", token);
//         passwordResetService.approvePasswordReset(token, newPassword, request);
//         return ResponseEntity.ok("Password reset approved and email sent to user");
//     }

//     @GetMapping("/pending-password-resets")
//     @PreAuthorize("hasRole('ROLE_ADMIN')")
//     public ResponseEntity<List<PendingPasswordResetResponse>> getPendingPasswordResetRequests() {
//         log.info("Admin fetching pending password reset requests");
//         List<PendingPasswordResetResponse> pendingRequests = passwordResetService.getPendingPasswordResetRequests();
//         return ResponseEntity.ok(pendingRequests);
//     }
// }
// package com.schoolmanagement.User_Service.controller;

// import com.schoolmanagement.User_Service.config.CustomUserPrincipal;
// import com.schoolmanagement.User_Service.dto.PermissionCheckRequest;
// import com.schoolmanagement.User_Service.dto.PermissionCheckResponse;
// import com.schoolmanagement.User_Service.service.PermissionService;
// import com.schoolmanagement.User_Service.utils.JwtUtil;
// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.core.context.SecurityContextHolder;
// import org.springframework.web.bind.annotation.*;

// @RestController
// @RequestMapping("/auth/api/internal")
// @RequiredArgsConstructor
// @Slf4j
// public class PermissionCheckController {

//     private final PermissionService permissionService;
//     private final JwtUtil jwtUtil;

//     private static final String SERVICE_TOKEN = "this-is-me-do-you-remember-me"; // Hardcoded for simplicity; use config
//                                                                                  // in
//     // production

//     /**
//      * Validates the service token provided by the calling service.
//      */
//     private void validateServiceToken(String serviceToken) {
//         if (!SERVICE_TOKEN.equals(serviceToken)) {
//             log.error("Invalid service token: {}", serviceToken);
//             throw new SecurityException("Unauthorized service");
//         }
//     }

//     /**
//      * Validates that the schoolId from the request matches the schoolId in the
//      * authenticated user's context.
//      */
//     private void validateSchoolId(String schoolId) {
//         CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
//                 .getAuthentication().getPrincipal();
//         String tokenSchoolId = principal.getSchoolId();
//         if (!schoolId.equals(tokenSchoolId)) {
//             log.error("School ID mismatch: Request schoolId={}, Token schoolId={}", schoolId, tokenSchoolId);
//             throw new SecurityException("Unauthorized: School ID mismatch");
//         }
//     }

//     @PostMapping("/check-permission")
//     public ResponseEntity<PermissionCheckResponse> checkUserPermission(
//             @RequestBody PermissionCheckRequest request,
//             @RequestHeader("Authorization") String userToken, // User JWT
//             @RequestHeader("X-Service-Token") String serviceToken) { // Service-specific token
//         log.info("Checking permission for userId: {} on endpoint: {} with method: {} in schoolId: {}",
//                 request.getUserId(), request.getEndpoint(), request.getHttpMethod(), request.getSchoolId());

//         // Validate service token first
//         validateServiceToken(serviceToken);

//         // Validate user token
//         String token = userToken.replace("Bearer ", "");
//         if (!jwtUtil.validateToken(token)) {
//             log.warn("Invalid user token for userId: {}", request.getUserId());
//             return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
//                     .body(PermissionCheckResponse.builder()
//                             .userId(request.getUserId())
//                             .endpoint(request.getEndpoint())
//                             .httpMethod(request.getHttpMethod())
//                             .schoolId(request.getSchoolId())
//                             .hasPermission(false)
//                             .build());
//         }

//         // Validate schoolId
//         validateSchoolId(request.getSchoolId());

//         // Check permission using PermissionService
//         boolean hasPermission = permissionService.checkUserPermission(
//                 request.getUserId(), request.getSchoolId(), request.getEndpoint(), request.getHttpMethod());

//         PermissionCheckResponse response = PermissionCheckResponse.builder()
//                 .userId(request.getUserId())
//                 .endpoint(request.getEndpoint())
//                 .httpMethod(request.getHttpMethod())
//                 .schoolId(request.getSchoolId())
//                 .hasPermission(hasPermission)
//                 .build();

//         return ResponseEntity.ok(response);
//     }
// }
// package com.schoolmanagement.User_Service.controller;

// import com.schoolmanagement.User_Service.config.CustomUserPrincipal;
// import com.schoolmanagement.User_Service.dto.PermissionDTO;
// import com.schoolmanagement.User_Service.dto.PermissionRequest;
// import com.schoolmanagement.User_Service.dto.PermissionRoleResponse;
// import com.schoolmanagement.User_Service.model.Permission;
// import com.schoolmanagement.User_Service.service.PermissionService;
// import jakarta.validation.Valid;
// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.core.context.SecurityContextHolder;
// import org.springframework.web.bind.annotation.*;

// import java.util.List;

// @RestController
// @RequestMapping("/auth/api/{schoolId}/permissions")
// @RequiredArgsConstructor
// @Slf4j
// public class PermissionController {

//     private final PermissionService permissionService;

//     /**
//      * Validates that the schoolId from the path matches the schoolId in the
//      * authenticated user's context.
//      */
//     private void validateSchoolId(String schoolId) {
//         CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
//                 .getAuthentication().getPrincipal();
//         String tokenSchoolId = principal.getSchoolId();
//         if (!schoolId.equals(tokenSchoolId)) {
//             log.error("School ID mismatch: Path schoolId={}, Token schoolId={}", schoolId, tokenSchoolId);
//             throw new SecurityException("Unauthorized: School ID mismatch");
//         }
//     }

//     @GetMapping
//     public ResponseEntity<List<PermissionDTO>> getAllPermissions(@PathVariable String schoolId) {
//         log.debug("Fetching all permissions for schoolId: {}", schoolId);
//         validateSchoolId(schoolId);
//         return ResponseEntity.ok(permissionService.getAllPermissions(schoolId));
//     }

//     @GetMapping("/{permissionId}")
//     public ResponseEntity<PermissionDTO> getPermissionById(@PathVariable String schoolId,
//             @PathVariable Long permissionId) {
//         log.debug("Fetching permission with ID: {} for schoolId: {}", permissionId, schoolId);
//         validateSchoolId(schoolId);
//         return ResponseEntity.ok(permissionService.getPermissionById(permissionId, schoolId));
//     }

//     @PostMapping
//     public ResponseEntity<Permission> createPermission(@Valid @RequestBody PermissionRequest permissionRequest,
//             @PathVariable String schoolId) {
//         log.info("Creating permission with name: {} for schoolId: {}", permissionRequest.getName(), schoolId);
//         validateSchoolId(schoolId);
//         CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
//                 .getAuthentication().getPrincipal();
//         String userId = principal.getUserId();
//         return permissionService.createPermission(permissionRequest, schoolId, userId);
//     }

//     @PutMapping("/{permissionId}")
//     public ResponseEntity<Permission> updatePermission(@PathVariable String schoolId, @PathVariable Long permissionId,
//             @Valid @RequestBody PermissionRequest permissionRequest) {
//         log.info("Updating permission with ID: {} for schoolId: {}", permissionId, schoolId);
//         validateSchoolId(schoolId);
//         CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
//                 .getAuthentication().getPrincipal();
//         String userId = principal.getUserId();
//         return permissionService.updatePermission(permissionId, permissionRequest, schoolId, userId);
//     }

//     @DeleteMapping("/{permissionId}")
//     public ResponseEntity<String> deletePermission(@PathVariable String schoolId, @PathVariable Long permissionId) {
//         log.info("Deleting permission with ID: {} for schoolId: {}", permissionId, schoolId);
//         validateSchoolId(schoolId);
//         CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
//                 .getAuthentication().getPrincipal();
//         String userId = principal.getUserId();
//         return permissionService.deletePermission(permissionId, schoolId, userId);
//     }

//     @GetMapping("/name/{name}")
//     public ResponseEntity<Permission> getPermissionByName(@PathVariable String schoolId, @PathVariable String name) {
//         log.debug("Fetching permission with name: {} for schoolId: {}", name, schoolId);
//         validateSchoolId(schoolId);
//         return permissionService.getPermissionByName(name, schoolId);
//     }

//     @GetMapping("/by-role/{roleId}")
//     public ResponseEntity<PermissionRoleResponse> getPermissionByRole(@PathVariable String schoolId,
//             @PathVariable Long roleId) {
//         log.debug("Fetching permission with roleId: {} for schoolId: {}", roleId, schoolId);
//         validateSchoolId(schoolId);
//         return permissionService.getPermissionByRole(roleId, schoolId);
//     }
//     @GetMapping("/by-user/{userId}")
//     public ResponseEntity<PermissionRoleResponse> getPermissionForUser(@PathVariable String schoolId,
//             @PathVariable String userId) {
//         log.debug("Fetching permission with userId: {} for schoolId: {}", userId, schoolId);
//         validateSchoolId(schoolId);
//         return permissionService.getPermissionForUser(userId, schoolId);
//     }
// }
// package com.schoolmanagement.User_Service.controller;

// import com.schoolmanagement.User_Service.dto.AssignPermissionsRequest;
// import com.schoolmanagement.User_Service.dto.RemoveRoleRequest;
// import com.schoolmanagement.User_Service.dto.RoleRequest;
// import com.schoolmanagement.User_Service.model.Role;
// import com.schoolmanagement.User_Service.model.User;
// import com.schoolmanagement.User_Service.service.RoleService;
// import com.schoolmanagement.User_Service.config.CustomUserPrincipal;
// import jakarta.validation.Valid;
// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.core.context.SecurityContextHolder;
// import org.springframework.web.bind.annotation.*;

// import java.util.List;

// @RestController
// @RequestMapping("/auth/api/{schoolId}/roles")
// @RequiredArgsConstructor
// @Slf4j
// public class RoleController {

//     private final RoleService roleService;

//     /**
//      * Validates that the schoolId from the path matches the schoolId in the
//      * authenticated user's context.
//      */
//     private void validateSchoolId(String schoolId) {
//         CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
//                 .getAuthentication().getPrincipal();
//         String tokenSchoolId = principal.getSchoolId();
//         if (!schoolId.equals(tokenSchoolId)) {
//             log.error("School ID mismatch: Path schoolId={}, Token schoolId={}", schoolId, tokenSchoolId);
//             throw new SecurityException("Unauthorized: School ID mismatch");
//         }
//     }

//     @GetMapping("/{roleId}")
//     public ResponseEntity<Role> getRoleById(@PathVariable String schoolId, @PathVariable Long roleId) {
//         log.debug("Fetching role with ID: {} for schoolId: {}", roleId, schoolId);
//         validateSchoolId(schoolId);
//         return roleService.getRoleById(roleId, schoolId);
//     }

//     @GetMapping
//     public ResponseEntity<List<Role>> getAllRoles(@PathVariable String schoolId) {
//         log.debug("Fetching all roles for schoolId: {}", schoolId);
//         validateSchoolId(schoolId);
//         return roleService.getAllRoles(schoolId);
//     }

//     @PostMapping
//     public ResponseEntity<Role> createRole(@Valid @RequestBody RoleRequest roleRequest, @PathVariable String schoolId) {
//         log.info("Creating role with name: {} for schoolId: {}", roleRequest.getName(), schoolId);
//         validateSchoolId(schoolId);
//         CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
//                 .getAuthentication().getPrincipal();
//         String userId = principal.getUserId();
//         return roleService.createRole(roleRequest, userId);
//     }

//     @PutMapping("/{roleId}")
//     public ResponseEntity<Role> updateRole(@PathVariable String schoolId, @PathVariable Long roleId,
//             @Valid @RequestBody RoleRequest roleRequest) {
//         log.info("Updating role with ID: {} for schoolId: {}", roleId, schoolId);
//         validateSchoolId(schoolId);
//         CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
//                 .getAuthentication().getPrincipal();
//         String userId = principal.getUserId();
//         return roleService.updateRole(roleId, roleRequest, schoolId, userId);
//     }

//     @DeleteMapping("/{roleId}")
//     public ResponseEntity<String> deleteRole(@PathVariable String schoolId, @PathVariable Long roleId) {
//         log.info("Deleting role with ID: {} for schoolId: {}", roleId, schoolId);
//         validateSchoolId(schoolId);
//         CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
//                 .getAuthentication().getPrincipal();
//         String userId = principal.getUserId();
//         return roleService.deleteRole(roleId, schoolId, userId);
//     }

//     @PostMapping("/{roleId}/assign/{userId}")
//     public ResponseEntity<User> assignRoleToUser(@PathVariable String schoolId, @PathVariable Long roleId,
//             @PathVariable String userId) {
//         log.info("Assigning role with ID: {} to userId: {} in schoolId: {}", roleId, userId, schoolId);
//         validateSchoolId(schoolId);
//         CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
//                 .getAuthentication().getPrincipal();
//         String updaterUserId = principal.getUserId();
//         return roleService.assignRoleToUser(roleId, userId, schoolId, updaterUserId);
//     }

//     @PostMapping("/assign-permissions")
//     public ResponseEntity<String> assignPermissionsToUserForRole(@PathVariable String schoolId,
//             @Valid @RequestBody AssignPermissionsRequest request) {
//         log.info("Assigning permissions to userId: {} for roleId: {} in schoolId: {}", request.getUserId(),
//                 request.getRoleId(), schoolId);
//         validateSchoolId(schoolId);
//         CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
//                 .getAuthentication().getPrincipal();
//         String updaterUserId = principal.getUserId();
//         return roleService.assignPermissionsToUserForRole(request.getUserId(), request.getRoleId(),
//                 request.getPermissionIds(), schoolId, updaterUserId);
//     }

//     @DeleteMapping("/remove-role")
//     public ResponseEntity<User> removeRoleFromUser(@PathVariable String schoolId,
//             @Valid @RequestBody RemoveRoleRequest request) {
//         log.info("Removing role with ID: {} from userId: {} in schoolId: {}", request.getRoleId(), request.getUserId(),
//                 schoolId);
//         validateSchoolId(schoolId);
//         CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
//                 .getAuthentication().getPrincipal();
//         String updaterUserId = principal.getUserId();
//         return roleService.removeRoleFromUser(request.getUserId(), schoolId, updaterUserId);
//     }
// }
// package com.schoolmanagement.User_Service.controller;

// import com.schoolmanagement.User_Service.config.CustomUserPrincipal;
// import com.schoolmanagement.User_Service.service.SchoolPermissionBootstrapService;
// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.core.context.SecurityContextHolder;
// import org.springframework.web.bind.annotation.*;

// @RestController
// @RequestMapping("/auth/api/internal/schools")
// @RequiredArgsConstructor
// @Slf4j
// public class SchoolPermissionController {

//     private final SchoolPermissionBootstrapService bootstrapService;

//     /**
//      * Validates that the schoolId from the path matches the schoolId in the
//      * authenticated user's context.
//      */
//     private void validateSchoolId(String schoolId) {
//         CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
//                 .getAuthentication().getPrincipal();
//         String tokenSchoolId = principal.getSchoolId();
//         if (!schoolId.equals(tokenSchoolId)) {
//             log.error("School ID mismatch: Path schoolId={}, Token schoolId={}", schoolId, tokenSchoolId);
//             throw new SecurityException("Unauthorized: School ID mismatch");
//         }
//     }

//     @PostMapping("/{schoolId}/bootstrap-permissions")
//     public ResponseEntity<String> bootstrapPermissionsForSchool(@PathVariable String schoolId) {
//         log.info("Bootstrapping permissions for schoolId: {}", schoolId);
//         validateSchoolId(schoolId);
//         bootstrapService.bootstrapPermissions(schoolId);
//         return ResponseEntity.ok("Permissions successfully bootstrapped for school: " + schoolId);
//     }
// }

// package com.schoolmanagement.User_Service.controller;

// import com.schoolmanagement.User_Service.config.CustomUserPrincipal;
// import com.schoolmanagement.User_Service.dto.SignupRequest;
// import com.schoolmanagement.User_Service.dto.UserResponseDTO;
// import com.schoolmanagement.User_Service.dto.UserRoleCountDTO;
// import com.schoolmanagement.User_Service.service.UserService;
// import jakarta.validation.Valid;
// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.core.context.SecurityContextHolder;
// import org.springframework.web.bind.annotation.*;

// import java.util.List;

// @RestController
// @RequestMapping("/auth/api")
// @RequiredArgsConstructor
// @Slf4j
// public class UserController {

//     private final UserService userService;

//     /**
//      * Validates that the schoolId from the path matches the schoolId in the
//      * authenticated user's context.
//      */
//     private void validateSchoolId(String schoolId) {
//         CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
//                 .getAuthentication().getPrincipal();
//         String tokenSchoolId = principal.getSchoolId();
//         if (!schoolId.equals(tokenSchoolId)) {
//             log.error("School ID mismatch: Path schoolId={}, Token schoolId={}", schoolId, tokenSchoolId);
//             throw new SecurityException("Unauthorized: School ID mismatch");
//         }
//     }

//     @PutMapping("/{schoolId}/users/{userId}")
//     public ResponseEntity<UserResponseDTO> updateUser(
//             @PathVariable String schoolId,
//             @PathVariable String userId,
//             @Valid @RequestBody SignupRequest updatedUserDetails) {
//         log.info("Updating user with ID: {} in schoolId: {}", userId, schoolId);
//         validateSchoolId(schoolId);
//         CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
//                 .getAuthentication().getPrincipal();
//         String updaterUserId = principal.getUserId();
//         return userService.updateUser(updatedUserDetails, userId, schoolId, updaterUserId);
//     }

//     @GetMapping("/{schoolId}/users/{userId}")
//     public ResponseEntity<UserResponseDTO> getUserById(
//             @PathVariable String schoolId,
//             @PathVariable String userId) {
//         log.debug("Fetching user with ID: {} in schoolId: {}", userId, schoolId);
//         validateSchoolId(schoolId);
//         return userService.getUserById(userId, schoolId);
//     }

//     @GetMapping("/{schoolId}/users/roles")
//     public ResponseEntity<List<UserResponseDTO>> getUsersByRoles(
//             @PathVariable String schoolId,
//             @RequestParam("roleIds") List<Long> roleIds) {
//         log.debug("Fetching users with roleIds: {} in schoolId: {}", roleIds, schoolId);
//         validateSchoolId(schoolId);
//         return userService.getUsersByRoles(roleIds, schoolId);
//     }

//     @DeleteMapping("/{schoolId}/users/{userId}")
//     public ResponseEntity<String> deleteUserById(
//             @PathVariable String schoolId,
//             @PathVariable String userId) {
//         log.info("Deleting user with ID: {} in schoolId: {}", userId, schoolId);
//         validateSchoolId(schoolId);
//         CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
//                 .getAuthentication().getPrincipal();
//         String updaterUserId = principal.getUserId();
//         return userService.deleteUserById(userId, schoolId, updaterUserId);
//     }

//     @GetMapping("/{schoolId}/users")
//     public ResponseEntity<List<UserResponseDTO>> getUsersBySchool(
//             @PathVariable String schoolId) {
//         log.debug("Fetching all users for schoolId: {}", schoolId);
//         validateSchoolId(schoolId);
//         return userService.getUsersBySchool(schoolId);
//     }

//     @GetMapping("/{schoolId}/users/{userId}/email")
//     public ResponseEntity<String> getUserEmail(
//             @PathVariable String schoolId,
//             @PathVariable String userId) {
//         log.debug("Fetching email for userId: {} in schoolId: {}", userId, schoolId);
//         validateSchoolId(schoolId);
//         String email = userService.getEmailByUserId(schoolId, userId);
//         return email != null ? ResponseEntity.ok(email) : ResponseEntity.notFound().build();
//     }

//     @GetMapping("/{schoolId}/users/role")
//     public ResponseEntity<List<String>> getUserIdsByRole(
//             @PathVariable String schoolId,
//             @RequestParam String role) {
//         log.info("Fetching user IDs with role: {} in schoolId: {}", role, schoolId);
//         validateSchoolId(schoolId);
//         List<String> userIds = userService.getUserIdsByRole(role, schoolId);
//         return ResponseEntity.ok(userIds);
//     }

//     @PutMapping("/{schoolId}/change-password")
//     public ResponseEntity<UserResponseDTO> changePassword(
//             @PathVariable String schoolId,
//             @RequestParam String currentPassword,
//             @RequestParam String newPassword) {
//         log.info("Changing password for user in schoolId: {}", schoolId);
//         validateSchoolId(schoolId);
//         CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
//                 .getAuthentication().getPrincipal();
//         String userId = principal.getUserId();
//         return userService.changePassword(userId, schoolId, currentPassword, newPassword);
//     }

//     @GetMapping("/{schoolId}/users-counts")
//     public ResponseEntity<UserRoleCountDTO> getUserCountsByRole(
//             @PathVariable String schoolId) {
//         log.debug("Fetching user counts by role for schoolId: {}", schoolId);
//         // validateSchoolId(schoolId);
//         UserRoleCountDTO roleCounts = userService.getUserCountsByRole(schoolId);
//         return ResponseEntity.ok(roleCounts);
//     }
// }

// package com.schoolmanagement.tenant_service.controller;

// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RestController;

// import com.schoolmanagement.tenant_service.dto.AddressRequest;
// import com.schoolmanagement.tenant_service.dto.AddressResponse;
// import com.schoolmanagement.tenant_service.service.AddressService;

// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestBody;
// import org.springframework.web.bind.annotation.PutMapping;
// import org.springframework.web.bind.annotation.PathVariable;

// import java.util.List;

// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.DeleteMapping;
// import org.springframework.web.bind.annotation.GetMapping;

// @RestController
// @RequestMapping("/tenant/api")
// @RequiredArgsConstructor
// @Slf4j
// public class Address_Controller {

//     private final AddressService addressService;

//     @PostMapping("{school_id}/addNewAddress")
//     public ResponseEntity<AddressResponse> addNewAddress(@RequestBody AddressRequest addressRequest,
//             @PathVariable String school_id) {
//         return addressService.addNewAddress(addressRequest, school_id);
//     }

//     @PutMapping("/{school_id}/editAddressById/{address_id}")
//     public ResponseEntity<AddressResponse> editAddressById(@PathVariable String school_id, @PathVariable Long address_id,
//             @RequestBody AddressRequest addressRequest) {
//         return addressService.editAddressById(addressRequest, school_id, address_id);
//     }

//     @GetMapping("/{school_id}/getAllAddressBySchool")
//     public ResponseEntity<List<AddressResponse>> getAllAddressBySchool(@PathVariable String school_id) {
//         return addressService.getAllAddressesBySchoolId(school_id);
//     }

//     @GetMapping("/{school_id}/getAddressById/{address_id}")
//     public ResponseEntity<AddressResponse> getAddressById(@PathVariable String school_id, @PathVariable Long address_id) {
//         return addressService.getAddressById(school_id, address_id);
//     }

//     @DeleteMapping("/{school_id}/deleteAddressById/{address_id}")
//     public ResponseEntity<String> deleteSchoolById(@PathVariable String school_id, @PathVariable Long address_id) {
//         return addressService.deleteAddressById(school_id, address_id);
//     }
// }
// package com.schoolmanagement.tenant_service.controller;

// import java.util.List;

// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RestController;

// import com.schoolmanagement.tenant_service.dto.PaymentApprovalRequest;
// import com.schoolmanagement.tenant_service.dto.PaymentRequest;
// import com.schoolmanagement.tenant_service.dto.School_subscriptionsRequest;
// import com.schoolmanagement.tenant_service.dto.School_subscriptionsResponse;
// import com.schoolmanagement.tenant_service.service.School_SubscriptionService;

// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;

// import org.springframework.web.bind.annotation.DeleteMapping;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.PathVariable;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestBody;
// import org.springframework.web.bind.annotation.PutMapping;

// @RestController
// @Slf4j
// @RequiredArgsConstructor
// @RequestMapping("/tenant/api")
// public class School_Subscription_Controller {
//     private final School_SubscriptionService school_SubscriptionService;

//     @PostMapping("/{school_id}/addNewSchoolSubscription")
//     public ResponseEntity<School_subscriptionsResponse> addNewSchoolSubscription(
//             @RequestBody School_subscriptionsRequest school_subscriptionsRequest, @PathVariable String school_id) {

//         return school_SubscriptionService.addNewSchoolSubscription(school_subscriptionsRequest, school_id);
//     }

//     @PutMapping("/{school_id}/editSchoolSubscriptionById/{subscription_id}")
//     public ResponseEntity<School_subscriptionsResponse> editSchoolSubscriptionById(
//             @RequestBody School_subscriptionsRequest school_subscriptionsRequest, @PathVariable String school_id,
//             @PathVariable Long subscription_id) {
//         return school_SubscriptionService.editSchoolSubscriptionById(school_subscriptionsRequest, school_id,
//                 subscription_id);
//     }

//     @DeleteMapping("/{school_id}/deleteSchoolSubscriptionById/{subscription_id}")
//     public ResponseEntity<String> deleteSchoolSubscriptionById(@PathVariable String school_id,
//             @PathVariable Long subscription_id) {
//         return school_SubscriptionService.deleteSchoolSubscriptionById(school_id, subscription_id);
//     }

//     @GetMapping("/{school_id}/getAllSchoolSubscriptions")
//     public ResponseEntity<List<School_subscriptionsResponse>> getAllSchoolSubscriptions(
//             @PathVariable String school_id) {
//         return school_SubscriptionService.getAllSchoolSubscription(school_id);
//     }

//     @GetMapping("/getSubscriptionPending/{status}")
//     public ResponseEntity<List<School_subscriptionsResponse>> getSubscriptionPending(@PathVariable String status) {
//         return school_SubscriptionService.getSubscriptionByStatus(status);
//     }

//     @GetMapping("/{schoolId}/getSchoolSubscriptionByStatus/{status}")
//     public ResponseEntity<School_subscriptionsResponse> getSchoolSubscriptionByStatus(@PathVariable String schoolId,
//             @PathVariable String status) {
//         return school_SubscriptionService.getSchoolSubscriptionByStatus(schoolId, status);
//     }

//     @PostMapping("/makeSubscriptionPayment")
//     public ResponseEntity<School_subscriptionsResponse> makeSubscriptionPayment(
//             @RequestBody PaymentRequest paymentRequest) {
//         return school_SubscriptionService.makeSubscriptionPayment(paymentRequest);
//     }

//     @PostMapping("/makeSubscriptionPaid")
//     public ResponseEntity<String> makeSubscriptionPaid(@RequestBody PaymentApprovalRequest paymentApprovalRequest) {
//         return school_SubscriptionService.makeSubscriptionPaid(paymentApprovalRequest);
//     }

//     @GetMapping("/{school_id}/getSchoolSubscriptionById/{subscription_id}")
//     public ResponseEntity<School_subscriptionsResponse> getSchoolSubscriptionById(@PathVariable String school_id,
//             @PathVariable Long subscription_id) {
//         return school_SubscriptionService.getSchoolSubscriptionById(school_id, subscription_id);
//     }

// }
// package com.schoolmanagement.tenant_service.controller;

// import com.schoolmanagement.tenant_service.config.CustomUserPrincipal;
// import com.schoolmanagement.tenant_service.dto.SchoolRequest;
// import com.schoolmanagement.tenant_service.dto.SchoolResponse;
// import com.schoolmanagement.tenant_service.dto.SchoolStatsDTO; // New DTO
// import com.schoolmanagement.tenant_service.service.SchoolService;
// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;
// import org.springframework.http.MediaType;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.core.context.SecurityContextHolder;
// import org.springframework.web.bind.annotation.*;

// import java.util.List;

// @RestController
// @RequestMapping("/tenant/api")
// @RequiredArgsConstructor
// @Slf4j
// public class SchoolController {

//     private final SchoolService schoolService;

//     private String getUserIdFromSecurityContext() {
//         CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
//                 .getAuthentication().getPrincipal();
//         return principal.getUserId();
//     }

//     private void validateSchoolId(String schoolId) {
//         CustomUserPrincipal principal = (CustomUserPrincipal) SecurityContextHolder.getContext()
//                 .getAuthentication().getPrincipal();
//         String tokenSchoolId = principal.getSchoolId();
//         if (!schoolId.equals(tokenSchoolId)) {
//             log.error("School ID mismatch: Path schoolId={}, Token schoolId={}", schoolId, tokenSchoolId);
//             throw new SecurityException("Unauthorized: School ID mismatch");
//         }
//     }

//     @PostMapping(value = "/addNewSchool", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//     public ResponseEntity<SchoolResponse> addNewSchool(@ModelAttribute SchoolRequest schoolRequest) {
//         log.info("Received request to add new school with name: {}", schoolRequest.getSchool_name());
//         String userId = getUserIdFromSecurityContext();
//         log.info("User ID from request: {}", userId);
//         return schoolService.addNewSchool(schoolRequest);
//     }

//     @PutMapping(value = "/editSchoolById/{school_id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//     public ResponseEntity<SchoolResponse> editSchoolById(
//             @PathVariable("school_id") String schoolId,
//             @ModelAttribute SchoolRequest schoolRequest) {
//         log.info("Editing school with ID: {}", schoolId);
//         validateSchoolId(schoolId);
//         return schoolService.editSchoolById(schoolRequest, schoolId);
//     }

//     @GetMapping("/getAllSchools")
//     public ResponseEntity<List<SchoolResponse>> getAllSchools() {
//         log.info("Fetching all schools");
//         return schoolService.getAllSchools();
//     }

//     @GetMapping("/getSchoolById/{schoolId}")
//     public ResponseEntity<SchoolResponse> getSchoolById(@PathVariable String schoolId) {
//         log.info("Fetching school with ID: {}", schoolId);
//         // validateSchoolId(schoolId);
//         return schoolService.getSchoolById(schoolId);
//     }

//     @DeleteMapping("/deleteSchoolById/{school_id}")
//     public ResponseEntity<String> deleteSchoolById(@PathVariable("school_id") String schoolId) {
//         log.info("Deleting school with ID: {}", schoolId);
//         validateSchoolId(schoolId);
//         return schoolService.deleteSchoolById(schoolId);
//     }

//     // New endpoint for school stats
//     @GetMapping("/getSchoolStats/{school_id}")
//     public ResponseEntity<SchoolStatsDTO> getSchoolStats(@PathVariable("school_id") String schoolId) {
//         log.info("Fetching stats for school with ID: {}", schoolId);
//         validateSchoolId(schoolId);
//         return schoolService.getSchoolStats(schoolId);
//     }
// }
// package com.schoolmanagement.tenant_service.controller;

// import java.util.List;

// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.DeleteMapping;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.PathVariable;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.PutMapping;
// import org.springframework.web.bind.annotation.RequestBody;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RestController;

// import com.schoolmanagement.tenant_service.dto.SchoolsForPlanResponse;
// import com.schoolmanagement.tenant_service.dto.Subscription_planRequest;
// import com.schoolmanagement.tenant_service.dto.Subscription_planResponse;
// import com.schoolmanagement.tenant_service.service.Subscription_planService;

// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;

// @RestController
// @RequestMapping("/tenant/api")
// @RequiredArgsConstructor
// @Slf4j
// public class Subscription_Plan_Controller {
    
//     private final Subscription_planService subscription_planService;


//      @PostMapping(value = "/addNewSubscriptionPlan")
//     public ResponseEntity<Subscription_planResponse> addNewSubscriptionPlan(@RequestBody Subscription_planRequest subscription_planRequest) throws Exception {
        
//         return subscription_planService.addNewSubscriptioPlan(subscription_planRequest);
//     }

//     @PutMapping(value = "/editSubscriptioPlanById/{plan_id}")
//     public ResponseEntity<Subscription_planResponse> editSubscriptioPlanById(@PathVariable Long plan_id, @RequestBody Subscription_planRequest subscription_planRequest) {
        
//         return subscription_planService.editSubscriptioPlanById(subscription_planRequest, plan_id);
//     }

//     @GetMapping("/getAllSubscriptionPlans")
//     public ResponseEntity<List<Subscription_planResponse>> getAllSubscriptionPlans() {
//         return subscription_planService.getAllSubscriptionPlans();
//     }
    
//     @GetMapping("/getSubscriptionPlanById/{plan_id}")
//     public ResponseEntity<Subscription_planResponse> getSubscriptionPlanById(@PathVariable Long plan_id) {
//         return subscription_planService.getSubscriptionPlanById(plan_id);
//     } 
    
//     @DeleteMapping("/deleteSubscriptioPlanById/{plan_id}")
//     public ResponseEntity<String> deleteSubscriptioPlanById(@PathVariable Long plan_id) {
//         return subscription_planService.deleteSubscriptioPlanById(plan_id);
//     }
//         // New endpoint to fetch schools subscribed to a plan
//     @GetMapping("/getSchoolsByPlanId/{planId}")
// public ResponseEntity<SchoolsForPlanResponse> getSchoolsByPlanId(@PathVariable Long planId) {
//         SchoolsForPlanResponse response = subscription_planService.getSchoolsByPlanId(planId);
//         return ResponseEntity.ok(response);
//     }
// }

// i have already added most of them. what you have to do it by carefully examinig the controllers add the remaining endpoints with thier appropreate name fro them oky and do nt duplicate them ok
// for this factory class and
// package com.schoolmanagement.User_Service.config;

// import com.schoolmanagement.User_Service.model.PermissionTemplate;

// import java.util.Arrays;
// import java.util.List;

// public class PermissionTemplateFactory {

//     public static List<PermissionTemplate> createDefaultTemplates() {
//         return Arrays.asList(
//                 // AuthController (User Service)
//                 new PermissionTemplate("LOGIN_USER", "Authenticate and log in a user", "/auth/api/login", "POST"),
//                 new PermissionTemplate("REGISTER_USER", "Register a new user in a school", "/auth/api/*/register",
//                         "POST"),
//                 new PermissionTemplate("REGISTER_ADMIN", "Register an admin user", "/auth/api/register", "POST"),

//                 // PasswordResetController Permissions
//                 new PermissionTemplate("INITIATE_PASSWORD_RESET", "Initiate password reset process",
//                         "/auth/api/forgot-password", "POST"),
//                 new PermissionTemplate("RESET_PASSWORD", "Reset user password", "/auth/api/reset-password", "POST"),

//                 // PermissionController Permissions
//                 new PermissionTemplate("VIEW_ALL_PERMISSIONS", "View all permissions for school",
//                         "/auth/api/*/permissions", "GET"),
//                 new PermissionTemplate("VIEW_PERMISSION_BY_ID", "View specific permission by ID",
//                         "/auth/api/*/permissions/*", "GET"),
//                 new PermissionTemplate("CREATE_PERMISSION", "Create a new permission", "/auth/api/*/permissions",
//                         "POST"),
//                 new PermissionTemplate("UPDATE_PERMISSION", "Update existing permission", "/auth/api/*/permissions/*",
//                         "PUT"),
//                 new PermissionTemplate("DELETE_PERMISSION", "Delete a permission", "/auth/api/*/permissions/*",
//                         "DELETE"),
//                 new PermissionTemplate("VIEW_PERMISSION_BY_NAME", "View permission by name",
//                         "/auth/api/*/permissions/name/*", "GET"),
//                 new PermissionTemplate("VIEW_PERMISSION_BY_ROLE", "View permissions by role",
//                         "/auth/api/*/permissions/by-role/*", "GET"),
//                 new PermissionTemplate("VIEW_PERMISSIONS_BY_USER", "View permissions by user",
//                         "/auth/api/*/permissions/by-user/*", "GET"),

//                 // RoleController Permissions
//                 new PermissionTemplate("VIEW_ROLE_BY_ID", "View specific role by ID", "/auth/api/*/roles/*", "GET"),
//                 new PermissionTemplate("VIEW_ALL_ROLES", "View all roles for school", "/auth/api/*/roles", "GET"),
//                 new PermissionTemplate("CREATE_ROLE", "Create a new role", "/auth/api/*/roles", "POST"),
//                 new PermissionTemplate("UPDATE_ROLE", "Update existing role", "/auth/api/*/roles/*", "PUT"),
//                 new PermissionTemplate("DELETE_ROLE", "Delete a role", "/auth/api/*/roles/*", "DELETE"),
//                 new PermissionTemplate("ASSIGN_ROLE_TO_USER", "Assign role to user", "/auth/api/*/roles/*/assign/*",
//                         "POST"),
//                 new PermissionTemplate("ASSIGN_PERMISSIONS_TO_ROLE", "Assign permissions to role",
//                         "/auth/api/*/roles/assign-permissions", "POST"),
//                 new PermissionTemplate("REMOVE_ROLE_FROM_USER", "Remove role from user",
//                         "/auth/api/*/roles/remove-role", "DELETE"),

//                 // UserController Permissions
//                 new PermissionTemplate("UPDATE_USER", "Update user details", "/auth/api/*/users/*", "PUT"),
//                 new PermissionTemplate("VIEW_USER_BY_ID", "View specific user by ID", "/auth/api/*/users/*", "GET"),
//                 new PermissionTemplate("VIEW_USERS_BY_ROLES", "View users by roles", "/auth/api/*/users/roles", "GET"),
//                 new PermissionTemplate("DELETE_USER", "Delete a user", "/auth/api/*/users/*", "DELETE"),
//                 new PermissionTemplate("VIEW_ALL_USERS_BY_SCHOOL", "View all users in school", "/auth/api/*/users",
//                         "GET"),
//                 new PermissionTemplate("VIEW_USER_EMAIL", "View user email", "/auth/api/*/users/*/email", "GET"),
//                 new PermissionTemplate("VIEW_USER_IDS_BY_ROLE", "View user IDs by role", "/auth/api/*/users/role",
//                         "GET"),
//                 new PermissionTemplate("CHANGE_PASSWORD", "Change user password", "/auth/api/*/change-password", "PUT"),
//                 new PermissionTemplate("VIEW_USER_COUNTS_BY_ROLE", "View user counts by role",
//                         "/auth/api/*/users/counts", "GET"),
//                 new PermissionTemplate("SCHOOL_USER_COUNT", "Count all school users by roles",
//                         "/auth/api/*/users-counts", "GET"),

//                 // Tenant Service Permissions (SchoolController)
//                 new PermissionTemplate("ADD_SCHOOL", "Add a new school", "/tenant/api/addNewSchool", "POST"),
//                 new PermissionTemplate("EDIT_SCHOOL", "Edit an existing school", "/tenant/api/editSchoolById/*", "PUT"),
//                 new PermissionTemplate("VIEW_ALL_SCHOOLS", "View all schools", "/tenant/api/getAllSchools", "GET"),
//                 new PermissionTemplate("VIEW_SCHOOL_BY_ID", "View school by ID", "/tenant/api/getSchoolById/*", "GET"),
//                 new PermissionTemplate("DELETE_SCHOOL_BY_ID", "Delete school by ID", "/tenant/api/deleteSchoolById/*",
//                         "DELETE"),
//                 new PermissionTemplate("VIEW_SCHOOL_STATS", "View school statistics", "/tenant/api/getSchoolStats/*",
//                         "GET"),

//                 // Tenant Service Permissions (AddressController)
//                 new PermissionTemplate("ADD_ADDRESS", "Add a new address", "/tenant/api/*/addNewAddress", "POST"),
//                 new PermissionTemplate("EDIT_ADDRESS", "Edit an address", "/tenant/api/*/editAddressById/*", "PUT"),
//                 new PermissionTemplate("VIEW_ALL_ADDRESSES", "View all addresses by school",
//                         "/tenant/api/*/getAllAddressBySchool", "GET"),
//                 new PermissionTemplate("VIEW_ADDRESS_BY_ID", "View address by ID", "/tenant/api/*/getAddressById/*",
//                         "GET"),
//                 new PermissionTemplate("DELETE_ADDRESS", "Delete address by ID", "/tenant/api/*/deleteAddressById/*",
//                         "DELETE"),

//                 // Tenant Service Permissions (SchoolSubscriptionController)
//                 new PermissionTemplate("ADD_SCHOOL_SUBSCRIPTION", "Add a new school subscription",
//                         "/tenant/api/*/addNewSchoolSubscription", "POST"),
//                 new PermissionTemplate("EDIT_SCHOOL_SUBSCRIPTION", "Edit a school subscription",
//                         "/tenant/api/*/editSchoolSubscriptionById/*", "PUT"),
//                 new PermissionTemplate("VIEW_ALL_SCHOOL_SUBSCRIPTIONS", "View all school subscriptions",
//                         "/tenant/api/*/getAllSchoolSubscriptions", "GET"),
//                 new PermissionTemplate("VIEW_SCHOOL_SUBSCRIPTION_BY_ID", "View school subscription by ID",
//                         "/tenant/api/*/getSchoolSubscriptionById/*", "GET"),
//                 new PermissionTemplate("DELETE_SCHOOL_SUBSCRIPTION", "Delete school subscription by ID",
//                         "/tenant/api/*/deleteSchoolSubscriptionById/*", "DELETE"),

//                 // Tenant Service Permissions (SubscriptionPlanController)
//                 new PermissionTemplate("ADD_SUBSCRIPTION_PLAN", "Add a new subscription plan",
//                         "/tenant/api/addNewSubscriptionPlan", "POST"),
//                 new PermissionTemplate("EDIT_SUBSCRIPTION_PLAN", "Edit a subscription plan",
//                         "/tenant/api/editSubscriptioPlanById/*", "PUT"),
//                 new PermissionTemplate("VIEW_ALL_SUBSCRIPTION_PLANS", "View all subscription plans",
//                         "/tenant/api/getAllSubscriptionPlans", "GET"),
//                 new PermissionTemplate("VIEW_SUBSCRIPTION_PLAN_BY_ID", "View subscription plan by ID",
//                         "/tenant/api/getSubscriptionPlanById/*", "GET"),
//                 new PermissionTemplate("DELETE_SUBSCRIPTION_PLAN", "Delete subscription plan by ID",
//                         "/tenant/api/deleteSubscriptioPlanById/*", "DELETE"),

//                 // Academic Service Permissions (ClassController)
//                 new PermissionTemplate("ADD_CLASS", "Add a new class", "/academic/api/*/addNewClass", "POST"),
//                 new PermissionTemplate("EDIT_CLASS", "Edit a class", "/academic/api/*/editClassById/*", "PUT"),
//                 new PermissionTemplate("EDIT_CLASS_STATUS", "Edit class status", "/academic/api/*/editStatus/*", "PUT"),
//                 new PermissionTemplate("VIEW_ALL_CLASSES_BY_SCHOOL", "View all classes by school",
//                         "/academic/api/*/getAllClassBySchool", "GET"),
//                 new PermissionTemplate("VIEW_ALL_CLASSES_BY_STREAM", "View all classes by stream",
//                         "/academic/api/*/getAllClassByStream/*", "GET"),
//                 new PermissionTemplate("VIEW_CLASS_BY_ID", "View class by ID", "/academic/api/*/getClassById/*", "GET"),
//                 new PermissionTemplate("VIEW_CLASS_DETAILS", "View class details", "/academic/api/*/getClassDetails/*",
//                         "GET"),
//                 new PermissionTemplate("DELETE_CLASS", "Delete class by ID", "/academic/api/*/deleteClassById/*",
//                         "DELETE"),
//                 new PermissionTemplate("ASSIGN_SUBJECTS_TO_CLASS", "Assign subjects to class",
//                         "/academic/api/*/assign-subjects/*", "POST"),

//                 // Academic Service Permissions (SectionController)
//                 new PermissionTemplate("ADD_SECTION", "Add a new section", "/academic/api/*/addNewSection", "POST"),
//                 new PermissionTemplate("EDIT_SECTION", "Edit a section", "/academic/api/*/editSectionById/*", "PUT"),
//                 new PermissionTemplate("VIEW_ALL_SECTIONS_BY_CLASS", "View all sections by class",
//                         "/academic/api/*/getAllSectionByClass/*", "GET"),
//                 new PermissionTemplate("VIEW_SECTION_BY_ID", "View section by ID", "/academic/api/*/getSectionById/*",
//                         "GET"),
//                 new PermissionTemplate("DELETE_SECTION_BY_ID", "Delete section by ID",
//                         "/academic/api/*/deleteSectionById/*", "DELETE"),
//                 new PermissionTemplate("DELETE_SECTIONS_BY_CLASS", "Delete sections by class",
//                         "/academic/api/*/deleteSectionByClass/*", "DELETE"),

//                 // Academic Service Permissions (StreamController)
//                 new PermissionTemplate("ADD_STREAM", "Add a new stream", "/academic/api/*/addNewStream", "POST"),
//                 new PermissionTemplate("EDIT_STREAM", "Edit a stream", "/academic/api/*/editStreamById/*", "PUT"),
//                 new PermissionTemplate("VIEW_ALL_STREAMS_BY_SCHOOL", "View all streams by school",
//                         "/academic/api/*/getAllStreamBySchool", "GET"),
//                 new PermissionTemplate("VIEW_STREAM_BY_ID", "View stream by ID", "/academic/api/*/getStreamById/*",
//                         "GET"),
//                 new PermissionTemplate("DELETE_STREAM", "Delete stream by ID", "/academic/api/*/deleteStreamById/*",
//                         "DELETE"),

//                 // Academic Service Permissions (SubjectController)
//                 new PermissionTemplate("ADD_SUBJECT", "Add a new subject", "/academic/api/*/addNewSubject", "POST"),
//                 new PermissionTemplate("EDIT_SUBJECT", "Edit a subject", "/academic/api/*/editSubjectById/*", "PUT"),
//                 new PermissionTemplate("VIEW_ALL_SUBJECTS_BY_CLASS", "View all subjects by class",
//                         "/academic/api/*/getAllSubjectByClass/*", "GET"),
//                 new PermissionTemplate("VIEW_ALL_SUBJECTS_BY_STREAM", "View all subjects by stream",
//                         "/academic/api/*/getAllSubjectsByStream/*", "GET"),
//                 new PermissionTemplate("VIEW_ALL_SUBJECTS_BY_SCHOOL", "View all subjects by school",
//                         "/academic/api/*/getAllSubjectBySchool", "GET"),
//                 new PermissionTemplate("VIEW_SUBJECT_BY_ID", "View subject by ID", "/academic/api/*/getSubjectById/*",
//                         "GET"),
//                 new PermissionTemplate("DELETE_SUBJECT", "Delete subject by ID", "/academic/api/*/deleteSubjectById/*",
//                         "DELETE"),

//                 // Academic Service Permissions (TimeTableController)
//                 new PermissionTemplate("ADD_TIMETABLE", "Add a new timetable", "/academic/api/*/addNewTimeTable",
//                         "POST"),
//                 new PermissionTemplate("EDIT_TIMETABLE", "Edit a timetable", "/academic/api/*/editTimeTableById/*",
//                         "PUT"),
//                 new PermissionTemplate("VIEW_ALL_TIMETABLES_BY_CLASS", "View all timetables by class",
//                         "/academic/api/*/getAllTimeTableByClass/*", "GET"),
//                 new PermissionTemplate("VIEW_TIMETABLE_BY_ID", "View timetable by ID",
//                         "/academic/api/*/getTimeTableById/*", "GET"),
//                 new PermissionTemplate("VIEW_TIMETABLE_BY_STREAM", "View timetable by stream",
//                         "/academic/api/*/getTimeTableByStream/*", "GET"),
//                 new PermissionTemplate("DELETE_TIMETABLE_BY_ID", "Delete timetable by ID",
//                         "/academic/api/*/deleteTimeTableById/*", "DELETE"),
//                 new PermissionTemplate("DELETE_TIMETABLES_BY_CLASS", "Delete timetables by class",
//                         "/academic/api/*/deleteTimeTableByClass/*", "DELETE"),

//                 // Other Common Permissions
//                 new PermissionTemplate("CHECK_PERMISSION", "Internal API for checking permission",
//                         "/auth/api/internal/check-permission", "POST"),
//                 new PermissionTemplate("SCHOOL_USER_COUNT", "Count all school users by roles",
//                         "/auth/api/*/users/counts", "GET"));
//     }
// }

// for this default super admin by care fully examining give fro superadmin what kind of endpoint should it have to access
// package com.schoolmanagement.User_Service.config;

// import com.schoolmanagement.User_Service.model.Permission;
// import com.schoolmanagement.User_Service.model.Role;
// import com.schoolmanagement.User_Service.model.User;
// import com.schoolmanagement.User_Service.model.UserRolePermission;
// import com.schoolmanagement.User_Service.repository.PermissionRepository;
// import com.schoolmanagement.User_Service.repository.RoleRepository;
// import com.schoolmanagement.User_Service.repository.UserRepository;
// import com.schoolmanagement.User_Service.repository.UserRolePermissionRepository;
// import lombok.RequiredArgsConstructor;
// import org.springframework.boot.ApplicationRunner;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.stereotype.Component;

// import java.time.LocalDateTime;
// import java.util.HashSet;
// import java.util.List;

// @Component
// @RequiredArgsConstructor
// public class DefaultUserBootstrapper implements ApplicationRunner {

//     private final UserRepository userRepository;
//     private final RoleRepository roleRepository;
//     private final PermissionRepository permissionRepository;
//     private final UserRolePermissionRepository userRolePermissionRepository;
//     private final PasswordEncoder passwordEncoder;

//     @Override
//     public void run(org.springframework.boot.ApplicationArguments args) {
//         String username = "wandi";
//         String schoolId = "admin";

//         if (!userRepository.existsByUsername(username)) {
//             // Create superadmin role
//             Role superadminRole = createRole("ROLE_SUPERADMIN", "Super administrator role with all permissions",
//                     schoolId);
//             roleRepository.save(superadminRole);

//             // Create user
//             User defaultUser = createUser(username, schoolId);
//             userRepository.save(defaultUser);

//             // Assign permissions via role
//             assignPermissionsToUser(defaultUser, superadminRole, schoolId);
//         }
//     }

//     private Role createRole(String name, String description, String schoolId) {
//         Role role = new Role();
//         role.setName(name);
//         role.setDescription(description);
//         role.setSchoolId(schoolId);
//         role.setCreatedBy("system");
//         role.setCreatedAt(LocalDateTime.now());
//         role.setUpdatedAt(LocalDateTime.now());
//         role.setIsActive(true);
//         return role;
//     }

//     private User createUser(String username, String schoolId) {
//         return User.builder()
//                 .userId("wandi-1")
//                 .schoolId(schoolId)
//                 .username(username)
//                 .email("wondimayewaschalew@gmail.com")
//                 .password(passwordEncoder.encode("wandi123"))
//                 .isActive(true)
//                 .createdAt(LocalDateTime.now())
//                 .updatedAt(LocalDateTime.now())
//                 .createdBy("system")
//                 .roles(new HashSet<>())
//                 .build();
//     }

//     private void assignPermissionsToUser(User user, Role role, String schoolId) {
//         List<Permission> permissions = List.of(
//                 createPermission("CREATE_SCHOOL", "Permission to create a new school", "/tenant/api/addNewSchool",
//                         "POST", schoolId),
//                 createPermission("REGISTER_ADMIN", "Permission to register an admin user", "/auth/api/register", "POST",
//                         schoolId),
//                 createPermission("CHECK_PERMISSION", "Check permission", "/auth/api/internal/check-permission", "POST",
//                         schoolId),
//                 createPermission("SCHOOL_USER_COUNT", "Count all school users by roles", "/auth/api/*/users-counts",
//                         "GET", schoolId),
//                 createPermission("ADD_SCHOOL", "Add a new school", "/tenant/api/addNewSchool", "POST", schoolId),
//                 createPermission("EDIT_SCHOOL", "Edit an existing school", "/tenant/api/editSchoolById/*", "PUT",
//                         schoolId),
//                 createPermission("VIEW_ALL_SCHOOLS", "View all schools", "/tenant/api/getAllSchools", "GET", schoolId),
//                 createPermission("VIEW_SCHOOL_BY_ID", "View school by ID", "/tenant/api/getSchoolById/*", "GET",
//                         schoolId),
//                 createPermission("DELETE_SCHOOL_BY_ID", "Delete school by ID", "/tenant/api/deleteSchoolById/*",
//                         "DELETE", schoolId),
//                 createPermission("VIEW_SCHOOL_STATS", "View school statistics", "/tenant/api/getSchoolStats/*", "GET",
//                         schoolId),
//                 // Tenant Service Permissions (AddressController)
//                 createPermission("ADD_ADDRESS", "Add a new address", "/tenant/api/*/addNewAddress", "POST", schoolId),
//                 createPermission("EDIT_ADDRESS", "Edit an address", "/tenant/api/*/editAddressById/*", "PUT", schoolId),
//                 createPermission("VIEW_ALL_ADDRESSES", "View all addresses by school",
//                         "/tenant/api/*/getAllAddressBySchool", "GET", schoolId),
//                 createPermission("VIEW_ADDRESS_BY_ID", "View address by ID", "/tenant/api/*/getAddressById/*",
//                         "GET", schoolId),
//                 createPermission("DELETE_ADDRESS", "Delete address by ID", "/tenant/api/*/deleteAddressById/*",
//                         "DELETE", schoolId),

//                 // Tenant Service Permissions (SchoolSubscriptionController)
//                 createPermission("ADD_SCHOOL_SUBSCRIPTION", "Add a new school subscription",
//                         "/tenant/api/*/addNewSchoolSubscription", "POST", schoolId),
//                 createPermission("EDIT_SCHOOL_SUBSCRIPTION", "Edit a school subscription",
//                         "/tenant/api/*/editSchoolSubscriptionById/*", "PUT", schoolId),
//                 createPermission("VIEW_ALL_SCHOOL_SUBSCRIPTIONS", "View all school subscriptions",
//                         "/tenant/api/*/getAllSchoolSubscriptions", "GET", schoolId),
//                 createPermission("VIEW_SCHOOL_SUBSCRIPTION_BY_ID", "View school subscription by ID",
//                         "/tenant/api/*/getSchoolSubscriptionById/*", "GET",schoolId),
                
//                 createPermission("DELETE_SCHOOL_SUBSCRIPTION", "Delete school subscription by ID",
//                         "/tenant/api/*/deleteSchoolSubscriptionById/*", "DELETE", schoolId),

//                 // Tenant Service Permissions (SubscriptionPlanController)
//                 createPermission("ADD_SUBSCRIPTION_PLAN", "Add a new subscription plan",
//                         "/tenant/api/addNewSubscriptionPlan", "POST", schoolId),
//                 createPermission("EDIT_SUBSCRIPTION_PLAN", "Edit a subscription plan",
//                         "/tenant/api/editSubscriptioPlanById/*", "PUT", schoolId),
//                 createPermission("VIEW_ALL_SUBSCRIPTION_PLANS", "View all subscription plans",
//                         "/tenant/api/getAllSubscriptionPlans", "GET", schoolId),
//                 createPermission("VIEW_SUBSCRIPTION_PLAN_BY_ID", "View subscription plan by ID",
//                         "/tenant/api/getSubscriptionPlanById/*", "GET", schoolId),
//                 createPermission("DELETE_SUBSCRIPTION_PLAN", "Delete subscription plan by ID",
//                         "/tenant/api/deleteSubscriptioPlanById/*", "DELETE", schoolId));
//         permissionRepository.saveAll(permissions);

//         permissions.forEach(permission -> {
//             UserRolePermission urp = new UserRolePermission();
//             urp.setSchoolId(schoolId);
//             urp.setUser(user);
//             urp.setRole(role);
//             urp.setPermission(permission);
//             urp.setIsActive(true);
//             urp.setCreatedBy("system");
//             urp.setCreatedAt(LocalDateTime.now());
//             urp.setUpdatedAt(LocalDateTime.now());
//             userRolePermissionRepository.save(urp);
//         });

//         user.getRoles().add(role);
//         userRepository.save(user);
//     }

//     private Permission createPermission(String name, String description, String endpoint, String httpMethod,
//             String schoolId) {
//         Permission permission = new Permission();
//         permission.setName(name);
//         permission.setDescription(description);
//         permission.setEndpoint(endpoint);
//         permission.setHttpMethod(httpMethod);
//         permission.setSchoolId(schoolId);
//         permission.setCreatedBy("system");
//         permission.setCreatedAt(LocalDateTime.now());
//         permission.setUpdatedAt(LocalDateTime.now());
//         permission.setIs_active(true);
//         return permission;
//     }
// }
