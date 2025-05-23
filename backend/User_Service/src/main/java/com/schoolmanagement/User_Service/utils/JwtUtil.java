package com.schoolmanagement.User_Service.utils;

import com.schoolmanagement.User_Service.config.JwtConfig;
import com.schoolmanagement.User_Service.model.User;
import com.schoolmanagement.User_Service.repository.RoleRepository;
import com.schoolmanagement.User_Service.repository.UserRolePermissionRepository;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@Slf4j
@RequiredArgsConstructor
public class JwtUtil {

    private final UserRolePermissionRepository userRolePermissionRepository;
    private final JwtConfig jwtConfig;
    private final RoleRepository roleRepository;

    private SecretKey getSecretKey() {
        byte[] decodedKey = Base64.getDecoder().decode(jwtConfig.getJwtSecret());
        return new SecretKeySpec(decodedKey, SignatureAlgorithm.HS512.getJcaName());
    }

    // Generate short-lived access token (15 minutes)
    public String generateJwtToken(User user) {
        List<String> roleNames = roleRepository.findRolesByUserId(user.getUserId())
                .stream()
                .distinct()
                .collect(Collectors.toList());

        log.info("Generating access token for user {} with roles: {}", user.getUsername(), roleNames);

        if (roleNames.isEmpty()) {
            log.warn("No roles found for user {} in school {}", user.getUserId(), user.getSchoolId());
        }

        return Jwts.builder()
                .setSubject(user.getUsername())
                .setId(UUID.randomUUID().toString())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 15 * 60 * 1000)) // 15 minutes
                .claim("email", user.getEmail())
                .claim("school_id", user.getSchoolId())
                .claim("user_id", user.getUserId())
                .claim("roles", roleNames)
                .signWith(getSecretKey())
                .compact();
    }

    // Generate refresh token (1 day)
    public String generateRefreshToken(User user) {
        String token = Base64.getEncoder().encodeToString(UUID.randomUUID().toString().getBytes());
        log.info("Generated refresh token for user: {}", user.getUsername());
        return token;
    }

    // Validate JWT Token
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSecretKey())
                    .build()
                    .parseClaimsJws(token);
            boolean isValid = !isTokenExpired(token);
            log.info("Token validation result: {}", isValid);
            return isValid;
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
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSecretKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (JwtException e) {
            log.error("Failed to extract claims from token: {}", e.getMessage());
            throw e;
        }
    }

    private boolean isTokenExpired(String token) {
        Date expiration = extractAllClaims(token).getExpiration();
        boolean expired = expiration.before(new Date());
        log.debug("Token expiration check: expires at {}, expired: {}", expiration, expired);
        return expired;
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

    public List<String> extractRoles(String token) {
        return extractClaim(token, claims -> claims.get("roles", List.class));
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    @FunctionalInterface
    public interface ClaimsFunction<T> {
        T apply(Claims claims);
    }
}