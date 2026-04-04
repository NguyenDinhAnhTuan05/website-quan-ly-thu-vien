package com.nhom10.library.controller;

import com.nhom10.library.entity.Book;
import com.nhom10.library.service.BookImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/books/import")
@RequiredArgsConstructor
public class BookAdminImportController {

    private final BookImportService bookImportService;

    /**
     * API cho Admin: Nhập ISBN, hệ thống tự lấy dữ liệu từ Google Books.
     */
    @PostMapping("/isbn/{isbn}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> importByIsbn(@PathVariable String isbn) {
        Book importedBook = bookImportService.importBookByIsbn(isbn);
        if (importedBook != null) {
            return ResponseEntity.ok(importedBook);
        }
        return ResponseEntity.badRequest().body("Không tìm thấy thông tin sách với mã ISBN này.");
    }
}
