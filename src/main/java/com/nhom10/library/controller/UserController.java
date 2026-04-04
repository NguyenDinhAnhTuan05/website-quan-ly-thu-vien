package com.nhom10.library.controller;

import com.nhom10.library.dto.request.ChangePasswordRequest;
import com.nhom10.library.dto.request.UpdateProfileRequest;
import com.nhom10.library.dto.response.UserResponse;
import com.nhom10.library.security.UserPrincipal;
import com.nhom10.library.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Endpoints cho người dùng tự quản lý hồ sơ cá nhân.
 *
 * GET  /api/users/me           → Xem hồ sơ
 * PUT  /api/users/me           → Cập nhật username / avatarUrl
 * PUT  /api/users/me/password  → Đổi mật khẩu
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyProfile(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(userService.getProfile(principal.getId()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMyProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateProfileRequest request) {
        UserResponse updated = userService.updateProfile(principal.getId(), request);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/me/password")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(principal.getId(), request);
        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công."));
    }
}
