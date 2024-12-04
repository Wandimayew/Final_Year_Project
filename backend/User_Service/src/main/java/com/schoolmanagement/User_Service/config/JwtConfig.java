package com.schoolmanagement.User_Service.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;

@Component
@Data
@ConfigurationProperties(prefix = "app")
public class JwtConfig {

    private String jwtSecret;
    private long jwtExpirationMs;

}