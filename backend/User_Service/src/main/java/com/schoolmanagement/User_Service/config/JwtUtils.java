package com.schoolmanagement.User_Service.config;

import com.schoolmanagement.User_Service.model.Role;
import com.schoolmanagement.User_Service.model.User;
import io.jsonwebtoken.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class JwtUtils {

    @Autowired
    private JwtConfig jwtConfig;

    private SecretKey getSecretKey() {
        byte[] decodedKey = Base64.getDecoder().decode(jwtConfig.getJwtSecret());
        return new SecretKeySpec(decodedKey, SignatureAlgorithm.HS512.getJcaName());
    }

    // Generate JWT Token
public String generateJwtToken(User user) {
    List<String> roleNames = user.getRoles()
                                 .stream()
                                 .map(Role::getName) // Assuming Role has a getName method
                                 .collect(Collectors.toList());

    return Jwts.builder()
            .setSubject(user.getUsername())
            .setId(UUID.randomUUID().toString())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + jwtConfig.getJwtExpirationMs()))
            .claim("email", user.getEmail())
            .claim("school_id", user.getSchoolId())
            .claim("user_id", user.getUserId())
            .claim("roles", roleNames) // Simplified roles
            .signWith(getSecretKey())
            .compact();
}


    // Validate JWT Token
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(getSecretKey())  // Validate using the SecretKey
                .build()
                .parseClaimsJws(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // Get Username from JWT Token
    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSecretKey())  // Validate using the SecretKey
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
}
