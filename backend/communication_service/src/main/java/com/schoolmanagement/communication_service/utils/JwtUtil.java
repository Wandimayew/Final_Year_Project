package com.schoolmanagement.communication_service.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.JwtParserBuilder;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    private final SecretKey SECRET_KEY; // Use SecretKey instead of String for security

    public JwtUtil() {
        // Decode the BASE64-encoded secret key
        this.SECRET_KEY = Keys.hmacShaKeyFor(Decoders.BASE64.decode("zWR3i+mURw4kppEwVNhxZdqblotfvWseQGKI1SdLI9Y="));
    }

    public String extractUserId(String token) {
        return extractClaim(token, claims -> claims.get("user_id", String.class)); // Extract user_id directly as a
                                                                                   // string
    }

    public String extractSchoolId(String token) {
        return extractClaim(token, claims -> claims.get("school_id", String.class)); // Extract school_id directly as a
                                                                                     // string
    }

    public <T> T extractClaim(String token, ClaimsFunction<T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        JwtParserBuilder parserBuilder = Jwts.parserBuilder();
        return parserBuilder
                .setSigningKey(SECRET_KEY) // Use SecretKey
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(SECRET_KEY) // Use SecretKey
                    .build()
                    .parseClaimsJws(token);
            return !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    @FunctionalInterface
    public interface ClaimsFunction<T> {
        T apply(Claims claims);
    }
}
