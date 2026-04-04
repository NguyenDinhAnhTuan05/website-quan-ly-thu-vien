package com.nhom10.library.controller;

import com.nhom10.library.dto.request.ChangeRoleRequest;
import com.nhom10.library.dto.response.UserResponse;
import com.nhom10.library.security.UserPrincipal;
import com.nhom10.library.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Controller quản lý User dành cho Admin.
 *
 * GET    /api/admin/users                    → Danh sách user (phân trang)
 * GET    /api/admin/users/search?keyword=    → Tìm kiếm user theo email/username
 * GET    /api/admin/users/{id}               → Chi tiết user
 * PATCH  /api/admin/users/{id}/toggle-status → Bật/Tắt tài khoản user
 * PATCH  /api/admin/users/{id}/change-role   → Thay đổi quyền user
 * DELETE /api/admin/users/{id}               → Xóa mềm user
 *
 * Quy tắc phân quyền:
 *   - Admin chỉ có thể thao tác trên user có cấp thấp hơn mình.
 *   - Admin không thể tự xóa/khóa/đổi quyền của chính mình.
 */
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
public class AdminUserController {

    private final UserService userService;

    /** Lấy danh sách tất cả users (phân trang, sắp xếp) */
    @GetMapping
    public ResponseEntity<Page<UserResponse>> getAllUsers(Pageable pageable) {
        return ResponseEntity.ok(userService.getAllUsers(pageable));
    }

    /** Tìm kiếm user theo email hoặc username */
    @GetMapping("/search")
    public ResponseEntity<Page<UserResponse>> searchUsers(
            @RequestParam(defaultValue = "") String keyword,
            Pageable pageable) {
        return ResponseEntity.ok(userService.searchUsers(keyword, pageable));
    }

    /** Lấy chi tiết một user */
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    /**
     * Bật/Tắt trạng thái tài khoản user.
     *
     * Ràng buộc:
     *   - Admin không được khóa chính mình.
     *   - Admin chỉ được khóa user có cấp thấp hơn mình.
     */
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<UserResponse> toggleUserStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(userService.toggleUserStatus(principal.getId(), id));
    }

    /**
     * Thay đổi vai trò (quyền) của user.
     *
     * Ràng buộc:
     *   - Admin không được đổi quyền của chính mình.
     *   - Admin chỉ được đổi quyền user có cấp thấp hơn mình.
     *   - Role mới phải thấp hơn cấp của admin thực hiện (không thể thăng cấp ngang hoặc cao hơn).
     */
    @PatchMapping("/{id}/change-role")
    public ResponseEntity<UserResponse> changeUserRole(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody ChangeRoleRequest request) {
        return ResponseEntity.ok(userService.changeUserRole(principal.getId(), id, request.getRole()));
    }

    /**
     * Xóa mềm user (không xóa dữ liệu liên quan).
     *
     * Ràng buộc:
     *   - Admin không được xóa chính mình.
     *   - Admin chỉ được xóa user có cấp thấp hơn mình.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        userService.deleteUser(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
