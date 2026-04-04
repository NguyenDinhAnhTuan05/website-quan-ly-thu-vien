package com.nhom10.library.controller;

import com.nhom10.library.dto.request.BookSearchRequest;
import com.nhom10.library.dto.response.BookResponse;
import com.nhom10.library.security.UserPrincipal;
import com.nhom10.library.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller Quản Lý Sách (PUBLIC api)
 * Chỉ hỗ trợ GET. Các API thêm/sửa/xóa đặt trong AdminController.
 */
@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    /**
     * Tìm kiếm và phân trang:
     * GET /api/books?title=java&categoryId=1&sortBy=publishedDate&sortDir=desc
     */
    @GetMapping
    public ResponseEntity<Page<BookResponse>> searchBooks(@ModelAttribute BookSearchRequest request) {
        return ResponseEntity.ok(bookService.searchBooks(request));
    }

    /**
     * Lấy chi tiết sách: GET /api/books/1
     */
    @GetMapping("/{id}")
    public ResponseEntity<BookResponse> getBookById(@PathVariable Long id) {
        return ResponseEntity.ok(bookService.getBookById(id));
    }

    /**
     * Top sách hot (Redis cached): GET /api/books/popular?limit=5
     */
    @GetMapping("/popular")
    public ResponseEntity<List<BookResponse>> getPopularBooks(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(bookService.getPopularBooks(limit));
    }

    /**
     * Đọc nội dung sách (YÊU CẦU ĐĂNG NHẬP + SUBSCRIPTION).
     * GET /api/books/{id}/read
     *
     * Kiểm tra subscription ở tầng Service:
     *   - Sách có content/ebookUrl → cần gói PREMIUM
     *   - Sách không có content → trả về bình thường
     */
    @GetMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookResponse> readBookContent(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(bookService.readBookContent(principal.getId(), id));
    }
}
