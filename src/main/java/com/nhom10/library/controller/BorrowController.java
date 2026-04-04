package com.nhom10.library.controller;

import com.nhom10.library.dto.request.BorrowRequest;
import com.nhom10.library.dto.response.BorrowRecordResponse;
import com.nhom10.library.entity.enums.BorrowStatus;
import com.nhom10.library.security.UserPrincipal;
import com.nhom10.library.service.BorrowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Các API liên quan đến mượn sách.
 * Bao gồm cả phía User và Admin.
 */
@RestController
@RequestMapping("/api/borrows")
@RequiredArgsConstructor
public class BorrowController {

    private final BorrowService borrowService;

    // ================================================================
    // DÀNH CHO USER
    // ================================================================

    /**
     * User tạo phiếu mượn.
     * @AuthenticationPrincipal tự động map từ SecurityContext (được set bởi JwtFilter).
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_USER') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<BorrowRecordResponse> createBorrowRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody BorrowRequest request) {

        BorrowRecordResponse response = borrowService.createBorrowRequest(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my-history")
    @PreAuthorize("hasAuthority('ROLE_USER') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Page<BorrowRecordResponse>> getMyHistory(
            @AuthenticationPrincipal UserPrincipal principal,
            Pageable pageable) {

        return ResponseEntity.ok(borrowService.getMyBorrowHistory(principal.getId(), pageable));
    }

    // ================================================================
    // DÀNH CHO ADMIN
    // ================================================================

    /**
     * Admin lấy toàn bộ phiếu mượn, có thể lọc theo trạng thái.
     * GET /api/borrows?status=PENDING&page=0&size=10
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<Page<BorrowRecordResponse>> getAllBorrows(
            @RequestParam(required = false) BorrowStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(borrowService.getAllBorrows(status, pageable));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<BorrowRecordResponse> approveBorrow(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {

        return ResponseEntity.ok(borrowService.approveBorrow(principal.getId(), id));
    }

    @PostMapping("/{id}/return")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<BorrowRecordResponse> returnBooks(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {

        return ResponseEntity.ok(borrowService.returnBooks(principal.getId(), id));
    }

    /**
     * User tự hủy phiếu mượn khi còn ở trạng thái PENDING.
     *
     * Ràng buộc: chỉ chủ sở hữu phiếu mượn mới có thể hủy.
     * Sau khi hủy, số lượng sách có sẵn được khôi phục.
     */
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('ROLE_USER') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<BorrowRecordResponse> cancelBorrow(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(borrowService.cancelBorrowRequest(principal.getId(), id));
    }

    /**
     * Admin từ chối phiếu mượn đang ở trạng thái PENDING.
     *
     * Tham số {@code reason} là tùy chọn — nếu cung cấp sẽ ghi vào trường note
     * của phiếu mượn để user biết lý do từ chối.
     * Sau khi từ chối, số lượng sách có sẵn được khôi phục.
     */
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<BorrowRecordResponse> rejectBorrow(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(borrowService.rejectBorrow(principal.getId(), id, reason));
    }
}
