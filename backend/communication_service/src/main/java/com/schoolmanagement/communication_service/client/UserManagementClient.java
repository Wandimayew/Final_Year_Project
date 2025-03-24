package com.schoolmanagement.communication_service.client;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "userService", url = "${user.management.service.url}")
public interface UserManagementClient {

    @GetMapping("/api/users/{schoolId}/{userId}/email")
    String getUserEmail(@PathVariable String schoolId,@PathVariable String userId);

    @GetMapping("/api/users/{schoolId}/role")
    List<String> getUserIdsByRole(
            @PathVariable String schoolId,
            @RequestParam String role);
}