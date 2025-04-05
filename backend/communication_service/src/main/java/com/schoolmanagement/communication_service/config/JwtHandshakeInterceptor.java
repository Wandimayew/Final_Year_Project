package com.schoolmanagement.communication_service.config;

import com.schoolmanagement.communication_service.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtUtil jwtUtil;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        // Extract Authorization header
        String authHeader = request.getHeaders().getFirst("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            if (jwtUtil.validateToken(token)) {
                // Extract user details from token and store in attributes
                String userId = jwtUtil.extractUserId(token);
                String schoolId = jwtUtil.extractSchoolId(token);
                String username = jwtUtil.getUserNameFromJwtToken(token);

                attributes.put("userId", userId);
                attributes.put("schoolId", schoolId);
                attributes.put("username", username);

                log.info("WebSocket connection authorized for user: {}", username);
                return true; // Allow connection
            } else {
                log.warn("Invalid JWT token during WebSocket handshake: {}", token);
            }
        } else {
            log.debug("No valid Authorization header found in WebSocket handshake");
        }

        // Reject connection if token is invalid or missing
        response.setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
        return false;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception ex) {
        // No-op
    }
}