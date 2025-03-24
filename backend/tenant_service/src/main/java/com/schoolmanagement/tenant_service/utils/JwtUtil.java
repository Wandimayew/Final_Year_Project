package com.schoolmanagement.tenant_service.utils;

import io.jsonwebtoken.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.schoolmanagement.tenant_service.config.JwtConfig;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import java.util.Base64;
import java.util.Date;

@Component
@Slf4j
@RequiredArgsConstructor
public class JwtUtil {


    @Autowired
    private JwtConfig jwtConfig;

    private SecretKey getSecretKey() {
        byte[] decodedKey = Base64.getDecoder().decode(jwtConfig.getJwtSecret());
        return new SecretKeySpec(decodedKey, SignatureAlgorithm.HS512.getJcaName());
    }

    // public JwtUtil(UserRolePermissionRepository userRolePermissionRepository) {
    //     this.SECRET_KEY = Keys.hmacShaKeyFor(Decoders.BASE64.decode("zWR3i+mURw4kppEwVNhxZdqblotfvWseQGKI1SdLI9Y="));
    //     this.userRolePermissionRepository = userRolePermissionRepository;
    // }


    // Validate JWT Token
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
            .setSigningKey(getSecretKey()) // Use the field
            .build()
            .parseClaimsJws(token);
            log.info("token validation: for time {}",!isTokenExpired(token));
            log.info("token validation: for time second one {}",isTokenExpired(token));

            return !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    // Extract Claims
    public <T> T extractClaim(String token, ClaimsFunction<T> claimsResolver) {
        Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSecretKey()) // Use the field
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    // Specific Extractors
    public String extractUserId(String token) {
        return extractClaim(token, claims -> claims.get("user_id", String.class));
    }

    public String extractSchoolId(String token) {
        return extractClaim(token, claims -> claims.get("school_id", String.class));
    }

    public String getUserNameFromJwtToken(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    

    @FunctionalInterface
    public interface ClaimsFunction<T> {
        T apply(Claims claims);
    }
}