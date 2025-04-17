package com.schoolmanagement.student_service.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import java.security.Key;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;

public class JwtUtil {

    private static final Key key = Keys.hmacShaKeyFor("MySecretKeyForJwtMustBeAtLeast32Bytes!".getBytes());

    public static String generateToken(Long schoolId, Long classId, Long sectionId, String qrCodeUUID,
            LocalDateTime expiryDate) {
        long nowMillis = System.currentTimeMillis();
        long expMillis = nowMillis + (10 * 60 * 60 * 1000); // 10 hours

        return Jwts.builder()
                .claim("schoolId", schoolId)
                .claim("classId", classId)
                .claim("sectionId", sectionId)
                .claim("qrCodeUUID", qrCodeUUID)
                .claim("expiryDate", expiryDate.toString())
                .setIssuedAt(new Date(nowMillis))
                .setExpiration(new Date(expMillis))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public static Key getKey() {
        return key;
    }

    public static Claims verifyToken(String jwt) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(jwt)
                .getBody();
    }

    // public static String generateToken(Long schoolId, Long classId, Long
    // sectionId, String qrCodeUUID,
    // LocalDateTime expiryTime) {
    // // TODO Auto-generated method stub
    // throw new UnsupportedOperationException("Unimplemented method
    // 'generateToken'");
    // }

}
