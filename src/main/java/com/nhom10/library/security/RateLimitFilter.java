package com.nhom10.library.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate Limiting Filter — Chống Brute Force Attack trên các endpoint nhạy cảm.
 *
 * Áp dụng:
 *   - /api/auth/login         → 10 request / phút / IP
 *   - /api/auth/register      → 5 request / phút / IP
 *   - /api/auth/forgot-password → 3 request / phút / IP
 *
 * Sử dụng Bucket4j (Token Bucket Algorithm) — in-memory, nhẹ và nhanh.
 * Khi deploy scale-out (nhiều instance), nên chuyển sang Redis-backed Bucket4j.
 */
@Component
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    /** Cache bucket theo IP — tự cleanup khi bucket refill */
    private final Map<String, Bucket> loginBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> registerBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> forgotPasswordBuckets = new ConcurrentHashMap<>();

    /** Login: 10 lần / phút */
    private static final int LOGIN_LIMIT = 10;
    /** Register: 5 lần / phút */
    private static final int REGISTER_LIMIT = 5;
    /** Forgot password: 3 lần / phút */
    private static final int FORGOT_PASSWORD_LIMIT = 3;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // Chỉ rate limit POST request trên auth endpoints
        if (!"POST".equalsIgnoreCase(method)) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIp(request);
        Bucket bucket = null;

        if (path.equals("/api/auth/login")) {
            bucket = loginBuckets.computeIfAbsent(clientIp, k -> createBucket(LOGIN_LIMIT));
        } else if (path.equals("/api/auth/register")) {
            bucket = registerBuckets.computeIfAbsent(clientIp, k -> createBucket(REGISTER_LIMIT));
        } else if (path.equals("/api/auth/forgot-password")) {
            bucket = forgotPasswordBuckets.computeIfAbsent(clientIp, k -> createBucket(FORGOT_PASSWORD_LIMIT));
        }

        if (bucket != null && !bucket.tryConsume(1)) {
            log.warn("Rate limit exceeded for IP {} on {}", clientIp, path);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(
                "{\"status\":429,\"error\":\"Too Many Requests\","
                + "\"message\":\"Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút.\"}"
            );
            return;
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return !path.startsWith("/api/auth/");
    }

    private Bucket createBucket(int capacity) {
        Bandwidth limit = Bandwidth.classic(capacity, Refill.greedy(capacity, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }

    /**
     * Lấy IP thật của client, hỗ trợ reverse proxy (Nginx, Cloudflare).
     * Ưu tiên: X-Forwarded-For → X-Real-IP → remoteAddr.
     */
    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            // X-Forwarded-For có thể chứa nhiều IP, lấy IP đầu tiên (client thật)
            return xff.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }
}
