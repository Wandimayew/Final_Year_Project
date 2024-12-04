package com.schoolmanagement.User_Service.config;

import com.schoolmanagement.User_Service.model.User;
import io.jsonwebtoken.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Date;

@Service
public class JwtUtils {

    @Autowired
    private JwtConfig jwtConfig;

    // Generate JWT Token
    public String generateJwtToken(User user) {
        SecretKey secretKey = new SecretKeySpec(jwtConfig.getJwtSecret().getBytes(), SignatureAlgorithm.HS512.getJcaName());
        return Jwts.builder()
            .setSubject(user.getUsername())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + jwtConfig.getJwtExpirationMs()))
            .signWith(secretKey) // Using SecretKey for signing
            .compact();
    }

    // Validate JWT Token
    public boolean validateJwtToken(String authToken) {
        try {
            SecretKey secretKey = new SecretKeySpec(jwtConfig.getJwtSecret().getBytes(), SignatureAlgorithm.HS512.getJcaName());
            Jwts.parserBuilder()
                .setSigningKey(secretKey)  // Use SecretKey for validation
                .build()
                .parseClaimsJws(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // Get Username from JWT Token
    public String getUserNameFromJwtToken(String token) {
        SecretKey secretKey = new SecretKeySpec(jwtConfig.getJwtSecret().getBytes(), SignatureAlgorithm.HS512.getJcaName());
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)  // Use SecretKey for validation
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
}
