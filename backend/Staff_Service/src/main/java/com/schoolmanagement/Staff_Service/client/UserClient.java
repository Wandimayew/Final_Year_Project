package com.schoolmanagement.Staff_Service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.schoolmanagement.Staff_Service.dto.UserResponseDTO;

@FeignClient(name = "User_Service", url = "http://localhost:8082/User_Service/api/users")
public interface UserClient {
    @GetMapping("/{userId}")
    UserResponseDTO getUserById(@PathVariable Long userId);
}
