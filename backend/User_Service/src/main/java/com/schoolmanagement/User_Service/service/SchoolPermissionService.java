package com.schoolmanagement.User_Service.service;

import com.schoolmanagement.User_Service.model.Permission;
import com.schoolmanagement.User_Service.model.PermissionTemplate;
import com.schoolmanagement.User_Service.model.Role;
import com.schoolmanagement.User_Service.model.User;
import com.schoolmanagement.User_Service.model.UserRolePermission;
import com.schoolmanagement.User_Service.repository.PermissionRepository;
import com.schoolmanagement.User_Service.repository.PermissionTemplateRepository;
import com.schoolmanagement.User_Service.repository.RoleRepository;
import com.schoolmanagement.User_Service.repository.UserRepository;
import com.schoolmanagement.User_Service.repository.UserRolePermissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SchoolPermissionService {

        private final PermissionRepository permissionRepository;
        private final PermissionTemplateRepository permissionTemplateRepository;
        private final RoleRepository roleRepository;
        private final UserRolePermissionRepository userRolePermissionRepository;
        private final UserRepository userRepository;

        private static final Set<String> SUPERADMIN_RESERVED_PERMISSIONS = Set.of(
                        "REGISTER_ADMIN", "CREATE_SCHOOL", "EDIT_SCHOOL", "VIEW_ALL_SCHOOLS", "VIEW_SCHOOL_BY_ID",
                        "DELETE_SCHOOL_BY_ID");

        private static final Set<String> ADMIN_RESERVED_PERMISSIONS = Set.of("VIEW_ALL_USERS", "CREATE_USER",
                        "CHECK_PERMISSION", "INITIATE_PASSWORD_RESET", "RESET_PASSWORD",
                        "VIEW_ALL_PERMISSIONS", "VIEW_PERMISSION_BY_ID", "CREATE_PERMISSION", "UPDATE_PERMISSION",
                        "DELETE_PERMISSION", "VIEW_PERMISSION_BY_NAME", "VIEW_ROLE_BY_ID", "VIEW_ALL_ROLES",
                        "CREATE_ROLE",
                        "UPDATE_ROLE", "DELETE_ROLE", "ASSIGN_ROLE_TO_USER", "ASSIGN_PERMISSIONS_TO_USER",
                        "REMOVE_ROLE_FROM_USER",
                        "VIEW_USER_BY_ID", "VIEW_USERS_BY_ROLES", "VIEW_USER_EMAIL", "VIEW_USER_IDS_BY_ROLE",
                        "REGISTER_USER", "VIEW_PERMISSION_BY_ROLE",
                        "ADD_SCHOOL",
                        "UPDATE_USER", "GET_USER_ACTIVITY", "GET_ADMIN_ACTIVITY",
                        "DELETE_USER", "CHANGE_PASSWORD", "VIEW_PERMISSIONS_BY_USER");
        private static final Set<String> DEFAULT_TEACHER_PERMISSIONS = Set.of(
                        "VIEW_USER_BY_ID", "VIEW_ALL_USERS", "VIEW_ALL_ROLES", "CHANGE_PASSWORD",
                        "VIEW_PERMISSION_BY_ROLE",
                        "INITIATE_PASSWORD_RESET", "RESET_PASSWORD", "VIEW_PERMISSIONS_BY_USER");

        private static final Set<String> DEFAULT_STUDENT_PERMISSIONS = Set.of(
                        "VIEW_USER_BY_ID", "INITIATE_PASSWORD_RESET", "RESET_PASSWORD", "CHANGE_PASSWORD",
                        "VIEW_PERMISSION_BY_ROLE", "VIEW_PERMISSIONS_BY_USER");

        private static final Set<String> DEFAULT_PARENT_PERMISSIONS = Set.of(
                        "VIEW_USER_BY_ID", "INITIATE_PASSWORD_RESET", "RESET_PASSWORD", "CHANGE_PASSWORD",
                        "VIEW_PERMISSION_BY_ROLE", "VIEW_PERMISSIONS_BY_USER");

        private static final Set<String> DEFAULT_USER_PERMISSIONS = Set.of(
                        "CHANGE_PASSWORD", "INITIATE_PASSWORD_RESET", "RESET_PASSWORD", "VIEW_PERMISSION_BY_NAME",
                        "UPDATE_USER", "VIEW_USER_EMAIL",
                        "VIEW_USER_BY_ID", "VIEW_PERMISSION_BY_ROLE", "VIEW_PERMISSIONS_BY_USER");

        @Transactional
        public void createDefaultPermissionsAndRoles(String schoolId, User superadmin, User schoolAdmin) {
                List<PermissionTemplate> templates = permissionTemplateRepository.findAll();

                log.info("template found : {}", templates);
                List<Permission> permissions = templates.stream()
                                .map(template -> getOrCreatePermission(template, schoolId, superadmin))
                                .collect(Collectors.toList());

                log.info("Permission found : {}", permissions);

                Role adminRole = roleRepository.findByNameAndSchoolId("ROLE_ADMIN", schoolId)
                                .orElseGet(() -> createRole("ROLE_ADMIN", "School administrator", schoolId,
                                                superadmin.getUsername()));
                log.info("adminRole found : {}", adminRole);

                Role teacherRole = roleRepository.findByNameAndSchoolId("ROLE_TEACHER", schoolId)
                                .orElseGet(() -> createRole("ROLE_TEACHER", "Teacher role", schoolId,
                                                superadmin.getUsername()));
                log.info("teacherRole found : {}", teacherRole);

                Role studentRole = roleRepository.findByNameAndSchoolId("ROLE_STUDENT", schoolId)
                                .orElseGet(() -> createRole("ROLE_STUDENT", "Student role", schoolId,
                                                superadmin.getUsername()));

                log.info("studentRole found : {}", studentRole);

                Role parentRole = roleRepository.findByNameAndSchoolId("ROLE_PARENT", schoolId)
                                .orElseGet(() -> createRole("ROLE_PARENT", "Parent role", schoolId,
                                                superadmin.getUsername()));
                log.info("parentRole found : {}", parentRole);

                Role userRole = roleRepository.findByNameAndSchoolId("ROLE_USER", schoolId)
                                .orElseGet(() -> createRole("ROLE_USER", "defaul role for user", schoolId,
                                                superadmin.getUsername()));
                log.info("userRole found : {}", userRole);

                // Assign permissions to roles
                // permissions.stream()
                // .filter(permission ->
                // !SUPERADMIN_RESERVED_PERMISSIONS.contains(permission.getName()))
                // .forEach(permission -> linkPermissionToRole(permission, adminRole, schoolId,
                // schoolAdmin, superadmin));
                // log.info("assign permission for SUPERADMIN_RESERVED_PERMISSIONS ");

                // permissions.stream()
                // .filter(permission ->
                // DEFAULT_TEACHER_PERMISSIONS.contains(permission.getName()))
                // .forEach(permission -> linkPermissionToRole(permission, teacherRole,
                // schoolId, null,
                // superadmin));
                // log.info("assign permission for DEFAULT_TEACHER_PERMISSIONS");
                // permissions.stream()
                // .filter(permission ->
                // DEFAULT_STUDENT_PERMISSIONS.contains(permission.getName()))
                // .forEach(permission -> linkPermissionToRole(permission, studentRole,
                // schoolId, null,
                // superadmin));
                // log.info("assign permission for DEFAULT_STUDENT_PERMISSIONS");

                // permissions.stream()
                // .filter(permission ->
                // DEFAULT_PARENT_PERMISSIONS.contains(permission.getName()))
                // .forEach(permission -> linkPermissionToRole(permission, parentRole, schoolId,
                // null,
                // superadmin));
                // log.info("assign permission for DEFAULT_PARENT_PERMISSIONS");

        }

        private Permission getOrCreatePermission(PermissionTemplate template, String schoolId, User superadmin) {
                return permissionRepository.findByNameAndSchoolId(template.getName(), schoolId)
                                .orElseGet(() -> {
                                        Permission permission = new Permission();
                                        permission.setName(template.getName());
                                        permission.setDescription(template.getDescription());
                                        permission.setSchoolId(schoolId);
                                        permission.setCreatedBy(superadmin.getUsername());
                                        permission.setEndpoint(template.getEndpoint()); // Keep the * wildcard as-is
                                        permission.setHttpMethod(template.getHttpMethod());
                                        permission.setCreatedAt(LocalDateTime.now());
                                        permission.setUpdatedAt(LocalDateTime.now());
                                        permission.setIs_active(true);
                                        return permissionRepository.save(permission);
                                });
        }

        private Role createRole(String name, String description, String schoolId, String createdBy) {
                log.info("creating roles in role creates");
                Role role = new Role();
                role.setName(name);
                role.setDescription(description);
                role.setSchoolId(schoolId);
                role.setCreatedBy(createdBy);
                role.setCreatedAt(LocalDateTime.now());
                role.setUpdatedAt(LocalDateTime.now());
                role.setIsActive(true);
                return roleRepository.save(role);
        }

        // private void linkPermissionToRole(Permission permission, Role role, String
        // schoolId, User user,
        // User createdBy) {
        // boolean exists =
        // userRolePermissionRepository.existsByRoleAndPermissionAndSchoolId(role,
        // permission,
        // schoolId);
        // log.info("inside linkPermissionToRole");

        // if (!exists) {
        // UserRolePermission urp = new UserRolePermission();
        // urp.setSchoolId(schoolId);
        // urp.setUser(user); // null means default permission for that role
        // urp.setRole(role);
        // urp.setPermission(permission);
        // urp.setIsActive(true);
        // urp.setCreatedBy(createdBy.getUsername());
        // urp.setCreatedAt(LocalDateTime.now());
        // urp.setUpdatedAt(LocalDateTime.now());
        // userRolePermissionRepository.save(urp);
        // }
        // log.info("finishing linkPermissionToRole");

        // }
        @Transactional
        public void assignDefaultRoleToUser(User user, String roleName, String schoolId, User createdBy) {
                // Step 1: Find the role
                Role role = roleRepository.findByNameAndSchoolId(roleName, schoolId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Role " + roleName + " not found for school: " + schoolId));
                log.info("Role retrieved: {}", role);

                // Step 2: Add the role to the user's roles set and save the user
                user.getRoles().add(role); // Add the role to the user's @ManyToMany relationship
                User savedUser = userRepository.save(user); // Save the user with the updated roles
                log.info("User saved with role: {}", savedUser);

                // Step 3: Define default permissions for the role (instead of querying
                // UserRolePermission with user = null)
                Set<String> defaultPermissionNames;
                switch (roleName) {
                        case "ROLE_ADMIN":
                                defaultPermissionNames = ADMIN_RESERVED_PERMISSIONS;
                                break;
                        case "ROLE_TEACHER":
                                defaultPermissionNames = DEFAULT_TEACHER_PERMISSIONS;
                                break;
                        case "ROLE_STUDENT":
                                defaultPermissionNames = DEFAULT_STUDENT_PERMISSIONS;
                                break;
                        case "ROLE_PARENT":
                                defaultPermissionNames = DEFAULT_PARENT_PERMISSIONS;
                                break;
                        case "DEFAULT_USER_PERMISSIONS":
                                defaultPermissionNames = DEFAULT_USER_PERMISSIONS;
                                break;
                        default:
                                defaultPermissionNames = Set.of("CHANGE_PASSWORD"); // Minimal default permission
                }
                log.info("Default permission names for role {}: {}", roleName, defaultPermissionNames);

                // Step 4: Retrieve or create permissions and assign them to the user
                defaultPermissionNames.forEach(permissionName -> {
                        Permission permission = permissionRepository.findByNameAndSchoolId(permissionName, schoolId)
                                        .orElseGet(() -> {
                                                // Create the permission if it doesn’t exist (should ideally be
                                                // pre-seeded)
                                                Permission newPermission = new Permission();
                                                newPermission.setName(permissionName);
                                                newPermission.setSchoolId(schoolId);
                                                newPermission.setDescription(
                                                                "Auto-generated permission for " + roleName);
                                                newPermission.setEndpoint("/auth/api/" + permissionName.toLowerCase()); // Example
                                                                                                                        // endpoint
                                                newPermission.setHttpMethod("POST"); // Example method
                                                newPermission.setIs_active(true);
                                                newPermission.setCreatedBy(createdBy.getUsername());
                                                newPermission.setCreatedAt(LocalDateTime.now());
                                                newPermission.setUpdatedAt(LocalDateTime.now());
                                                return permissionRepository.save(newPermission);
                                        });

                        // Step 5: Create and save UserRolePermission entry
                        UserRolePermission urp = new UserRolePermission();
                        urp.setSchoolId(schoolId);
                        urp.setUser(savedUser); // User is non-null as required
                        urp.setRole(role);
                        urp.setType("default");
                        urp.setPermission(permission);
                        urp.setIsActive(true);
                        urp.setCreatedBy(createdBy.getUsername());
                        urp.setCreatedAt(LocalDateTime.now());
                        urp.setUpdatedAt(LocalDateTime.now());
                        userRolePermissionRepository.save(urp);
                });

                log.info("Assigned default role {} and permissions to user {} in school {}", roleName,
                                savedUser.getUsername(), schoolId);
        }
}
