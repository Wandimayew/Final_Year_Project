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
import com.schoolmanagement.User_Service.config.PermissionTemplateFactory;
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
                        "REGISTER_ADMIN", "ADD_SCHOOL", "EDIT_SCHOOL", "VIEW_ALL_SCHOOLS",
                        "DELETE_SCHOOL_BY_ID");

        // All permissions available for ROLE_ADMIN (excluding superadmin-specific ones)
        private static final Set<String> ADMIN_DEFAULT_PERMISSIONS = PermissionTemplateFactory.createDefaultTemplates()
                        .stream()
                        .map(PermissionTemplate::getName)
                        .filter(name -> !SUPERADMIN_RESERVED_PERMISSIONS.contains(name))
                        .collect(Collectors.toSet());

        private static final Set<String> DEFAULT_TEACHER_PERMISSIONS = Set.of(
                        "VIEW_USER_BY_ID", "VIEW_ALL_USERS_BY_SCHOOL", "VIEW_ALL_ROLES", "CHANGE_PASSWORD",
                        "VIEW_PERMISSION_BY_ROLE", "INITIATE_PASSWORD_RESET", "RESET_PASSWORD",
                        "VIEW_PERMISSIONS_BY_USER", "LOGOUT_USER", "VIEW_ROLE_BY_ID", "CHECK_PERMISSION",
                        "VIEW_PERMISSION_BY_NAME", "UPDATE_USER", "VIEW_USER_EMAIL", "VIEW_USER_IDS_BY_ROLE",
                        "VIEW_USER_COUNTS_BY_ROLE", "ADD_CLASS", "EDIT_CLASS", "VIEW_ALL_CLASSES_BY_SCHOOL",
                        "VIEW_ALL_CLASSES_BY_STREAM", "VIEW_CLASS_BY_ID", "VIEW_CLASS_DETAILS", "ADD_SECTION",
                        "EDIT_SECTION", "VIEW_ALL_SECTIONS_BY_CLASS", "VIEW_SECTION_BY_ID",
                        "VIEW_ALL_STREAMS_BY_SCHOOL", "VIEW_STREAM_BY_ID", "VIEW_ALL_SUBJECTS_BY_CLASS",
                        "VIEW_ALL_SUBJECTS_BY_STREAM", "VIEW_ALL_SUBJECTS_BY_SCHOOL", "VIEW_SUBJECT_BY_ID",
                        "VIEW_ALL_TIMETABLES_BY_CLASS", "VIEW_TIMETABLE_BY_ID", "VIEW_TIMETABLE_BY_STREAM");

        private static final Set<String> DEFAULT_STUDENT_PERMISSIONS = Set.of(
                        "VIEW_USER_BY_ID", "INITIATE_PASSWORD_RESET", "RESET_PASSWORD", "CHANGE_PASSWORD",
                        "VIEW_PERMISSION_BY_ROLE", "VIEW_PERMISSIONS_BY_USER", "CHECK_PERMISSION",
                        "VIEW_PERMISSION_BY_NAME", "VIEW_ROLE_BY_ID", "UPDATE_USER", "VIEW_USER_EMAIL",
                        "VIEW_ALL_CLASSES_BY_SCHOOL", "VIEW_ALL_CLASSES_BY_STREAM", "VIEW_CLASS_BY_ID",
                        "VIEW_CLASS_DETAILS", "VIEW_ALL_SECTIONS_BY_CLASS", "VIEW_SECTION_BY_ID",
                        "VIEW_ALL_STREAMS_BY_SCHOOL", "VIEW_STREAM_BY_ID", "VIEW_ALL_SUBJECTS_BY_CLASS",
                        "VIEW_ALL_SUBJECTS_BY_STREAM", "VIEW_ALL_SUBJECTS_BY_SCHOOL", "VIEW_SUBJECT_BY_ID",
                        "VIEW_ALL_TIMETABLES_BY_CLASS", "VIEW_TIMETABLE_BY_ID");

        private static final Set<String> DEFAULT_PARENT_PERMISSIONS = Set.of(
                        "VIEW_USER_BY_ID", "INITIATE_PASSWORD_RESET", "RESET_PASSWORD", "CHANGE_PASSWORD",
                        "VIEW_PERMISSION_BY_ROLE", "VIEW_PERMISSIONS_BY_USER", "CHECK_PERMISSION",
                        "VIEW_PERMISSION_BY_NAME", "VIEW_ROLE_BY_ID", "UPDATE_USER", "VIEW_USER_EMAIL",
                        "VIEW_ALL_CLASSES_BY_SCHOOL", "VIEW_ALL_CLASSES_BY_STREAM", "VIEW_CLASS_BY_ID",
                        "VIEW_CLASS_DETAILS", "VIEW_ALL_SECTIONS_BY_CLASS", "VIEW_SECTION_BY_ID",
                        "VIEW_ALL_STREAMS_BY_SCHOOL", "VIEW_STREAM_BY_ID", "VIEW_ALL_SUBJECTS_BY_CLASS",
                        "VIEW_SUBJECT_BY_ID", "VIEW_ALL_TIMETABLES_BY_CLASS", "VIEW_TIMETABLE_BY_ID");

        private static final Set<String> DEFAULT_USER_PERMISSIONS = Set.of(
                        "CHANGE_PASSWORD", "INITIATE_PASSWORD_RESET", "RESET_PASSWORD", "VIEW_PERMISSION_BY_NAME",
                        "UPDATE_USER", "VIEW_USER_EMAIL", "VIEW_USER_BY_ID", "VIEW_PERMISSION_BY_ROLE",
                        "VIEW_ALL_CLASSES_BY_SCHOOL", "VIEW_ROLE_BY_ID", "VIEW_PERMISSIONS_BY_USER", "CHECK_PERMISSION",
                        "VIEW_ALL_CLASSES_BY_STREAM", "VIEW_CLASS_BY_ID", "VIEW_CLASS_DETAILS",
                        "VIEW_ALL_SECTIONS_BY_CLASS", "VIEW_SECTION_BY_ID", "VIEW_ALL_STREAMS_BY_SCHOOL",
                        "VIEW_STREAM_BY_ID", "VIEW_ALL_SUBJECTS_BY_CLASS", "VIEW_SUBJECT_BY_ID",
                        "VIEW_ALL_TIMETABLES_BY_CLASS", "VIEW_TIMETABLE_BY_ID");

        @Transactional
        public void createDefaultPermissionsAndRoles(String schoolId, User superadmin, User schoolAdmin) {
                List<PermissionTemplate> templates = permissionTemplateRepository.findAll();

                log.info("Templates found: {}", templates);
                List<Permission> permissions = templates.stream()
                                .map(template -> getOrCreatePermission(template, schoolId, superadmin))
                                .collect(Collectors.toList());

                log.info("Permissions created: {}", permissions);

                Role adminRole = roleRepository.findByNameAndSchoolId("ROLE_ADMIN", schoolId)
                                .orElseGet(() -> createRole("ROLE_ADMIN", "School administrator", schoolId,
                                                superadmin.getUsername()));
                log.info("Admin role: {}", adminRole);

                Role teacherRole = roleRepository.findByNameAndSchoolId("ROLE_TEACHER", schoolId)
                                .orElseGet(() -> createRole("ROLE_TEACHER", "Teacher role", schoolId,
                                                superadmin.getUsername()));
                log.info("Teacher role: {}", teacherRole);

                Role studentRole = roleRepository.findByNameAndSchoolId("ROLE_STUDENT", schoolId)
                                .orElseGet(() -> createRole("ROLE_STUDENT", "Student role", schoolId,
                                                superadmin.getUsername()));
                log.info("Student role: {}", studentRole);

                Role parentRole = roleRepository.findByNameAndSchoolId("ROLE_PARENT", schoolId)
                                .orElseGet(() -> createRole("ROLE_PARENT", "Parent role", schoolId,
                                                superadmin.getUsername()));
                log.info("Parent role: {}", parentRole);

                Role userRole = roleRepository.findByNameAndSchoolId("ROLE_USER", schoolId)
                                .orElseGet(() -> createRole("ROLE_USER", "Default role for user", schoolId,
                                                superadmin.getUsername()));
                log.info("User role: {}", userRole);
        }

        private Permission getOrCreatePermission(PermissionTemplate template, String schoolId, User superadmin) {
                return permissionRepository.findByNameAndSchoolId(template.getName(), schoolId)
                                .orElseGet(() -> {
                                        Permission permission = new Permission();
                                        permission.setName(template.getName());
                                        permission.setDescription(template.getDescription());
                                        permission.setSchoolId(schoolId);
                                        permission.setCreatedBy(superadmin.getUsername());
                                        permission.setEndpoint(template.getEndpoint());
                                        permission.setHttpMethod(template.getHttpMethod());
                                        permission.setCreatedAt(LocalDateTime.now());
                                        permission.setUpdatedAt(LocalDateTime.now());
                                        permission.setIs_active(true);
                                        return permissionRepository.save(permission);
                                });
        }

        private Role createRole(String name, String description, String schoolId, String createdBy) {
                log.info("Creating role: {}", name);
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

        @Transactional
        public void assignDefaultRoleToUser(User user, String roleName, String schoolId, User createdBy) {
                Role role = roleRepository.findByNameAndSchoolId(roleName, schoolId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Role " + roleName + " not found for school: " + schoolId));
                log.info("Role retrieved: {}", role);

                user.getRoles().add(role);
                User savedUser = userRepository.save(user);
                log.info("User saved with role: {}", savedUser);

                Set<String> defaultPermissionNames;
                switch (roleName) {
                        case "ROLE_ADMIN":
                                defaultPermissionNames = ADMIN_DEFAULT_PERMISSIONS; // All permissions except superadmin
                                                                                    // reserved
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
                        case "ROLE_USER":
                                defaultPermissionNames = DEFAULT_USER_PERMISSIONS;
                                break;
                        default:
                                defaultPermissionNames = Set.of("CHANGE_PASSWORD");
                }
                log.info("Default permission names for role {}: {}", roleName, defaultPermissionNames);

                defaultPermissionNames.forEach(permissionName -> {
                        Permission permission = permissionRepository.findByNameAndSchoolId(permissionName, schoolId)
                                        .orElseGet(() -> {
                                                PermissionTemplate template = PermissionTemplateFactory
                                                                .createDefaultTemplates().stream()
                                                                .filter(t -> t.getName().equals(permissionName))
                                                                .findFirst()
                                                                .orElseThrow(() -> new RuntimeException(
                                                                                "No template for permission: "
                                                                                                + permissionName));
                                                Permission newPermission = new Permission();
                                                newPermission.setName(permissionName);
                                                newPermission.setSchoolId(schoolId);
                                                newPermission.setDescription(template.getDescription());
                                                newPermission.setEndpoint(template.getEndpoint());
                                                newPermission.setHttpMethod(template.getHttpMethod());
                                                newPermission.setIs_active(true);
                                                newPermission.setCreatedBy(createdBy.getUsername());
                                                newPermission.setCreatedAt(LocalDateTime.now());
                                                newPermission.setUpdatedAt(LocalDateTime.now());
                                                return permissionRepository.save(newPermission);
                                        });

                        UserRolePermission urp = new UserRolePermission();
                        urp.setSchoolId(schoolId);
                        urp.setUser(savedUser);
                        urp.setRole(role);
                        urp.setPermission(permission);
                        urp.setType("default");
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