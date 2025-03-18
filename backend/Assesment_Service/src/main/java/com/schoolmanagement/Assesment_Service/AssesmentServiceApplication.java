package com.schoolmanagement.Assesment_Service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class AssesmentServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AssesmentServiceApplication.class, args);
	}

}
