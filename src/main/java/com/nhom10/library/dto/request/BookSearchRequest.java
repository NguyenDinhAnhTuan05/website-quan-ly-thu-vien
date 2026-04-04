package com.nhom10.library.dto.request;

import lombok.Data;

/**
 * Query params cho tìm kiếm + sort sách.
 * Không dùng @Valid vì đây là query params (không từ request body).
 */
@Data
public class BookSearchRequest {

    private String title;           // tìm theo tên (LIKE)
    private String isbn;            // tìm chính xác theo ISBN
    private Long categoryId;        // lọc theo thể loại
    private Long authorId;          // lọc theo tác giả
    private Boolean available;      // true=đang active, false=đã tắt
    private boolean borrowableOnly = false; // chỉ sách còn bản mượn

    // Sorting
    private String sortBy = "title";       // title | publishedDate | availableQuantity | createdAt
    private String sortDir = "asc";        // asc | desc

    // Pagination
    private int page = 0;
    private int size = 12;
}
