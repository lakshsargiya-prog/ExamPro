package com.exampro.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Set;

@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);
    private static final int MINIMUM_SECRET_BYTES = 32; // 256 bits minimum for HMAC-SHA
    private static final Set<String> INSECURE_DEFAULT_SECRETS = Set.of(
            "local-only-secret-change-this-to-at-least-32-bytes-long",
            "replace_with_at_least_32_bytes_of_random_secret_material",
            "secret",
            "changeme",
            "password"
    );

    private final SecretKey key;
    private final long expirationMs;

    public JwtService(
            @Value("${app.jwt.secret:}") String secret,
            @Value("${app.jwt.expiration-ms:3600000}") long expirationMs,
            Environment env) {

        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("JWT_SECRET is missing! You must configure app.jwt.secret with at least 32 bytes of secure key material.");
        }

        byte[] secretBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < MINIMUM_SECRET_BYTES) {
            throw new IllegalArgumentException("JWT_SECRET is too weak! Key length must be at least " + MINIMUM_SECRET_BYTES + " bytes (256 bits). Current length: " + secretBytes.length + " bytes.");
        }

        boolean isProduction = env.matchesProfiles("prod", "production") ||
                "prod".equalsIgnoreCase(System.getenv("SPRING_PROFILES_ACTIVE")) ||
                "production".equalsIgnoreCase(System.getenv("SPRING_PROFILES_ACTIVE"));

        String lowerSecret = secret.trim().toLowerCase();
        boolean isKnownPlaceholder = INSECURE_DEFAULT_SECRETS.contains(lowerSecret) ||
                lowerSecret.contains("change-this") ||
                lowerSecret.contains("replace_with");

        if (isProduction && isKnownPlaceholder) {
            throw new IllegalStateException("Insecure default or placeholder JWT_SECRET detected in production! Please generate a strong random secret (e.g. `openssl rand -hex 32`) and set it in your environment variables.");
        } else if (isKnownPlaceholder) {
            log.warn("Notice: Using default/local JWT_SECRET in non-production profile. Ensure a strong random secret is configured before deploying to production.");
        }

        this.key = Keys.hmacShaKeyFor(secretBytes);
        this.expirationMs = expirationMs;
    }

    public String generate(String email, String role) {
        Date now = new Date();
        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMs))
                .signWith(key)
                .compact();
    }

    public String extractEmail(String token) {
        return parse(token).getPayload().getSubject();
    }

    public boolean isValid(String token) {
        try {
            return parse(token).getPayload().getExpiration().after(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Jws<Claims> parse(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
    }
}
