package com.schoolmanagement.communication_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtHandshakeInterceptor jwtHandshakeInterceptor;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableStompBrokerRelay("/topic")
              .setRelayHost("localhost")
              .setRelayPort(61613) // RabbitMQ STOMP port
              .setClientLogin("guest")
              .setClientPasscode("guest")
              .setSystemLogin("guest")
              .setSystemPasscode("guest")
              .setTaskScheduler(taskScheduler()) // Use the bean-defined scheduler
              .setVirtualHost("/");
        config.setApplicationDestinationPrefixes("/app");

        log.info("Configured STOMP broker relay to localhost:61613 with task scheduler");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/notifications")
                .addInterceptors(jwtHandshakeInterceptor)
                .setAllowedOriginPatterns("http://localhost:3000")
                .withSockJS()
                .setHeartbeatTime(10000); // 10s heartbeats

        log.info("Registered STOMP endpoint /notifications with SockJS and JWT interceptor");
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        registration.setMessageSizeLimit(128 * 1024); // 128KB
        registration.setSendBufferSizeLimit(512 * 1024); // 512KB
        registration.setSendTimeLimit(20000); // 20s
        registration.setTimeToFirstMessage(30000); // 30s

        log.info("Configured WebSocket transport: messageSizeLimit=128KB, sendBufferSizeLimit=512KB, sendTimeLimit=20s");
    }

    @Bean
    public ThreadPoolTaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(5); // Adjust as needed
        scheduler.setThreadNamePrefix("StompRelay-");
        scheduler.setErrorHandler(t -> log.error("Task scheduler error: ", t));
        scheduler.initialize(); // Explicitly initialize to avoid lazy init issues
        return scheduler;
    }
}