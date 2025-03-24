package com.schoolmanagement.User_Service.config;

import com.schoolmanagement.User_Service.model.PermissionTemplate;
import com.schoolmanagement.User_Service.repository.PermissionTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class PermissionTemplateBootstrapper implements CommandLineRunner {

        private final PermissionTemplateRepository permissionTemplateRepository;

        @Override
        public void run(String... args) {
                if (permissionTemplateRepository.count() == 0) {
                        List<PermissionTemplate> defaults = List.of(
                                        // AuthController
                                        new PermissionTemplate("LOGIN_USER", "Authenticate and log in a user",
                                                        "/auth/api/login", "POST"),
                                        new PermissionTemplate("REGISTER_USER", "Register a new user in a school",
                                                        "/auth/api/*/register", "POST"), // {schoolId} -> *
                                        new PermissionTemplate("REGISTER_ADMIN", "Register an admin user",
                                                        "/auth/api/register", "POST"),
                                        // PasswordResetController
                                        new PermissionTemplate("INITIATE_PASSWORD_RESET",
                                                        "Request a password reset link",
                                                        "/auth/api/forgot-password", "POST"),
                                        new PermissionTemplate("RESET_PASSWORD", "Reset password using a token",
                                                        "/auth/api/reset-password", "POST"),

                                        // PermissionController
                                        new PermissionTemplate("VIEW_ALL_PERMISSIONS",
                                                        "View all permissions in a school",
                                                        "/auth/api/*/permissions", "GET"), // {schoolId} -> *
                                        new PermissionTemplate("VIEW_PERMISSION_BY_ID",
                                                        "View a specific permission by ID",
                                                        "/auth/api/*/permissions/*", "GET"), // {schoolId}/{permissionId}
                                                                                             // -> */*
                                        new PermissionTemplate("CREATE_PERMISSION", "Create a new permission",
                                                        "/auth/api/*/permissions", "POST"), // {schoolId} -> *
                                        new PermissionTemplate("UPDATE_PERMISSION", "Update an existing permission",
                                                        "/auth/api/*/permissions/*", "PUT"), // {schoolId}/{permissionId}
                                                                                             // -> */*
                                        new PermissionTemplate("DELETE_PERMISSION", "Delete a permission",
                                                        "/auth/api/*/permissions/*", "DELETE"), // {schoolId}/{permissionId}
                                                                                                // -> */*
                                        new PermissionTemplate("VIEW_PERMISSION_BY_NAME", "View a permission by name",
                                                        "/auth/api/*/permissions/name/*", "GET"), // {schoolId}/{name}

                                        new PermissionTemplate("VIEW_PERMISSION_BY_ROLE",
                                                        "View Default permissions for Role",
                                                        "/auth/api/*/permissions/by-role/*", "GET"),

                                        new PermissionTemplate("VIEW_PERMISSIONS_BY_USER",
                                                        "View All permissions for User",
                                                        "/auth/api/*/permissions/by-user/*", "GET"),

                                        // -> */*

                                        // RoleController
                                        new PermissionTemplate("VIEW_ROLE_BY_ID", "View a specific role by ID",
                                                        "/auth/api/*/roles/*", "GET"), // {schoolId}/{roleId} -> */*
                                        new PermissionTemplate("VIEW_ALL_ROLES", "View all roles in a school",
                                                        "/auth/api/*/roles", "GET"), // {schoolId} -> *
                                        new PermissionTemplate("CREATE_ROLE", "Create a new role",
                                                        "/auth/api/*/roles", "POST"), // {schoolId} -> *
                                        new PermissionTemplate("UPDATE_ROLE", "Update an existing role",
                                                        "/auth/api/*/roles/*", "PUT"), // {schoolId}/{roleId} -> */*
                                        new PermissionTemplate("DELETE_ROLE", "Delete a role",
                                                        "/auth/api/*/roles/*", "DELETE"), // {schoolId}/{roleId} -> */*
                                        new PermissionTemplate("ASSIGN_ROLE_TO_USER", "Assign a role to a user",
                                                        "/auth/api/*/roles/*/assign/*", "POST"), // {schoolId}/{roleId}/{userId}
                                                                                                 // -> */*/*
                                        new PermissionTemplate("ASSIGN_PERMISSIONS_TO_USER",
                                                        "Assign permissions to a user via a role",
                                                        "/auth/api/*/roles/assign-permissions", "POST"), // {schoolId}
                                                                                                         // -> *
                                        new PermissionTemplate("REMOVE_ROLE_FROM_USER", "Remove a role from a user",
                                                        "/auth/api/*/roles/remove-role", "DELETE"), // {schoolId} -> *

                                        // UserController
                                        new PermissionTemplate("UPDATE_USER", "Update a user’s details",
                                                        "/auth/api/*/users/*", "PUT"), // {schoolId}/{userId} -> */*
                                        new PermissionTemplate("VIEW_USER_BY_ID", "View a specific user’s details",
                                                        "/auth/api/*/users/*", "GET"), // {schoolId}/{userId} -> */*
                                        new PermissionTemplate("VIEW_USERS_BY_ROLES", "View users by role IDs",
                                                        "/auth/api/*/users/roles", "GET"), // {schoolId} -> *
                                        new PermissionTemplate("DELETE_USER", "Delete a user",
                                                        "/auth/api/*/users/*", "DELETE"), // {schoolId}/{userId} -> */*
                                        new PermissionTemplate("VIEW_ALL_USERS", "View all users in a school",
                                                        "/auth/api/*/users", "GET"), // {schoolId} -> *
                                        new PermissionTemplate("VIEW_USER_EMAIL", "View a user’s email",
                                                        "/auth/api/*/users/*/email", "GET"), // {schoolId}/{userId} ->
                                                                                             // */*
                                        new PermissionTemplate("VIEW_USER_IDS_BY_ROLE", "View user IDs by role name",
                                                        "/auth/api/*/users/role", "GET"), // {schoolId} -> *
                                        new PermissionTemplate("CHANGE_PASSWORD",
                                                        "Change the authenticated user’s password",
                                                        "/auth/api/*/change-password", "PUT"), // {schoolId} -> *
                                        new PermissionTemplate("GET_USER_ACTIVITY",
                                                        "Get all user activity with in the school",
                                                        "/auth/api/*/activity", "GET"), // {school_id} -> *

                                        // TenantService permissions
                                        new PermissionTemplate("CHECK_PERMISSION",
                                                        "Internal Api for checking permission",
                                                        "/auth/api/internal/check-permission", "POST"),
                                        new PermissionTemplate("EDIT_SCHOOL", "Edit an existing school",
                                                        "/tenant/api/editSchoolById/*", "PUT"), // {school_id} -> *
                                        new PermissionTemplate("VIEW_ALL_SCHOOLS", "View all schools",
                                                        "/tenant/api/getAllSchools", "GET"),
                                        new PermissionTemplate("VIEW_SCHOOL_BY_ID", "View school by ID",
                                                        "/tenant/api/getSchoolById/*", "GET"), // {school_id} -> *
                                        new PermissionTemplate("DELETE_SCHOOL_BY_ID", "Delete school by ID",
                                                        "/tenant/api/deleteSchoolById/*", "DELETE"), // {school_id} -> *
                                        new PermissionTemplate("ADD_SCHOOL", "Adding school",
                                                        "/tenant/api/addNewSchool", "POST") // {school_id} -> *

                        );
                        permissionTemplateRepository.saveAll(defaults);
                }
        }
}