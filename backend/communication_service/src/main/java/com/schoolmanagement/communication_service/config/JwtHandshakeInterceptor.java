package com.schoolmanagement.communication_service.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import com.schoolmanagement.communication_service.utils.JwtUtil;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtUtil jwtUtil;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        String token = null;

        // Check Authorization header
        String authHeader = request.getHeaders().getFirst("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            log.info("Extracted token from Authorization header: {}", token);
        }

        // Fallback to query parameter
        if (token == null) {
            String query = request.getURI().getQuery();
            if (query != null && query.contains("access_token=")) {
                token = query.split("access_token=")[1].split("&")[0];
                log.info("Extracted token from query parameter: {}", token);
            }
        }

        if (token == null) {
            log.warn("No token provided in WebSocket handshake: {}", request.getURI());
            response.setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
            return false;
        }

        try {
            if (jwtUtil.validateToken(token)) {
                String userId = jwtUtil.extractUserId(token);
                String schoolId = jwtUtil.extractSchoolId(token);
                String username = jwtUtil.getUserNameFromJwtToken(token);

                attributes.put("userId", userId);
                attributes.put("schoolId", schoolId);
                attributes.put("username", username);

                log.info("WebSocket connection authorized for userId: {}, schoolId: {}", userId, schoolId);
                return true;
            } else {
                log.warn("JWT token validation failed for token: {}", token);
                response.setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
                return false;
            }
        } catch (Exception e) {
            log.error("Error validating JWT token: {}", e.getMessage(), e);
            response.setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
            return false;
        }
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception ex) {
        if (ex != null) {
            log.error("WebSocket handshake failed: {}", ex.getMessage(), ex);
        }
    }
}