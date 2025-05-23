package com.schoolmanagement.communication_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
@EnableFeignClients
@EnableDiscoveryClient
public class CommunicationServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(CommunicationServiceApplication.class, args);
	}

}

