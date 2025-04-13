package com.schoolmanagement.academic_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
// import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
// @EnableDiscoveryClient
public class AcademicServiceApplication {
	public static void main(String[] args) {
		SpringApplication.run(AcademicServiceApplication.class, args);
	}

}
