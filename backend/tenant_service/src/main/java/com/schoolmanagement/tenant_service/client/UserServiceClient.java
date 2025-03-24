package com.schoolmanagement.tenant_service.client;

import com.schoolmanagement.tenant_service.dto.PermissionCheckRequest;
import com.schoolmanagement.tenant_service.dto.PermissionCheckResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "user-service", url = "${user.service.url:http://10.194.61.74:8087}", configuration = FeignConfig.class)
public interface UserServiceClient {

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