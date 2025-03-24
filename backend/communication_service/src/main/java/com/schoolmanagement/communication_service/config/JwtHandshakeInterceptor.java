package com.schoolmanagement.communication_service.config;

import com.schoolmanagement.communication_service.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
            WebSocketHandler wsHandler, Map<String, Object> attributes) {
        String token = request.getURI().getQuery() != null && request.getURI().getQuery().startsWith("token=")
                ? request.getURI().getQuery().substring(6)
                : null;
        System.out.println("WebSocket handshake - Token: " + token);

        if (token != null && jwtUtil.validateToken(token)) {
            String userId = jwtUtil.extractUserId(token);
            attributes.put("userId", userId);
            System.out.println("WebSocket handshake - User ID: " + userId);
            return true;
        }

        System.out.println("WebSocket handshake - Denied: Invalid or missing token");
        response.setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
        return false;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
            WebSocketHandler wsHandler, Exception exception) {
        System.out.println("WebSocket handshake completed");
    }
}