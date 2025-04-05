package com.schoolmanagement.communication_service.client;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import com.schoolmanagement.communication_service.dto.request.PermissionCheckRequest;
import com.schoolmanagement.communication_service.dto.response.PermissionCheckResponse;

@FeignClient(name = "user-service", url = "${user.service.url:http://localhost:8080}", configuration = FeignConfig.class)
public interface UserManagementClient {

    @GetMapping("/auth/api/{schoolId}/{userId}/email")
    String getUserEmail(@PathVariable String schoolId, @PathVariable String userId);

    @GetMapping("/auth/api/{schoolId}/role")
    List<String> getUserIdsByRole(
            @PathVariable String schoolId,
            @RequestParam String role);

    @PostMapping("/auth/api/internal/check-permission")
    PermissionCheckResponse checkUserPermission(
            @RequestBody PermissionCheckRequest request,
            @RequestHeader("Authorization") String authorization); // Only user token passed explicitly

    @PostMapping("/auth/api/internal/schools/{schoolId}/bootstrap-permissions")
    String initializeSchoolPermissions(
            @PathVariable("schoolId") String schoolId,
            @RequestBody PermissionCheckRequest request,
            @RequestHeader("Authorization") String authorization);
}