package com.nhom10.library.controller;

import com.nhom10.library.dto.request.AdminBookRequest;
import com.nhom10.library.dto.response.BookResponse;
import com.nhom10.library.service.AdminService;
import com.nhom10.library.service.BookContentGeneratorService;
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
    private final BookContentGeneratorService bookContentGeneratorService;

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

    /**
     * Cập nhật avatar cho tất cả authors chưa có avatar.
     * POST /api/admin/books/refresh-authors
     */
    @PostMapping("/refresh-authors")
    public ResponseEntity<java.util.Map<String, Object>> refreshAuthorAvatars() {
        int updated = googleBooksCrawlerService.refreshMissingAuthorAvatars();
        return ResponseEntity.ok(java.util.Map.of(
            "message", "Cập nhật avatar tác giả thành công!",
            "updated_count", updated
        ));
    }

    /**
     * Cập nhật cover, series, metadata cho tất cả sách chưa có cover hoặc cover cũ.
     * POST /api/admin/books/refresh-covers
     */
    @PostMapping("/refresh-covers")
    public ResponseEntity<java.util.Map<String, Object>> refreshBookCovers() {
        java.util.Map<String, Integer> result = googleBooksCrawlerService.refreshExistingBooks();
        return ResponseEntity.ok(java.util.Map.of(
            "message", "Cập nhật sách thành công!",
            "cover_updated", result.get("cover_updated"),
            "series_updated", result.get("series_updated"),
            "metadata_updated", result.get("metadata_updated")
        ));
    }

    /** Sinh nội dung AI cho TẤT CẢ sách chưa có content */
    @PostMapping("/generate-content")
    public ResponseEntity<java.util.Map<String, Object>> generateAllContent() {
        int updated = bookContentGeneratorService.generateContentForAllBooks();
        return ResponseEntity.ok(java.util.Map.of(
            "message", "Sinh nội dung sách bằng AI thành công!",
            "updated_count", updated
        ));
    }

    /** Sinh nội dung AI cho MỘT sách cụ thể */
    @PostMapping("/{id}/generate-content")
    public ResponseEntity<java.util.Map<String, Object>> generateContentForBook(@PathVariable Long id) {
        bookContentGeneratorService.generateAndSaveContent(id);
        return ResponseEntity.ok(java.util.Map.of(
            "message", "Sinh nội dung thành công!",
            "book_id", id
        ));
    }
}
