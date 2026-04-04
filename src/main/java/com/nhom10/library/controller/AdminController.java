package com.nhom10.library.controller;

import com.nhom10.library.dto.request.AdminBookRequest;
import com.nhom10.library.dto.response.BookResponse;
import com.nhom10.library.service.AdminService;
import com.nhom10.library.service.GoogleBooksCrawlerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controller dành riêng cho Role Admin CMS — Quản lý Sách.
 * /api/admin/books/** đã được khóa bởi SecurityConfig có hasAuthority("ROLE_ADMIN").
 */
@RestController
@RequestMapping("/api/admin/books")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final GoogleBooksCrawlerService googleBooksCrawlerService;

    /** Lấy danh sách sách cho Admin (phân trang, bao gồm cả sách bị tắt) */
    @GetMapping
    public ResponseEntity<Page<BookResponse>> getAllBooks(
            @RequestParam(defaultValue = "") String keyword,
            Pageable pageable) {
        return ResponseEntity.ok(adminService.getAllBooks(keyword, pageable));
    }

    /** Tạo sách mới */
    @PostMapping
    public ResponseEntity<BookResponse> createBook(@Valid @RequestBody AdminBookRequest request) {
        BookResponse response = adminService.createBook(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** Cập nhật thông tin sách */
    @PutMapping("/{id}")
    public ResponseEntity<BookResponse> updateBook(
            @PathVariable Long id,
            @Valid @RequestBody AdminBookRequest request) {
        BookResponse response = adminService.updateBook(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Bật/Tắt trạng thái available của sách.
     * available=false → sách không còn hiển thị cho người dùng mượn.
     */
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<BookResponse> toggleBookStatus(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.toggleBookStatus(id));
    }

    /** Xóa mềm sách */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        adminService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }

    /** 
     * Trigger cào sách thủ công từ Google Books API 
     * /api/admin/books/crawl?keyword=reactjs 
     */
    @PostMapping("/crawl")
    public ResponseEntity<java.util.Map<String, Object>> crawlBooks(
            @RequestParam(defaultValue = "programming") String keyword) {
        int addedCount = googleBooksCrawlerService.crawlData(keyword);
        return ResponseEntity.ok(java.util.Map.of(
            "message", "Cào dữ liệu thành công!",
            "keyword", keyword,
            "added_books_count", addedCount
        ));
    }
}
