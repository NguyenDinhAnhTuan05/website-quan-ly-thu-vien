package com.nhom10.library.controller;

import com.nhom10.library.dto.request.AuthorRequest;
import com.nhom10.library.dto.response.AuthorResponse;
import com.nhom10.library.service.AuthorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller Quản Lý Tác Giả (Author).
 *
 * GET  /api/authors          → Lấy danh sách (PUBLIC)
 * GET  /api/authors/{id}     → Chi tiết (PUBLIC)
 * POST /api/authors          → Tạo mới (ADMIN)
 * PUT  /api/authors/{id}     → Cập nhật (ADMIN)
 * DELETE /api/authors/{id}   → Xóa mềm (ADMIN)
 */
@RestController
@RequestMapping("/api/authors")
@RequiredArgsConstructor
public class AuthorController {

    private final AuthorService authorService;

    /** Lấy tất cả tác giả dạng phân trang (Public) */
    @GetMapping
    public ResponseEntity<Page<AuthorResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(authorService.getAll(pageable));
    }

    /** Lấy tất cả tác giả dạng List (Public - dùng cho dropdown/select) */
    @GetMapping("/list")
    public ResponseEntity<List<AuthorResponse>> getAllAsList() {
        return ResponseEntity.ok(authorService.getAllAsList());
    }

    /** Chi tiết tác giả (Public) */
    @GetMapping("/{id}")
    public ResponseEntity<AuthorResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(authorService.getById(id));
    }

    /** Tạo tác giả mới (Admin only) */
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<AuthorResponse> create(@Valid @RequestBody AuthorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authorService.create(request));
    }

    /** Cập nhật tác giả (Admin only) */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<AuthorResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody AuthorRequest request) {
        return ResponseEntity.ok(authorService.update(id, request));
    }

    /** Xóa mềm tác giả (Admin only) */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        authorService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
