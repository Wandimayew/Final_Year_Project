package com.schoolmanagement.User_Service.config;

import com.schoolmanagement.User_Service.model.Permission;
import com.schoolmanagement.User_Service.model.Role;
import com.schoolmanagement.User_Service.model.User;
import com.schoolmanagement.User_Service.model.UserRolePermission;
import com.schoolmanagement.User_Service.repository.PermissionRepository;
import com.schoolmanagement.User_Service.repository.RoleRepository;
import com.schoolmanagement.User_Service.repository.UserRepository;
import com.schoolmanagement.User_Service.repository.UserRolePermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DefaultUserBootstrapper implements ApplicationRunner {

        private final UserRepository userRepository;
        private final RoleRepository roleRepository;
        private final PermissionRepository permissionRepository;
        private final UserRolePermissionRepository userRolePermissionRepository;
        private final PasswordEncoder passwordEncoder;

        @Override
        public void run(org.springframework.boot.ApplicationArguments args) {
                String username = "wandi";
                String schoolId = "admin";

                if (!userRepository.existsByUsername(username)) {
                        // Create superadmin role
                        Role superadminRole = createRole("ROLE_SUPERADMIN",
                                        "Super administrator role with all permissions", schoolId);
                        roleRepository.save(superadminRole);

                        // Create user
                        User defaultUser = createUser(username, schoolId);
                        userRepository.save(defaultUser);

                        // Assign permissions via role
                        assignPermissionsToUser(defaultUser, superadminRole, schoolId);
                }
        }

        private Role createRole(String name, String description, String schoolId) {
                Role role = new Role();
                role.setName(name);
                role.setDescription(description);
                role.setSchoolId(schoolId);
                role.setCreatedBy("system");
                role.setCreatedAt(LocalDateTime.now());
                role.setUpdatedAt(LocalDateTime.now());
                role.setIsActive(true);
                return role;
        }

        private User createUser(String username, String schoolId) {
                return User.builder()
                                .userId("wandi-1")
                                .schoolId(schoolId)
                                .username(username)
                                .email("wondimayewaschalew@gmail.com")
                                .password(passwordEncoder.encode("wandi123"))
                                .isActive(true)
                                .createdAt(LocalDateTime.now())
                                .updatedAt(LocalDateTime.now())
                                .createdBy("system")
                                .roles(new HashSet<>())
                                .build();
        }

        private void assignPermissionsToUser(User user, Role role, String schoolId) {
                List<Permission> permissions = List.of(
                                // AuthController Permissions (Superadmin-specific)
                                createPermission("REGISTER_ADMIN", "Permission to register an admin user",
                                                "/auth/api/register", "POST", schoolId),
                                createPermission("VIEW_LOGIN_ACTIVITY", "View login activity for any school",
                                                "/auth/api/*/activity", "GET", schoolId),
                                createPermission("LOGOUT_USER", "Logout and clear token",
                                                "/auth/api/logout", "POST", schoolId),

                                // User Controller Permissions
                                createPermission("VIEW_SCHOOL_ADMINS",
                                                "View the Admin of all registered school on the system",
                                                "/auth/api/getAllAdmins", "GET", schoolId),
                                createPermission("VIEW_SCHOOL_ADMINS_ACTIVITY",
                                                "View Admins Activity of all registered school on the system",
                                                "/auth/api/getAllAdminActivity", "GET", schoolId),
                                // PasswordResetController Permissions
                                createPermission("APPROVE_PASSWORD_RESET", "Approve a password reset request",
                                                "/auth/api/approve-password-reset", "POST", schoolId),
                                createPermission("VIEW_PENDING_PASSWORD_RESETS", "View pending password reset requests",
                                                "/auth/api/pending-password-resets", "GET", schoolId),

                                // PermissionCheckController Permissions
                                createPermission("CHECK_PERMISSION", "Check permission for any user",
                                                "/auth/api/internal/check-permission", "POST", schoolId),

                                // SchoolPermissionController Permissions
                                createPermission("BOOTSTRAP_PERMISSIONS", "Bootstrap permissions for any school",
                                                "/auth/api/internal/schools/*/bootstrap-permissions", "POST", schoolId),

                                // Tenant Service Permissions (SchoolController) - Full school management
                                createPermission("ADD_SCHOOL", "Add a new school", "/tenant/api/addNewSchool", "POST",
                                                schoolId),
                                createPermission("EDIT_SCHOOL", "Edit an existing school",
                                                "/tenant/api/editSchoolById/*", "PUT", schoolId),
                                createPermission("VIEW_ALL_SCHOOLS", "View all schools", "/tenant/api/getAllSchools",
                                                "GET", schoolId),
                                createPermission("VIEW_SCHOOL_BY_ID", "View school by ID",
                                                "/tenant/api/getSchoolById/*", "GET", schoolId),
                                createPermission("DELETE_SCHOOL_BY_ID", "Delete school by ID",
                                                "/tenant/api/deleteSchoolById/*", "DELETE", schoolId),
                                createPermission("VIEW_SCHOOL_STATS", "View school statistics",
                                                "/tenant/api/getSchoolStats/*", "GET", schoolId),
                                createPermission("VIEW_SCHOOL_COUNT",
                                                "View the Numbers of school registered on the system",
                                                "/tenant/api/getSchoolCount", "GET", schoolId),
                                createPermission("VIEW_SCHOOL_NAME", "View schools names",
                                                "/tenant/api/getSchoolName/*", "GET", schoolId),

                                // Tenant Service Permissions (SubscriptionPlanController) - Subscription plan
                                // management
                                createPermission("ADD_SUBSCRIPTION_PLAN", "Add a new subscription plan",
                                                "/tenant/api/addNewSubscriptionPlan", "POST", schoolId),
                                createPermission("EDIT_SUBSCRIPTION_PLAN", "Edit a subscription plan",
                                                "/tenant/api/editSubscriptioPlanById/*", "PUT", schoolId),
                                createPermission("VIEW_ALL_SUBSCRIPTION_PLANS", "View all subscription plans",
                                                "/tenant/api/getAllSubscriptionPlans", "GET", schoolId),
                                createPermission("VIEW_SUBSCRIPTION_PLAN_BY_ID", "View subscription plan by ID",
                                                "/tenant/api/getSubscriptionPlanById/*", "GET", schoolId),
                                createPermission("DELETE_SUBSCRIPTION_PLAN", "Delete subscription plan by ID",
                                                "/tenant/api/deleteSubscriptioPlanById/*", "DELETE", schoolId),
                                createPermission("VIEW_SCHOOLS_BY_PLAN", "View schools subscribed to a plan",
                                                "/tenant/api/getSchoolsByPlanId/*", "GET", schoolId),

                                // Tenant Service Permissions (SchoolSubscriptionController) - Subscription
                                // management
                                createPermission("ADD_SCHOOL_SUBSCRIPTION", "Add a new school subscription",
                                                "/tenant/api/*/addNewSchoolSubscription", "POST", schoolId),
                                createPermission("EDIT_SCHOOL_SUBSCRIPTION", "Edit a school subscription",
                                                "/tenant/api/*/editSchoolSubscriptionById/*", "PUT", schoolId),
                                createPermission("DELETE_SCHOOL_SUBSCRIPTION", "Delete school subscription by ID",
                                                "/tenant/api/*/deleteSchoolSubscriptionById/*", "DELETE", schoolId),
                                createPermission("VIEW_ALL_SCHOOL_SUBSCRIPTIONS", "View all school subscriptions",
                                                "/tenant/api/*/getAllSchoolSubscriptions", "GET", schoolId),
                                createPermission("VIEW_SUBSCRIPTIONS_BY_STATUS", "View subscriptions by status",
                                                "/tenant/api/getSubscriptionPending/*", "GET", schoolId),
                                createPermission("VIEW_SCHOOL_SUBSCRIPTION_BY_STATUS",
                                                "View school subscription by status",
                                                "/tenant/api/*/getSchoolSubscriptionByStatus/*", "GET", schoolId),
                                createPermission("MAKE_SUBSCRIPTION_PAYMENT", "Make a subscription payment",
                                                "/tenant/api/makeSubscriptionPayment", "POST", schoolId),
                                createPermission("APPROVE_SUBSCRIPTION_PAYMENT", "Approve a subscription payment",
                                                "/tenant/api/makeSubscriptionPaid", "POST", schoolId),
                                createPermission("VIEW_SCHOOL_SUBSCRIPTION_BY_ID", "View school subscription by ID",
                                                "/tenant/api/*/getSchoolSubscriptionById/*", "GET", schoolId),

                                // UserController Permissions (System-wide user management)
                                createPermission("VIEW_USER_COUNTS_BY_ROLE", "View user counts by role for any school",
                                                "/auth/api/*/users-counts", "GET", schoolId));

                permissionRepository.saveAll(permissions);

                permissions.forEach(permission -> {
                        UserRolePermission urp = new UserRolePermission();
                        urp.setSchoolId(schoolId);
                        urp.setUser(user);
                        urp.setRole(role);
                        urp.setPermission(permission);
                        urp.setIsActive(true);
                        urp.setCreatedBy("system");
                        urp.setCreatedAt(LocalDateTime.now());
                        urp.setUpdatedAt(LocalDateTime.now());
                        userRolePermissionRepository.save(urp);
                });

                user.getRoles().add(role);
                userRepository.save(user);
        }

        private Permission createPermission(String name, String description, String endpoint, String httpMethod,
                        String schoolId) {
                Permission permission = new Permission();
                permission.setName(name);
                permission.setDescription(description);
                permission.setEndpoint(endpoint);
                permission.setHttpMethod(httpMethod);
                permission.setSchoolId(schoolId);
                permission.setCreatedBy("system");
                permission.setCreatedAt(LocalDateTime.now());
                permission.setUpdatedAt(LocalDateTime.now());
                permission.setIs_active(true);
                return permission;
        }
}