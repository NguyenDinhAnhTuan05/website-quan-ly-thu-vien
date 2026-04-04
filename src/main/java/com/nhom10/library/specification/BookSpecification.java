package com.nhom10.library.specification;

import com.nhom10.library.entity.Author;
import com.nhom10.library.entity.Book;
import com.nhom10.library.entity.Category;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

/**
 * JPA Specification cho Book — hỗ trợ tìm kiếm đa điều kiện.
 *
 * Ưu điểm so với JPQL:
 *  - Type-safe, kiểm tra lỗi compile-time.
 *  - Kết hợp linh hoạt: and(), or(), not().
 *  - Tái sử dụng từng condition độc lập.
 *
 * Pattern: Static factory methods, combine bằng Specification.where().and().
 *
 * Lưu ý N+1 với ManyToMany:
 *  - Specification JOIN không fetch collection → an toàn với Pageable.
 *  - Khi cần data collection: dùng JOIN FETCH trong query riêng (findByIdWithDetails).
 *  - query.distinct(true) tránh duplicate row khi JOIN nhiều bảng.
 */
public class BookSpecification {

    private BookSpecification() {} // Utility class

    /**
     * Tên sách chứa từ khoá (case-insensitive LIKE).
     * Chống SQL Injection: Criteria API dùng parameterized query tự động.
     */
    public static Specification<Book> titleContains(String keyword) {
        return (root, query, cb) ->
            cb.like(cb.lower(root.get("title")), "%" + keyword.toLowerCase() + "%");
    }

    public static Specification<Book> isbnEquals(String isbn) {
        return (root, query, cb) ->
            cb.equal(root.get("isbn"), isbn);
    }

    /**
     * Lọc theo Category ID.
     * INNER JOIN → chỉ trả về sách CÓ thể loại này.
     * distinct(true) ngăn duplicate khi book có nhiều category.
     */
    public static Specification<Book> hasCategory(Long categoryId) {
        return (root, query, cb) -> {
            query.distinct(true);
            Join<Book, Category> categories = root.join("categories", JoinType.INNER);
            return cb.equal(categories.get("id"), categoryId);
        };
    }

    /** Lọc theo Author ID */
    public static Specification<Book> hasAuthor(Long authorId) {
        return (root, query, cb) -> {
            query.distinct(true);
            Join<Book, Author> authors = root.join("authors", JoinType.INNER);
            return cb.equal(authors.get("id"), authorId);
        };
    }

    /** Chỉ trả về sách admin bật + còn bản để mượn */
    public static Specification<Book> isAvailableForBorrow() {
        return (root, query, cb) -> cb.and(
            cb.isTrue(root.get("available")),
            cb.greaterThan(root.get("availableQuantity"), 0)
        );
    }

    /** Lọc theo trạng thái admin (bật/tắt) */
    public static Specification<Book> isAvailable(boolean available) {
        return (root, query, cb) -> cb.equal(root.get("available"), available);
    }

    /**
     * Builder pattern — tạo Specification tổng hợp từ các điều kiện.
     * Các điều kiện null sẽ bị bỏ qua (tương đương WHERE 1=1).
     */
    public static Specification<Book> buildSpec(String title, Long categoryId,
                                                 Long authorId, Boolean available,
                                                 boolean borrowableOnly) {
        Specification<Book> spec = Specification.where(null);

        if (title != null && !title.isBlank()) {
            spec = spec.and(titleContains(title));
        }
        if (categoryId != null) {
            spec = spec.and(hasCategory(categoryId));
        }
        if (authorId != null) {
            spec = spec.and(hasAuthor(authorId));
        }
        if (available != null) {
            spec = spec.and(isAvailable(available));
        }
        if (borrowableOnly) {
            spec = spec.and(isAvailableForBorrow());
        }

        return spec;
    }
}
