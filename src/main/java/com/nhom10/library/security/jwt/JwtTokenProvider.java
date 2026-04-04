package com.nhom10.library.security.jwt;

import com.nhom10.library.config.AppProperties;
import com.nhom10.library.security.UserPrincipal;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * Cung cấp tất cả các thao tác JWT:
 *  - generateAccessToken / generateRefreshToken
 *  - validateToken
 *  - extractClaims (email, userId, role)
 *
 * Sử dụng JJWT 0.12.x (API thay đổi so với 0.11.x):
 *  - Jwts.builder()                 → không đổi
 *  - Jwts.parser()                  ← thay thế parserBuilder()
 *  - .verifyWith(key)               ← thay thế setSigningKey()
 *  - .parseSignedClaims(token)      ← thay thế parseClaimsJws()
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtTokenProvider {

    private final AppProperties appProperties;
    private SecretKey signingKey;

    @PostConstruct
    public void init() {
        // Decode Base64-encoded secret từ application.yml thành SecretKey
        // Key phải >= 256 bit (32 bytes) cho HMAC-SHA256
        byte[] keyBytes = Decoders.BASE64.decode(appProperties.getJwt().getSecret());
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    // ================================================================
    // TOKEN GENERATION
    // ================================================================

    /**
     * Tạo Access Token — short-lived (default: 1 ngày).
     * Claims:
     *  - sub: email (unique identifier, dùng để load UserDetails)
     *  - id:  userId (tránh phải query DB thêm lần nữa trong filter)
     */
    public String generateAccessToken(UserPrincipal principal) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + appProperties.getJwt().getExpiration());

        return Jwts.builder()
            .subject(principal.getEmail())
            .claim("id", principal.getId())
            .issuedAt(now)
            .expiration(expiry)
            .signWith(signingKey)
            .compact();
    }

    /**
     * Tạo Refresh Token — long-lived (default: 7 ngày).
     * Chỉ chứa sub (email) để minimize data exposure.
     * Dùng để xin Access Token mới mà không cần đăng nhập lại.
     */
    public String generateRefreshToken(UserPrincipal principal) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + appProperties.getJwt().getRefreshExpiration());

        return Jwts.builder()
            .subject(principal.getEmail())
            .issuedAt(now)
            .expiration(expiry)
            .signWith(signingKey)
            .compact();
    }

    // ================================================================
    // TOKEN PARSING
    // ================================================================

    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    public Long extractUserId(String token) {
        return parseClaims(token).get("id", Long.class);
    }

    // ================================================================
    // TOKEN VALIDATION
    // ================================================================

    /**
     * Validate token — trả về true nếu hợp lệ, false kèm log nếu không.
     * Xử lý tất cả exception của JJWT để không lộ chi tiết ra ngoài.
     */
    public boolean validateToken(String token) {
        try {
            parseClaims(token); // throws nếu không hợp lệ
            return true;
        } catch (SignatureException e) {
            log.warn("JWT signature không hợp lệ: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.warn("JWT token không đúng định dạng: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.warn("JWT token đã hết hạn: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.warn("JWT token không được hỗ trợ: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.warn("JWT claims string rỗng: {}", e.getMessage());
        }
        return false;
    }

    // ================================================================
    // PRIVATE HELPERS
    // ================================================================

    private Claims parseClaims(String token) {
        return Jwts.parser()
            .verifyWith(signingKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
}
