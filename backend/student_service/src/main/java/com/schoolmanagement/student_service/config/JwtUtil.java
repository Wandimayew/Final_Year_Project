package com.schoolmanagement.student_service.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import java.security.Key;
import java.util.Date;

public class JwtUtil {

    private static final Key key = Keys.hmacShaKeyFor("MySecretKeyForJwtMustBeAtLeast32Bytes!".getBytes());

    public static String generateToken(Long schoolId, Long classId, Long sectionId) {
        long nowMillis = System.currentTimeMillis();
        long expMillis = nowMillis + (10 * 60 * 60 * 1000); // 10 hours

        return Jwts.builder()
                .claim("schoolId", schoolId)
                .claim("classId", classId)
                .claim("sectionId", sectionId)
                .setIssuedAt(new Date(nowMillis))
                .setExpiration(new Date(expMillis))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public static Key getKey() {
        return key;
    }

    public Claims verifyToken(String jwt) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(jwt)
                .getBody();
    }
}
