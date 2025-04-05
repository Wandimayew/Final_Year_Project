package com.schoolmanagement.tenant_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

import io.github.cdimascio.dotenv.Dotenv;


@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class TenantServiceApplication {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.configure()
                .directory("./") // Directory where .env is located (root of project)
                .ignoreIfMissing() // Don't fail if .env is not found
                .load();

        // Set environment variables for Spring Boot
        dotenv.entries().forEach(entry -> 
            System.setProperty(entry.getKey(), entry.getValue())
        );
		SpringApplication.run(TenantServiceApplication.class, args);
	}

}