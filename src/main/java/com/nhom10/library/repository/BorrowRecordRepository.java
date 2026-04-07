package com.nhom10.library.repository;

import com.nhom10.library.entity.BorrowRecord;
import com.nhom10.library.entity.enums.BorrowStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {

    /**
     * Lấy BorrowRecord kèm details + book trong 2 query riêng.
     * Dùng @EntityGraph hoặc JOIN FETCH để tránh N+1.
     *
     * JOIN FETCH details trước, sau đó Hibernate batch-load books
     * (nhờ spring.jpa.properties.hibernate.default_batch_fetch_size=20 trong yml).
     */
    @Query("""
        SELECT DISTINCT br FROM BorrowRecord br
        LEFT JOIN FETCH br.details d
        LEFT JOIN FETCH d.book
        WHERE br.id = :id
        """)
    Optional<BorrowRecord> findByIdWithDetails(@Param("id") Long id);

    /** Lịch sử mượn của một user — phân trang */
    Page<BorrowRecord> findByUserId(Long userId, Pageable pageable);

    /** Lấy tất cả records của một user */
    List<BorrowRecord> findByUserId(Long userId);

    /** Tìm phiếu đang mượn của user (dùng để validate: không cho mượn quá nhiều) */
    long countByUserIdAndStatusIn(Long userId, List<BorrowStatus> statuses);

    /**
     * Tìm các phiếu BORROWING quá hạn — dùng cho @Scheduled job cập nhật OVERDUE.
     * @SQLRestriction áp dụng cho JPQL nên không cần WHERE deleted=0 thủ công.
     */
    @Query("""
        SELECT br FROM BorrowRecord br
        WHERE br.status = 'BORROWING'
          AND br.dueDate < CURRENT_DATE
        """)
    List<BorrowRecord> findOverdueRecords();

    /**
     * Tìm các phiếu mượn tương ứng với một ngày hạn cụ thể (ví dụ: ngày mai).
     * Dùng cho job nhắc nhở trả sách qua Email.
     */
    @Query("""
        SELECT br FROM BorrowRecord br
        WHERE br.status = 'BORROWING'
          AND br.dueDate = :targetDate
        """)
    List<BorrowRecord> findRecordsByDueDate(@Param("targetDate") java.time.LocalDate targetDate);

    /** Admin xem toàn bộ phiếu theo trạng thái — phân trang */
    Page<BorrowRecord> findByStatus(BorrowStatus status, Pageable pageable);

    // ================================================================
    // CONSTRAINT QUERIES
    // ================================================================

    /**
     * Đếm số phiếu mượn ĐANG HOẠT ĐỘNG của một cuốn sách.
     * Dùng trong AdminService.deleteBook() để ngăn xóa sách đang được mượn.
     *
     * JOIN br.details d: áp dụng @SQLRestriction("deleted=0") trên BorrowDetail.
     * @param bookId  ID của sách cần kiểm tra.
     * @param statuses danh sách trạng thái coi là "đang hoạt động" (PENDING, BORROWING).
     */
    @Query("""
        SELECT COUNT(br) FROM BorrowRecord br
        JOIN br.details d
        WHERE d.book.id = :bookId
          AND br.status IN :statuses
        """)
    long countActiveBorrowsByBookId(@Param("bookId") Long bookId,
                                    @Param("statuses") Collection<BorrowStatus> statuses);

    /**
     * Kiểm tra user đã từng mượn VÀ TRẢ XONG một cuốn sách chưa.
     * Dùng trong ReviewService để ràng buộc: chỉ được review sách đã mượn xong.
     *
     * @param userId  ID người dùng.
     * @param bookId  ID cuốn sách.
     * @param status  Typically BorrowStatus.RETURNED.
     */
    @Query("""
        SELECT COUNT(br) FROM BorrowRecord br
        JOIN br.details d
        WHERE br.user.id  = :userId
          AND d.book.id   = :bookId
          AND br.status   = :status
        """)
    long countByUserAndBookAndStatus(@Param("userId") Long userId,
                                     @Param("bookId") Long bookId,
                                     @Param("status") BorrowStatus status);

    /**
     * Kiểm tra user đã mượn (đang mượn / quá hạn / đã trả) một cuốn sách chưa.
     * Dùng trong BookService để ràng buộc: chỉ đọc sách đã từng mượn.
     */
    @Query("""
        SELECT COUNT(br) FROM BorrowRecord br
        JOIN br.details d
        WHERE br.user.id  = :userId
          AND d.book.id   = :bookId
          AND br.status IN :statuses
        """)
    long countByUserAndBookAndStatuses(@Param("userId") Long userId,
                                       @Param("bookId") Long bookId,
                                       @Param("statuses") Collection<BorrowStatus> statuses);

    /**
     * Kiểm tra user có phiếu mượn OVERDUE không.
     * Dùng trong BorrowService để chặn tạo phiếu mới khi còn sách quá hạn.
     *
     * @param userId  ID người dùng.
     */
    @Query("""
        SELECT COUNT(br) FROM BorrowRecord br
        WHERE br.user.id = :userId
          AND br.status  = com.nhom10.library.entity.enums.BorrowStatus.OVERDUE
        """)
    long countOverdueByUserId(@Param("userId") Long userId);
}
