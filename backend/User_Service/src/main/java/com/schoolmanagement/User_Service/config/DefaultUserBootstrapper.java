package com.schoolmanagement.User_Service.config;

import com.schoolmanagement.User_Service.model.Permission;
import com.schoolmanagement.User_Service.model.Role;
import com.schoolmanagement.User_Service.model.User;
import com.schoolmanagement.User_Service.model.UserRolePermission;
import com.schoolmanagement.User_Service.repository.PermissionRepository;
import com.schoolmanagement.User_Service.repository.RoleRepository;
import com.schoolmanagement.User_Service.repository.UserRepository;
import com.schoolmanagement.User_Service.repository.UserRolePermissionRepository;
import com.schoolmanagement.User_Service.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DefaultUserBootstrapper implements ApplicationRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRolePermissionRepository userRolePermissionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        String schoolId = "GLOBAL"; // Default school ID for initial setup
        String adminSchoolId = "admin"; // Default school ID for initial setup
        String username = "wandi";

        if (!userRepository.existsByUsername(username)) {
            // Create default permissions
            // Permission addUsersPermission = new Permission();
            // addUsersPermission.setName("CREATE_USER");
            // addUsersPermission.setDescription("Permission to add new users");
            // addUsersPermission.setSchoolId(adminSchoolId);
            // addUsersPermission.setCreatedBy("system");
            // addUsersPermission.setEndpoint("/auth/api/{schoolId}/register");
            // addUsersPermission.setHttpMethod("POST");
            // addUsersPermission.setCreatedAt(LocalDateTime.now());
            // addUsersPermission.setUpdatedAt(LocalDateTime.now());
            // addUsersPermission.setIsActive(true);
            // permissionRepository.save(addUsersPermission);

            Permission createSchoolPermission = new Permission();
            createSchoolPermission.setName("CREATE_SCHOOL");
            createSchoolPermission.setDescription("Permission to create a new school");
            createSchoolPermission.setSchoolId(adminSchoolId);
            createSchoolPermission.setCreatedBy("system");
            createSchoolPermission.setEndpoint("/tenant/api/addNewSchool");
            createSchoolPermission.setHttpMethod("POST");
            createSchoolPermission.setCreatedAt(LocalDateTime.now());
            createSchoolPermission.setUpdatedAt(LocalDateTime.now());
            createSchoolPermission.setIsActive(true);
            permissionRepository.save(createSchoolPermission);
            

            Permission getUserActivityPermission = new Permission();
            getUserActivityPermission.setName("GET_USER_ACTIVITY");
            getUserActivityPermission.setDescription("Permission to create a new school");
            getUserActivityPermission.setSchoolId(adminSchoolId);
            getUserActivityPermission.setCreatedBy("system");
            getUserActivityPermission.setEndpoint("/tenant/api/addNewSchool");
            getUserActivityPermission.setHttpMethod("POST");
            getUserActivityPermission.setCreatedAt(LocalDateTime.now());
            getUserActivityPermission.setUpdatedAt(LocalDateTime.now());
            getUserActivityPermission.setIsActive(true);
            permissionRepository.save(getUserActivityPermission);

            Permission getAdminActivityPermission = new Permission();
            getAdminActivityPermission.setName("GET_ADMIN_ACTIVITY");
            getAdminActivityPermission.setDescription("Permission to create a new school");
            getAdminActivityPermission.setSchoolId(adminSchoolId);
            getAdminActivityPermission.setCreatedBy("system");
            getAdminActivityPermission.setEndpoint("/tenant/api/addNewSchool");
            getAdminActivityPermission.setHttpMethod("POST");
            getAdminActivityPermission.setCreatedAt(LocalDateTime.now());
            getAdminActivityPermission.setUpdatedAt(LocalDateTime.now());
            getAdminActivityPermission.setIsActive(true);
            permissionRepository.save(getAdminActivityPermission);

            Permission registerAdminPermission = new Permission();
            registerAdminPermission.setName("REGISTER_ADMIN");
            registerAdminPermission.setDescription("Permission to register an admin user");
            registerAdminPermission.setSchoolId(adminSchoolId);
            registerAdminPermission.setCreatedBy("system");
            registerAdminPermission.setEndpoint("/auth/api/register");
            registerAdminPermission.setHttpMethod("POST");
            registerAdminPermission.setCreatedAt(LocalDateTime.now());
            registerAdminPermission.setUpdatedAt(LocalDateTime.now());
            registerAdminPermission.setIsActive(true);
            permissionRepository.save(registerAdminPermission);

            // Create default User Role
            Role userRole = new Role();
            userRole.setName("ROLE_USER");
            userRole.setDescription("User role");
            userRole.setSchoolId(adminSchoolId);
            userRole.setCreatedBy("system");
            userRole.setCreatedAt(LocalDateTime.now());
            userRole.setUpdatedAt(LocalDateTime.now());
            userRole.setIsActive(true);
            roleRepository.save(userRole);

            // Create default Superadmin role (instead of just ROLE_ADMIN)
            Role superadminRole = new Role();
            superadminRole.setName("ROLE_SUPERADMIN"); // Changed to reflect full privileges
            superadminRole.setDescription("Super administrator role with all permissions");
            superadminRole.setSchoolId(adminSchoolId);
            superadminRole.setCreatedBy("system");
            superadminRole.setCreatedAt(LocalDateTime.now());
            superadminRole.setUpdatedAt(LocalDateTime.now());
            superadminRole.setIsActive(true);
            roleRepository.save(superadminRole);

            // Create default user and assign roles
            User defaultUser = User.builder()
                    .userId("wandi-1")
                    .schoolId(adminSchoolId) // Consider using "GLOBAL" for consistency
                    .username(username)
                    .email("wondimayewaschalew@gmail.com")
                    .password(passwordEncoder.encode("wandi123"))
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .createdBy("system")
                    .build();

            // Assign the role to the user via the @ManyToMany relationship
            Set<Role> roles = new HashSet<>();
            roles.add(superadminRole);
            defaultUser.setRoles(roles);

            // Save the user (this will populate user_roles)
            userRepository.save(defaultUser);

            // Link user, role, and permissions via UserRolePermission
            // UserRolePermission urpAddUsers = new UserRolePermission();
            // urpAddUsers.setSchoolId(adminSchoolId);
            // urpAddUsers.setUser(defaultUser);
            // urpAddUsers.setRole(superadminRole);
            // urpAddUsers.setPermission(addUsersPermission);
            // urpAddUsers.setIsActive(true);
            // urpAddUsers.setCreatedBy("system");
            // urpAddUsers.setCreatedAt(LocalDateTime.now());
            // urpAddUsers.setUpdatedAt(LocalDateTime.now());
            // userRolePermissionRepository.save(urpAddUsers);

            UserRolePermission urpCreateSchool = new UserRolePermission();
            urpCreateSchool.setSchoolId(adminSchoolId);
            urpCreateSchool.setUser(defaultUser);
            urpCreateSchool.setRole(superadminRole);
            urpCreateSchool.setPermission(createSchoolPermission);
            urpCreateSchool.setIsActive(true);
            urpCreateSchool.setCreatedBy("system");
            urpCreateSchool.setCreatedAt(LocalDateTime.now());
            urpCreateSchool.setUpdatedAt(LocalDateTime.now());
            userRolePermissionRepository.save(urpCreateSchool);

            UserRolePermission urpRegisterAdmin = new UserRolePermission();
            urpRegisterAdmin.setSchoolId(adminSchoolId);
            urpRegisterAdmin.setUser(defaultUser);
            urpRegisterAdmin.setRole(superadminRole);
            urpRegisterAdmin.setPermission(registerAdminPermission);
            urpRegisterAdmin.setIsActive(true);
            urpRegisterAdmin.setCreatedBy("system");
            urpRegisterAdmin.setCreatedAt(LocalDateTime.now());
            urpRegisterAdmin.setUpdatedAt(LocalDateTime.now());
            userRolePermissionRepository.save(urpRegisterAdmin);
        }
    }
}