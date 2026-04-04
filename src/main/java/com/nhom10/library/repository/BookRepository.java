package com.nhom10.library.repository;

import com.nhom10.library.entity.Book;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long>,
        JpaSpecificationExecutor<Book> {

    boolean existsByIsbn(String isbn);

    /**
     * Lấy chi tiết sách kèm categories + authors trong MỘT query.
     * Dùng cho endpoint GET /books/{id} — cần đầy đủ thông tin.
     *
     * Lưu ý: Không thể JOIN FETCH 2 collection cùng lúc trong 1 query JPQL
     * (HibernateException: cannot simultaneously fetch multiple bags).
     * Giải pháp: dùng Set (không phải List) cho ManyToMany — đã áp dụng ở entity.
     */
    @Query("""
        SELECT DISTINCT b FROM Book b
        LEFT JOIN FETCH b.categories
        LEFT JOIN FETCH b.authors
        WHERE b.id = :id
        """)
    Optional<Book> findByIdWithDetails(@Param("id") Long id);

    /**
     * Pessimistic Write Lock — khoá dòng ở DB level khi đọc để cập nhật.
     * Dùng trong BorrowService khi tạo phiếu mượn để tránh race condition:
     *   Thread A và Thread B cùng đọc availableQuantity=1,
     *   cả 2 đều thấy còn sách → overbook.
     * Với PESSIMISTIC_WRITE: Thread A giữ lock, Thread B phải chờ.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Book b WHERE b.id = :id")
    Optional<Book> findByIdWithLock(@Param("id") Long id);

    /**
     * Top N sách được mượn nhiều nhất — dùng cho Popular Books (cached).
     *
     * Native Query (không JPQL) vì:
     *  1. GROUP BY + ORDER BY COUNT(subquery) không tốt trong JPQL.
     *  2. @SQLRestriction không tự động áp dụng cho native query
     *     → cần WHERE b.deleted = 0 thủ công.
     *  3. LIMIT không chuẩn JPQL (dùng Pageable thay thế nếu cần portable).
     */
    @Query(value = """
        SELECT b.*,
               (SELECT COUNT(*) FROM book_category bc
                INNER JOIN categories c ON bc.category_id = c.id
                WHERE bc.book_id = b.id AND c.deleted = 1) AS deletedCategoryCount
        FROM books b
        INNER JOIN borrow_details bd ON b.id = bd.book_id
        INNER JOIN borrow_records br ON bd.borrow_record_id = br.id
        WHERE b.deleted = 0
          AND b.available = 1
          AND br.deleted = 0
        GROUP BY b.id
        ORDER BY COUNT(bd.id) DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<Book> findPopularBooks(@Param("limit") int limit);

    /**
     * Tìm kiếm sách theo từ khóa (title hoặc isbn) — dành cho Admin.
     * Không lọc theo available (admin xem tất cả trạng thái).
     *
     * Tách thành 2 query để tránh HHH90003004 (pagination in memory):
     *   1. findAllIdsByKeyword  → phân trang ở DB level (không JOIN FETCH)
     *   2. findAllWithDetailsByIds → lấy chi tiết kèm collections (không phân trang)
     */
    @Query("""
        SELECT DISTINCT b.id FROM Book b
        LEFT JOIN b.categories c
        LEFT JOIN b.authors a
        WHERE (:keyword = '' OR LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(b.isbn) LIKE LOWER(CONCAT('%', :keyword, '%')))
        """)
    org.springframework.data.domain.Page<Long> findAllIdsByKeyword(
        @Param("keyword") String keyword,
        org.springframework.data.domain.Pageable pageable);

    @Query("""
        SELECT DISTINCT b FROM Book b
        LEFT JOIN FETCH b.categories
        LEFT JOIN FETCH b.authors
        WHERE b.id IN :ids
        """)
    List<Book> findAllWithDetailsByIds(@Param("ids") List<Long> ids);

    /**
     * Tìm kiếm 10 sách liên quan nhất dựa trên từ khóa (title hoặc description).
     * Phục vụ tính năng AI Assistant (RAG).
     */
    @Query("""
        SELECT b FROM Book b
        WHERE b.deleted = false AND b.available = true
          AND (LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(b.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
        ORDER BY b.availableQuantity DESC
    """)
    List<Book> findTop10ByKeyword(@Param("keyword") String keyword, org.springframework.data.domain.Pageable pageable);
}
