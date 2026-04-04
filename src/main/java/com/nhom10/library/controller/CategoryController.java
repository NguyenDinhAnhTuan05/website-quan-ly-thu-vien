package com.nhom10.library.controller;

import com.nhom10.library.dto.request.CategoryRequest;
import com.nhom10.library.dto.response.CategoryResponse;
import com.nhom10.library.service.CategoryService;
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
 * Controller Quản Lý Thể Loại (Category).
 *
 * GET  /api/categories          → Lấy danh sách (PUBLIC)
 * GET  /api/categories/{id}     → Chi tiết (PUBLIC)
 * POST /api/categories          → Tạo mới (ADMIN)
 * PUT  /api/categories/{id}     → Cập nhật (ADMIN)
 * DELETE /api/categories/{id}   → Xóa mềm (ADMIN)
 */
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    /** Lấy tất cả thể loại dạng phân trang (Public) */
    @GetMapping
    public ResponseEntity<Page<CategoryResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(categoryService.getAll(pageable));
    }

    /** Lấy tất cả thể loại dạng List (Public - dùng cho dropdown/select) */
    @GetMapping("/list")
    public ResponseEntity<List<CategoryResponse>> getAllAsList() {
        return ResponseEntity.ok(categoryService.getAllAsList());
    }

    /** Chi tiết thể loại (Public) */
    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getById(id));
    }

    /** Tạo thể loại mới (Admin only) */
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<CategoryResponse> create(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.create(request));
    }

    /** Cập nhật thể loại (Admin only) */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<CategoryResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(categoryService.update(id, request));
    }

    /** Xóa mềm thể loại (Admin only) */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
