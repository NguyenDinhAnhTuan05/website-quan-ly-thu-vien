package com.nhom10.library.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

/**
 * Chi tiết phiếu mượn (BorrowDetail) — Detail line của BorrowRecord.
 * Mỗi BorrowDetail đại diện cho 1 đầu sách trong 1 phiếu mượn.
 *
 * Soft Delete: @SQLDelete + @SQLRestriction
 *  → Có thể hủy 1 đầu sách trong phiếu (soft-delete detail)
 *    mà không ảnh hưởng toàn bộ BorrowRecord.
 */
@Entity
@Table(name = "borrow_details")
@SQLDelete(sql = "UPDATE borrow_details SET deleted = 1, updated_at = NOW() WHERE id = ?")
@SQLRestriction("deleted = 0")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"borrowRecord", "book"})
public class BorrowDetail extends BaseEntity {

    /**
     * OWNING side — @ManyToOne với BorrowRecord.
     * LAZY để tránh load toàn bộ BorrowRecord khi chỉ cần Detail.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "borrow_record_id", nullable = false)
    private BorrowRecord borrowRecord;

    /**
     * OWNING side — @ManyToOne với Book.
     * LAZY: chỉ load Book khi cần (tránh N+1 khi list nhiều Detail).
     *
     * Có thể null trong JPQL context nếu Book bị soft-delete do @SQLRestriction.
     * → Luôn dùng snapshotTitle / snapshotCoverUrl khi hiển thị lịch sử.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    // ================================================================
    // SNAPSHOT — lưu thông tin sách tại thời điểm mượn
    // Mục đích: bảo tồn lịch sử khi admin soft-delete sách sau này.
    // ================================================================

    /**
     * Tên sách tại thời điểm tạo phiếu mượn.
     * Được điền tự động bởi BorrowService.createBorrowRequest().
     */
    @Column(name = "snapshot_title", length = 255)
    private String snapshotTitle;

    /** Ảnh bìa tại thời điểm tạo phiếu. */
    @Column(name = "snapshot_cover_url", length = 500)
    private String snapshotCoverUrl;

    /** ISBN tại thời điểm tạo phiếu. */
    @Column(name = "snapshot_isbn", length = 20)
    private String snapshotIsbn;
}
