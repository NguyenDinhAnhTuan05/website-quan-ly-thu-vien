package com.nhom10.library.controller;

import com.nhom10.library.dto.request.ForgotPasswordRequest;
import com.nhom10.library.dto.request.LoginRequest;
import com.nhom10.library.dto.request.RegisterRequest;
import com.nhom10.library.dto.request.ResetPasswordRequest;
import com.nhom10.library.dto.response.AuthResponse;
import com.nhom10.library.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Auth endpoints — tất cả PUBLIC (không cần JWT), đã cấu hình trong SecurityConfig.
 *
 * POST /api/auth/register          → Đăng ký
 * POST /api/auth/login             → Đăng nhập (trả về JWT)
 * POST /api/auth/refresh           → Làm mới Access Token
 * POST /api/auth/forgot-password   → Yêu cầu reset mật khẩu
 * POST /api/auth/reset-password    → Đặt lại mật khẩu
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Làm mới access token bằng refresh token.
     * Client gửi: { "refreshToken": "..." }
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody Map<String, String> payload) {
        String refreshToken = payload.get("refreshToken");
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(authService.refreshToken(refreshToken));
    }

    /**
     * Gửi email reset password.
     * Luôn trả về 200 OK dù email có tồn tại không → chống User Enumeration.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(Map.of(
            "message", "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi link reset mật khẩu."
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại."));
    }
}
